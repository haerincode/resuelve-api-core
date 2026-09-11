package common

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"
)

const (
	// WebhookTimestampTolerance defines the acceptable age of a webhook (5 minutes)
	WebhookTimestampTolerance = 5 * time.Minute
	// WebhookTimestampFutureTolerance defines acceptable future timestamps (1 minute)
	WebhookTimestampFutureTolerance = 1 * time.Minute
	// WebhookDeduplicationTTL defines how long to remember processed webhook IDs (24 hours)
	WebhookDeduplicationTTL = 24 * time.Hour
)

// ValidateWebhookTimestamp verifies that the webhook is not too old or from the future.
// timestamp should be Unix time in seconds.
func ValidateWebhookTimestamp(timestamp int64) error {
	now := time.Now().Unix()
	age := now - timestamp

	if age > int64(WebhookTimestampTolerance.Seconds()) {
		return fmt.Errorf("webhook timestamp too old: age=%ds", age)
	}
	if age < int64(-WebhookTimestampFutureTolerance.Seconds()) {
		return fmt.Errorf("webhook timestamp in future: age=%ds", age)
	}
	return nil
}

// ValidateWebhookTimestampUnix validates a Unix timestamp in seconds.
// This is a convenience wrapper for ValidateWebhookTimestamp.
func ValidateWebhookTimestampUnix(unixSeconds int64) error {
	return ValidateWebhookTimestamp(unixSeconds)
}

// ValidateWebhookTimestampFromString parses a string timestamp and validates it.
// Supports both Unix seconds (numeric string) and RFC3339 formats.
func ValidateWebhookTimestampFromString(timestampStr string) error {
	if timestampStr == "" {
		return errors.New("webhook timestamp is empty")
	}

	// Try to parse as Unix seconds first
	if unixSeconds, err := strconv.ParseInt(timestampStr, 10, 64); err == nil {
		return ValidateWebhookTimestamp(unixSeconds)
	}

	// Try RFC3339 format
	t, err := time.Parse(time.RFC3339, timestampStr)
	if err != nil {
		return fmt.Errorf("failed to parse webhook timestamp: %w", err)
	}

	return ValidateWebhookTimestamp(t.Unix())
}

// CheckAndMarkWebhookProcessed checks if a webhook event has already been processed
// and marks it as processed. Returns nil if the event is new and successfully marked,
// or an error if it was already processed or if the operation failed.
//
// If Redis is not enabled, this function returns nil (skips deduplication).
func CheckAndMarkWebhookProcessed(eventID string) error {
	if !RedisEnabled {
		// Without Redis, rely on database-level locks and status validation
		return nil
	}

	if eventID == "" {
		return errors.New("webhook event ID is empty")
	}

	key := "webhook:processed:" + eventID

	// Use Redis SET with NX (only set if not exists) to atomically check and mark
	// Return value: true if key was set (first time), false if key already exists
	exists, err := redisSetNX(key, "1", WebhookDeduplicationTTL)
	if err != nil {
		return fmt.Errorf("failed to check webhook deduplication: %w", err)
	}

	if !exists {
		return fmt.Errorf("webhook event already processed: event_id=%s", eventID)
	}

	return nil
}

// redisSetNX sets a key only if it doesn't exist (NX option).
// Returns true if the key was set, false if it already existed.
func redisSetNX(key string, value string, expiration time.Duration) (bool, error) {
	if !RedisEnabled || RDB == nil {
		return true, nil
	}

	ctx := context.Background()
	result, err := RDB.SetNX(ctx, key, value, expiration).Result()
	if err != nil {
		return false, err
	}

	return result, nil
}
