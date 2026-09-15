package service

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/model"
)

const (
	FlowAPIURL = "https://www.flow.cl/api/payment"
	USD_TO_CLP = 1000
)

type FlowService struct {
	APIKey    string
	SecretKey string
	CallbackURL string
	ReturnURL string
}

type FlowCreateResponse struct {
	URL   string `json:"url"`
	Token string `json:"token"`
}

type FlowStatusResponse struct {
	Status         int    `json:"status"`
	CommerceOrder  string `json:"commerceOrder"`
	Amount         string `json:"amount"`
	FlowOrder      int64  `json:"flowOrder"`
	Email          string `json:"email"`
	RequestDate    string `json:"requestDate"`
	PaymentDate    string `json:"paymentDate"`
	PaymentNetwork string `json:"paymentNetwork"`
	PaymentType    string `json:"paymentType"`
	TransactionId  string `json:"transactionId"`
	PucNumber      string `json:"pucNumber"`
	ReceiptNumber  string `json:"receiptNumber"`
	Pending        bool   `json:"pending"`
	ConversionDate string `json:"conversionDate"`
	ConversionRate string `json:"conversionRate"`
}

// NewFlowService creates Flow payment service instance
func NewFlowService(apiKey, secretKey, callbackURL, returnURL string) *FlowService {
	return &FlowService{
		APIKey:      apiKey,
		SecretKey:   secretKey,
		CallbackURL: callbackURL,
		ReturnURL:   returnURL,
	}
}

// CreatePayment initiates Flow payment and returns redirect URL
func (fs *FlowService) CreatePayment(orderID string, amountUSD float64, email, productName string) (string, error) {
	amountCLP := int64(amountUSD * USD_TO_CLP)

	params := map[string]interface{}{
		"apiKey":           fs.APIKey,
		"commerceOrder":    orderID,
		"subject":          fmt.Sprintf("Recarga Saldo Resuelve-API ($%.2f USD)", amountUSD),
		"currency":         "CLP",
		"amount":           strconv.FormatInt(amountCLP, 10),
		"email":            email,
		"urlConfirmation":  fs.CallbackURL,
		"urlReturn":        fs.ReturnURL,
		"optional":         `{"Servicio":"Recarga de saldo en tokens"}`,
	}

	// Generate signature
	signature := model.SignFlow(params, fs.SecretKey)
	params["s"] = signature

	// Send request to Flow
	data := url.Values{}
	for k, v := range params {
		data.Set(k, fmt.Sprintf("%v", v))
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.PostForm(FlowAPIURL+"/create", data)
	if err != nil {
		return "", fmt.Errorf("flow api error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("flow api status %d: %s", resp.StatusCode, string(body))
	}

	var result FlowCreateResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("flow parse error: %w", err)
	}

	if result.URL == "" {
		return "", fmt.Errorf("flow returned empty url")
	}

	return fmt.Sprintf("%s?token=%s", result.URL, result.Token), nil
}

// GetPaymentStatus checks payment status with Flow API
func (fs *FlowService) GetPaymentStatus(token string) (*FlowStatusResponse, error) {
	params := map[string]interface{}{
		"apiKey": fs.APIKey,
		"token":  token,
	}

	// Generate signature
	signature := model.SignFlow(params, fs.SecretKey)
	params["s"] = signature

	// Build query string
	query := url.Values{}
	for k, v := range params {
		query.Set(k, fmt.Sprintf("%v", v))
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(FlowAPIURL + "/getStatus?" + query.Encode())
	if err != nil {
		return nil, fmt.Errorf("flow status error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("flow status %d: %s", resp.StatusCode, string(body))
	}

	var result FlowStatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("flow status parse error: %w", err)
	}

	return &result, nil
}

// IsPaymentSuccessful checks if Flow payment status indicates success
func (fs *FlowService) IsPaymentSuccessful(status *FlowStatusResponse) bool {
	return status.Status == 2 && !status.Pending
}
