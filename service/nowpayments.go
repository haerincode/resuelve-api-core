package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/model"
)

const (
	NOWPaymentsAPIURL = "https://api.nowpayments.io/v1"
)

type NOWPaymentsService struct {
	APIKey    string
	IPNSecret string
	CallbackURL string
	SuccessURL string
	CancelURL  string
}

type NOWPaymentsCreateRequest struct {
	PriceAmount     float64 `json:"price_amount"`
	PriceCurrency   string  `json:"price_currency"`
	OrderID         string  `json:"order_id"`
	OrderDescription string  `json:"order_description"`
	CustomerEmail   string  `json:"customer_email"`
	IPNCallbackURL  string  `json:"ipn_callback_url"`
	SuccessURL      string  `json:"success_url"`
	CancelURL       string  `json:"cancel_url"`
	PayCurrency     string  `json:"pay_currency,omitempty"`
}

type NOWPaymentsCreateResponse struct {
	InvoiceID  string  `json:"invoice_id"`
	InvoiceURL string  `json:"invoice_url"`
	OrderID    string  `json:"order_id"`
	Amount     float64 `json:"amount"`
	Status     string  `json:"status"`
}

type NOWPaymentsWebhookPayload struct {
	PaymentStatus  string  `json:"payment_status"`
	OrderID        string  `json:"order_id"`
	PriceAmount    float64 `json:"price_amount"`
	PriceCurrency  string  `json:"price_currency"`
	PayCurrency    string  `json:"pay_currency"`
	ActuallyPaid   float64 `json:"actually_paid"`
	PaymentID      int     `json:"payment_id"`
	InvoiceID      string  `json:"invoice_id"`
	ConvertedAmount float64 `json:"converted_amount"`
	ConvertedCurrency string `json:"converted_currency"`
	Timestamp      int64   `json:"timestamp"`
	TXHash         string  `json:"tx_hash,omitempty"`
}

// NewNOWPaymentsService creates NOWPayments service instance
func NewNOWPaymentsService(apiKey, ipnSecret, callbackURL, successURL, cancelURL string) *NOWPaymentsService {
	return &NOWPaymentsService{
		APIKey:      apiKey,
		IPNSecret:   ipnSecret,
		CallbackURL: callbackURL,
		SuccessURL:  successURL,
		CancelURL:   cancelURL,
	}
}

// CreateInvoice creates NOWPayments invoice
func (ns *NOWPaymentsService) CreateInvoice(orderID string, amountUSD float64, email, description string, forceCrypto string) (*NOWPaymentsCreateResponse, error) {
	payload := NOWPaymentsCreateRequest{
		PriceAmount:      amountUSD,
		PriceCurrency:    "usd",
		OrderID:          orderID,
		OrderDescription: description,
		CustomerEmail:    email,
		IPNCallbackURL:   ns.CallbackURL,
		SuccessURL:       ns.SuccessURL,
		CancelURL:        ns.CancelURL,
	}

	if forceCrypto != "" {
		payload.PayCurrency = forceCrypto
	} else {
		payload.PayCurrency = "usdttrc20" // Default to USDT on Tron
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal error: %w", err)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("POST", NOWPaymentsAPIURL+"/invoice", bytes.NewReader(jsonData))
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", ns.APIKey)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("nowpayments api error: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("nowpayments api status %d: %s", resp.StatusCode, string(body))
	}

	var result NOWPaymentsCreateResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	if result.InvoiceURL == "" {
		return nil, fmt.Errorf("nowpayments returned empty invoice_url")
	}

	return &result, nil
}

// VerifyIPN verifies NOWPayments IPN webhook signature
func (ns *NOWPaymentsService) VerifyIPN(payload map[string]interface{}, signature string) bool {
	return model.VerifyNOWPaymentsSignature(payload, signature, ns.IPNSecret)
}

// ParseWebhookPayload parses NOWPayments webhook JSON into struct
func (ns *NOWPaymentsService) ParseWebhookPayload(data []byte) (*NOWPaymentsWebhookPayload, error) {
	var payload NOWPaymentsWebhookPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return nil, fmt.Errorf("parse webhook error: %w", err)
	}
	return &payload, nil
}

// IsPaymentConfirmed checks if payment is confirmed (not pending)
func (ns *NOWPaymentsService) IsPaymentConfirmed(status string) bool {
	return status == "confirmed" || status == "paid"
}

// IsPaymentFailed checks if payment failed or expired
func (ns *NOWPaymentsService) IsPaymentFailed(status string) bool {
	return status == "failed" || status == "expired" || status == "refunded"
}
