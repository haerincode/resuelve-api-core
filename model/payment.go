package model

import (
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"
)

// Payment models

type PaymentFlow struct {
	ID               int       `gorm:"primarykey" json:"id"`
	OrderID          string    `gorm:"uniqueIndex;not null" json:"order_id"`
	UserID           int       `gorm:"not null;index" json:"user_id"`
	AmountUSD        float64   `gorm:"type:decimal(10,2);not null" json:"amount_usd"`
	AmountCLP        float64   `gorm:"type:decimal(15,2);not null" json:"amount_clp"`
	FlowToken        string    `json:"flow_token,omitempty"`
	FlowOrder        int64     `json:"flow_order,omitempty"`
	Status           string    `gorm:"default:'pending'" json:"status"` // pending, success, failed, cancelled
	Email            string    `json:"email"`
	FlowURL          string    `json:"flow_url,omitempty"`
	CreditsApplied   bool      `gorm:"default:false" json:"credits_applied"`
	CreditsAppliedAt *time.Time `json:"credits_applied_at,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type PaymentNOWPayments struct {
	ID               int        `gorm:"primarykey" json:"id"`
	OrderID          string     `gorm:"uniqueIndex;not null" json:"order_id"`
	UserID           int        `gorm:"not null;index" json:"user_id"`
	AmountUSD        float64    `gorm:"type:decimal(10,2);not null" json:"amount_usd"`
	InvoiceID        string     `json:"invoice_id"`
	InvoiceURL       string     `json:"invoice_url"`
	Status           string     `gorm:"default:'pending'" json:"status"` // pending, confirmed, paid, expired, refunded, failed
	Crypto           string     `json:"crypto"` // usdttrc20, etc
	Email            string     `json:"email"`
	CreditsApplied   bool       `gorm:"default:false" json:"credits_applied"`
	CreditsAppliedAt *time.Time `json:"credits_applied_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type PaymentWebhookLog struct {
	ID        int       `gorm:"primarykey" json:"id"`
	Provider  string    `gorm:"index" json:"provider"` // flow, nowpayments
	OrderID   string    `json:"order_id"`
	Signature string    `json:"signature"`
	Valid     bool      `json:"valid"`
	Payload   string    `gorm:"type:text" json:"payload"` // Raw JSON
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// TableName overrides

func (PaymentFlow) TableName() string {
	return "payment_flows"
}

func (PaymentNOWPayments) TableName() string {
	return "payment_nowpayments"
}

func (PaymentWebhookLog) TableName() string {
	return "payment_webhook_logs"
}

// Signing functions

// SignFlow generates HMAC-SHA256 signature for Flow API requests
// Algorithm: sort params alphabetically, concatenate key+value (no delimiters), hash
func SignFlow(params map[string]interface{}, secretKey string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		if k != "s" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	var toSign string
	for _, k := range keys {
		toSign += k + fmt.Sprintf("%v", params[k])
	}

	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(toSign))
	return hex.EncodeToString(h.Sum(nil))
}

// SignEpay generates MD5 signature for balance credit calls
// Algorithm: sort params, format k=v&k=v&...&KEY, hash with MD5
func SignEpay(params map[string]interface{}, key string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		if k != "sign" && k != "sign_type" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	var parts []string
	for _, k := range keys {
		v := params[k]
		if v == nil || v == "" {
			continue
		}
		parts = append(parts, fmt.Sprintf("%s=%v", k, v))
	}

	// Append key at end
	str := strings.Join(parts, "&") + "&" + key

	h := md5.New()
	h.Write([]byte(str))
	return hex.EncodeToString(h.Sum(nil))
}

// VerifyNOWPaymentsSignature verifies HMAC-SHA512 NOWPayments IPN signature
// Algorithm: recursively sort JSON body, stringify, hash with HMAC-SHA512
func VerifyNOWPaymentsSignature(body map[string]interface{}, receivedSig string, secret string) bool {
	sorted := sortObject(body)
	jsonBytes, err := json.Marshal(sorted)
	if err != nil {
		return false
	}

	h := hmac.New(sha512.New, []byte(secret))
	h.Write(jsonBytes)
	computed := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(computed), []byte(receivedSig))
}

// sortObject recursively sorts JSON object keys
func sortObject(obj map[string]interface{}) map[string]interface{} {
	keys := make([]string, 0, len(obj))
	for k := range obj {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	result := make(map[string]interface{})
	for _, k := range keys {
		v := obj[k]
		if nested, ok := v.(map[string]interface{}); ok {
			result[k] = sortObject(nested)
		} else {
			result[k] = v
		}
	}
	return result
}

// Database queries

// GetPaymentFlowByOrderID retrieves Flow payment by order ID
func GetPaymentFlowByOrderID(orderID string) (*PaymentFlow, error) {
	var payment PaymentFlow
	err := DB.Where("order_id = ?", orderID).First(&payment).Error
	return &payment, err
}

// GetPaymentNOWPaymentsByOrderID retrieves NOWPayments payment by order ID
func GetPaymentNOWPaymentsByOrderID(orderID string) (*PaymentNOWPayments, error) {
	var payment PaymentNOWPayments
	err := DB.Where("order_id = ?", orderID).First(&payment).Error
	return &payment, err
}

// LogWebhook logs incoming webhook for audit
func LogWebhook(provider, orderID, signature string, valid bool, payload string, status string) error {
	log := PaymentWebhookLog{
		Provider:  provider,
		OrderID:   orderID,
		Signature: signature,
		Valid:     valid,
		Payload:   payload,
		Status:    status,
	}
	return DB.Create(&log).Error
}
