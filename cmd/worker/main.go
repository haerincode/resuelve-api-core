package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/worker"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/go-redis/redis/v8"
)

func main() {
	startTime := time.Now()

	// Set timezone to America/Santiago
	location, tzErr := time.LoadLocation("America/Santiago")
	if tzErr != nil {
		common.SysLog("warning: failed to load America/Santiago timezone: " + tzErr.Error())
	} else {
		time.Local = location
		common.SysLog("timezone set to America/Santiago")
	}

	// Initialize resources (DB, Redis)
	err := InitWorkerResources()
	if err != nil {
		common.FatalLog("failed to initialize worker resources: " + err.Error())
		return
	}

	common.SysLog(fmt.Sprintf("Worker started in %v", time.Since(startTime)))

	defer func() {
		err := model.CloseDB()
		if err != nil {
			common.FatalLog("failed to close database: " + err.Error())
		}
	}()

	// Setup graceful shutdown
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
	defer cancel()

	// Process jobs
	ProcessJobs(ctx)

	common.SysLog("Worker shutdown complete")
}

func InitWorkerResources() error {
	// Load environment from .env file if exists
	if _, err := os.Stat(".env"); err == nil {
		common.SysLog("loading environment from .env file")
	}

	// Load TLS config before Redis init
	common.TLSInsecureSkipVerify = common.GetEnvOrDefaultBool("TLS_INSECURE_SKIP_VERIFY", false)
	if common.TLSInsecureSkipVerify {
		common.SysLog("TLS_INSECURE_SKIP_VERIFY enabled")
	}

	// Init database
	err := model.InitDB()
	if err != nil {
		return fmt.Errorf("failed to init database: %w", err)
	}
	common.SysLog("database initialized")

	// Init Redis
	err = common.InitRedisClient()
	if err != nil {
		return fmt.Errorf("failed to init Redis: %w", err)
	}

	if !common.RedisEnabled {
		return fmt.Errorf("Redis required for worker but not enabled")
	}

	// Init HTTP client for upstream requests
	service.InitHttpClient()
	common.SysLog("HTTP client initialized")

	return nil
}

func ProcessJobs(ctx context.Context) {
	concurrency := common.GetEnvOrDefault("WORKER_CONCURRENCY", 10)
	common.SysLog(fmt.Sprintf("Worker concurrency: %d", concurrency))

	// Semaphore for concurrency limit
	sem := make(chan struct{}, concurrency)

	for {
		select {
		case <-ctx.Done():
			common.SysLog("Shutdown signal received, waiting for jobs to complete...")
			// Wait for all jobs to complete
			for i := 0; i < concurrency; i++ {
				sem <- struct{}{}
			}
			return
		default:
			// Try to dequeue job (5s timeout)
			job, err := service.DequeueStreamJob(5 * time.Second)
			if err != nil {
				if err == redis.Nil {
					// Timeout, no job available, retry
					continue
				}
				common.SysError(fmt.Sprintf("Failed to dequeue job: %v", err))
				time.Sleep(1 * time.Second)
				continue
			}

			// Acquire semaphore slot
			sem <- struct{}{}

			// Process job in goroutine
			gopool.Go(func() {
				defer func() { <-sem }() // Release slot

				err := worker.ProcessStreamJob(job)
				if err != nil {
					common.SysError(fmt.Sprintf("Failed to process job %s: %v", job.ID, err))
				}
			})
		}
	}
}
