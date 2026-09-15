package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

// DirectFlowPayment creates order and redirects to Flow directly
func DirectFlowPayment(c *gin.Context) {
	var req EpayRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	if req.Amount < getMinTopup() {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", getMinTopup())})
		return
	}

	id := c.GetInt("id")
	if rejectInvalidTopUpQuota(c, id, req.Amount) {
		return
	}

	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	payMoney := getPayMoney(req.Amount, group)
	if payMoney < 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	tradeNo := fmt.Sprintf("%s%d", common.GetRandomString(6), time.Now().Unix())
	tradeNo = fmt.Sprintf("USR%dNO%s", id, tradeNo)

	amount := req.Amount
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		dAmount := decimal.NewFromInt(int64(amount))
		dQuotaPerUnit := decimal.NewFromFloat(common.QuotaPerUnit)
		amount = dAmount.Div(dQuotaPerUnit).IntPart()
	}

	// Get user email
	user, err := model.GetUserById(id, false)
	email := "contacto@resuelve-api.lat"
	if err == nil && user != nil && user.Email != "" {
		email = user.Email
	}

	// Create topup record
	topUp := &model.TopUp{
		UserId:          id,
		Amount:          amount,
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   "webpay",
		PaymentProvider: model.PaymentProviderEpay,
		CreateTime:      time.Now().Unix(),
		Status:          common.TopUpStatusPending,
	}
	err = topUp.Insert()
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("创建Flow充值订单失败 user_id=%d trade_no=%s amount=%d error=%q", id, tradeNo, req.Amount, err.Error()))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}

	// Create Flow payment
	redirectURL, err := flowService.CreatePayment(tradeNo, payMoney, email, "Recarga")
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("Flow payment creation failed: %v", err))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("Error al crear pago: %v", err)})
		return
	}

	logger.LogInfo(c.Request.Context(), fmt.Sprintf("Flow充值订单创建成功 user_id=%d trade_no=%s amount=%d money=%.2f redirect=%s", id, tradeNo, req.Amount, payMoney, redirectURL))

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data":    gin.H{"pay_url": redirectURL},
		"url":     redirectURL,
	})
}

// DirectCryptoPayment creates order and redirects to NOWPayments directly
func DirectCryptoPayment(c *gin.Context) {
	var req EpayRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	if !usdtEnabled {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "Pagos con criptomonedas no disponibles"})
		return
	}

	if req.Amount < getMinTopup() {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", getMinTopup())})
		return
	}

	id := c.GetInt("id")
	if rejectInvalidTopUpQuota(c, id, req.Amount) {
		return
	}

	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	payMoney := getPayMoney(req.Amount, group)
	if payMoney < 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	tradeNo := fmt.Sprintf("%s%d", common.GetRandomString(6), time.Now().Unix())
	tradeNo = fmt.Sprintf("USR%dNO%s", id, tradeNo)

	amount := req.Amount
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		dAmount := decimal.NewFromInt(int64(amount))
		dQuotaPerUnit := decimal.NewFromFloat(common.QuotaPerUnit)
		amount = dAmount.Div(dQuotaPerUnit).IntPart()
	}

	// Create topup record
	topUp := &model.TopUp{
		UserId:          id,
		Amount:          amount,
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   "crypto",
		PaymentProvider: model.PaymentProviderEpay,
		CreateTime:      time.Now().Unix(),
		Status:          common.TopUpStatusPending,
	}
	err = topUp.Insert()
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("创建Crypto充值订单失败 user_id=%d trade_no=%s amount=%d error=%q", id, tradeNo, req.Amount, err.Error()))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}

	// Create NOWPayments payment
	paymentURL, err := nowpaymentsService.CreatePayment(tradeNo, payMoney, "Recarga Resuelve-API")
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments creation failed: %v", err))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("Error al crear pago crypto: %v", err)})
		return
	}

	logger.LogInfo(c.Request.Context(), fmt.Sprintf("Crypto充值订单创建成功 user_id=%d trade_no=%s amount=%d money=%.2f redirect=%s", id, tradeNo, req.Amount, payMoney, paymentURL))

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data":    gin.H{"pay_url": paymentURL},
		"url":     paymentURL,
	})
}
