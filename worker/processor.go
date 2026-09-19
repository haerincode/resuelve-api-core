package worker

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
)

// ProcessStreamJob Process streaming chat completion job without HTTP timeout
// Simplified: direct upstream request, no Gin context gymnastics
func ProcessStreamJob(job *service.StreamJob) error {
	startTime := time.Now()

	// Load task from DB
	task, exist, err := model.GetByTaskId(job.UserID, job.ID)
	if err != nil {
		return fmt.Errorf("failed to get task: %w", err)
	}
	if !exist {
		return fmt.Errorf("task %s not found", job.ID)
	}

	// Update status to IN_PROGRESS
	task.Status = model.TaskStatusInProgress
	task.StartTime = time.Now().Unix()
	err = task.Update()
	if err != nil {
		common.SysError(fmt.Sprintf("Failed to update task %s status: %v", job.ID, err))
	}

	// Load channel
	channel, err := model.GetChannelById(job.ChannelID, true)
	if err != nil {
		return updateTaskFailure(task, fmt.Sprintf("channel not found: %v", err))
	}

	// Get channel key
	key, _, newAPIError := channel.GetNextEnabledKey()
	if newAPIError != nil {
		return updateTaskFailure(task, fmt.Sprintf("no available channel key: %v", newAPIError.Error()))
	}

	// Build upstream request (no timeout context)
	ctx := context.Background()
	baseURL := channel.GetBaseURL()
	upstreamURL := baseURL + "/v1/chat/completions"

	req, err := http.NewRequestWithContext(ctx, "POST", upstreamURL, bytes.NewReader(job.Request))
	if err != nil {
		return updateTaskFailure(task, fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Accept", "text/event-stream")

	// Make request with shared HTTP client (no timeout)
	client := service.GetHttpClient()
	resp, err := client.Do(req)
	if err != nil {
		return updateTaskFailure(task, fmt.Sprintf("upstream request failed: %v", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return updateTaskFailure(task, fmt.Sprintf("upstream error %d: %s", resp.StatusCode, string(body)))
	}

	// Stream SSE chunks to Redis
	scanner := bufio.NewScanner(resp.Body)
	chunkCount := 0
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			chunkCount++
			err = service.AppendTaskChunk(job.ID, line)
			if err != nil {
				common.SysError(fmt.Sprintf("Failed to append chunk for task %s: %v", job.ID, err))
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return updateTaskFailure(task, fmt.Sprintf("stream read error: %v", err))
	}

	// Update task success
	task.Status = model.TaskStatusSuccess
	task.FinishTime = time.Now().Unix()
	task.Progress = "100%"
	err = task.Update()
	if err != nil {
		common.SysError(fmt.Sprintf("Failed to update task %s completion: %v", job.ID, err))
	}

	duration := time.Since(startTime)
	common.SysLog(fmt.Sprintf("Job %s completed in %v (%d chunks)", job.ID, duration, chunkCount))

	return nil
}

func updateTaskFailure(task *model.Task, reason string) error {
	task.Status = model.TaskStatusFailure
	task.FailReason = reason
	task.FinishTime = time.Now().Unix()
	err := task.Update()
	if err != nil {
		common.SysError(fmt.Sprintf("Failed to update task %s failure: %v", task.TaskID, err))
	}
	return fmt.Errorf(reason)
}
