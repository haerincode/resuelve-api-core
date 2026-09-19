package service

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/go-redis/redis/v8"
)

// StreamJob represents streaming chat completion job queued for worker processing
type StreamJob struct {
	ID        string          `json:"id"`
	RequestID string          `json:"request_id"`
	UserID    int             `json:"user_id"`
	ChannelID int             `json:"channel_id"`
	ModelName string          `json:"model_name"`
	Request   json.RawMessage `json:"request"`
	CreatedAt int64           `json:"created_at"`
}

var queueName = "resuelve:stream_jobs"

func init() {
	if name := common.GetEnvOrDefaultString("QUEUE_NAME", ""); name != "" {
		queueName = name
	}
}

// QueueStreamJob Push job to Redis queue for worker pickup
func QueueStreamJob(job *StreamJob) error {
	data, err := json.Marshal(job)
	if err != nil {
		return fmt.Errorf("failed to marshal job: %w", err)
	}

	if !common.RedisEnabled {
		return fmt.Errorf("Redis not enabled, cannot queue job")
	}

	err = common.RedisLPush(queueName, string(data))
	if err != nil {
		return fmt.Errorf("failed to push job to queue: %w", err)
	}

	if common.DebugEnabled {
		common.SysLog(fmt.Sprintf("Queued job %s for worker processing", job.ID))
	}

	return nil
}

// DequeueStreamJob Blocking pop job from Redis queue (worker side)
func DequeueStreamJob(timeout time.Duration) (*StreamJob, error) {
	if !common.RedisEnabled {
		return nil, fmt.Errorf("Redis not enabled, cannot dequeue job")
	}

	data, err := common.RedisBRPop(queueName, timeout)
	if err != nil {
		if err == redis.Nil {
			// Timeout, no job available
			return nil, redis.Nil
		}
		return nil, fmt.Errorf("failed to pop job from queue: %w", err)
	}

	var job StreamJob
	err = json.Unmarshal([]byte(data), &job)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal job: %w", err)
	}

	if common.DebugEnabled {
		common.SysLog(fmt.Sprintf("Dequeued job %s from queue", job.ID))
	}

	return &job, nil
}

// GetQueueLength Get current queue length
func GetQueueLength() (int64, error) {
	if !common.RedisEnabled {
		return 0, fmt.Errorf("Redis not enabled")
	}

	return common.RedisLLen(queueName)
}

// AppendTaskChunk Append SSE chunk to Redis list (worker writes, client polls)
func AppendTaskChunk(taskID, chunk string) error {
	if !common.RedisEnabled {
		return fmt.Errorf("Redis not enabled")
	}

	key := "task:chunks:" + taskID
	err := common.RedisRPush(key, chunk)
	if err != nil {
		return fmt.Errorf("failed to append chunk: %w", err)
	}

	// Set 10min expiry
	err = common.RedisExpire(key, 10*time.Minute)
	if err != nil {
		return fmt.Errorf("failed to set expiry: %w", err)
	}

	return nil
}

// GetTaskChunks Get all chunks for task (client polling)
func GetTaskChunks(taskID string) ([]string, error) {
	if !common.RedisEnabled {
		return nil, fmt.Errorf("Redis not enabled")
	}

	key := "task:chunks:" + taskID
	chunks, err := common.RedisLRange(key, 0, -1)
	if err != nil {
		return nil, fmt.Errorf("failed to get chunks: %w", err)
	}

	return chunks, nil
}

// ClearTaskChunks Delete chunks after client retrieves them
func ClearTaskChunks(taskID string) error {
	if !common.RedisEnabled {
		return fmt.Errorf("Redis not enabled")
	}

	key := "task:chunks:" + taskID
	return common.RedisDel(key)
}
