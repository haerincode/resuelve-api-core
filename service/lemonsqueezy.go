package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	LemonSqueezyAPIURL = "https://api.lemonsqueezy.com/v1"
)

type LemonSqueezyService struct {
	APIKey        string
	SigningSecret string
	StoreID       string
	VariantID     string // Generic variant ID for custom pricing
}

// Checkout request structure
type LemonSqueezyCheckoutRequest struct {
	Data struct {
		Type       string `json:"type"`
		Attributes struct {
			CustomPrice int `json:"custom_price,omitempty"` // Price in cents
			CheckoutData struct {
				Email  string                 `json:"email,omitempty"`
				Custom map[string]interface{} `json:"custom,omitempty"`
			} `json:"checkout_data,omitempty"`
			CheckoutOptions struct {
				ButtonColor string `json:"button_color,omitempty"`
			} `json:"checkout_options,omitempty"`
		} `json:"attributes"`
		Relationships struct {
			Store struct {
				Data struct {
					Type string `json:"type"`
					ID   string `json:"id"`
				} `json:"data"`
			} `json:"store"`
			Variant struct {
				Data struct {
					Type string `json:"type"`
					ID   string `json:"id"`
				} `json:"data"`
			} `json:"variant"`
		} `json:"relationships"`
	} `json:"data"`
}

// Checkout response
type LemonSqueezyCheckoutResponse struct {
	Data struct {
		ID         string `json:"id"`
		Attributes struct {
			URL string `json:"url"`
		} `json:"attributes"`
	} `json:"data"`
}

// Webhook payload structure
type LemonSqueezyWebhook struct {
	Meta struct {
		EventName  string                 `json:"event_name"`
		CustomData map[string]interface{} `json:"custom_data"`
	} `json:"meta"`
	Data struct {
		Type       string `json:"type"`
		ID         string `json:"id"`
		Attributes struct {
			StoreID       int     `json:"store_id"`
			OrderNumber   int     `json:"order_number"`
			UserEmail     string  `json:"user_email"`
			Status        string  `json:"status"`
			Total         int     `json:"total"`
			TotalUsd      int     `json:"total_usd"`
			FirstOrderItem struct {
				Price int `json:"price"`
			} `json:"first_order_item"`
		} `json:"attributes"`
	} `json:"data"`
}

// NewLemonSqueezyService creates a new Lemon Squeezy service instance
func NewLemonSqueezyService(apiKey, signingSecret, storeID, variantID string) *LemonSqueezyService {
	return &LemonSqueezyService{
		APIKey:        apiKey,
		SigningSecret: signingSecret,
		StoreID:       storeID,
		VariantID:     variantID,
	}
}

// CreateCheckout creates a checkout session with custom price
func (s *LemonSqueezyService) CreateCheckout(amountUSD float64, userEmail string, userID int, tradeNo string) (*LemonSqueezyCheckoutResponse, error) {
	// Lemon Squeezy expects amount in cents
	amountCents := int(amountUSD * 100)

	var req LemonSqueezyCheckoutRequest

	req.Data.Type = "checkouts"
	req.Data.Attributes.CustomPrice = amountCents
	req.Data.Attributes.CheckoutData.Email = userEmail
	req.Data.Attributes.CheckoutData.Custom = map[string]interface{}{
		"user_id":  fmt.Sprintf("%d", userID),
		"trade_no": tradeNo,
	}
	req.Data.Attributes.CheckoutOptions.ButtonColor = "#7047EB"

	req.Data.Relationships.Store.Data.Type = "stores"
	req.Data.Relationships.Store.Data.ID = s.StoreID

	req.Data.Relationships.Variant.Data.Type = "variants"
	req.Data.Relationships.Variant.Data.ID = s.VariantID

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", LemonSqueezyAPIURL+"/checkouts", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+s.APIKey)
	httpReq.Header.Set("Content-Type", "application/vnd.api+json")
	httpReq.Header.Set("Accept", "application/vnd.api+json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var result LemonSqueezyCheckoutResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	return &result, nil
}

// VerifyWebhookSignature verifies the webhook signature
func (s *LemonSqueezyService) VerifyWebhookSignature(rawBody []byte, signature string) bool {
	if s.SigningSecret == "" || signature == "" {
		return false
	}

	mac := hmac.New(sha256.New, []byte(s.SigningSecret))
	mac.Write(rawBody)
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	// Constant time comparison to prevent timing attacks
	return hmac.Equal([]byte(expectedMAC), []byte(signature))
}

// IsPaymentConfirmed checks if the payment is confirmed
func (s *LemonSqueezyService) IsPaymentConfirmed(status string) bool {
	return status == "paid"
}

// ProcessWebhook processes incoming webhook and returns trade_no and user_id
func (s *LemonSqueezyService) ProcessWebhook(webhook *LemonSqueezyWebhook) (string, error) {
	// Extract trade_no from custom data
	tradeNo, ok := webhook.Meta.CustomData["trade_no"].(string)
	if !ok {
		// Fallback to generating one from order ID
		tradeNo = fmt.Sprintf("LS-%s", webhook.Data.ID)
	}

	return tradeNo, nil
}
