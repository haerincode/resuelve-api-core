package controller

import (
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// TopupWebhook estructura para webhook de recargas
type TopupWebhookPayload struct {
	UserID  int `json:"user_id" binding:"required"`
	Amount  int `json:"amount" binding:"required"`
	TopupID int `json:"topup_id"`
}

// ProcessAffiliateCommission procesa comisión cuando usuario referido recarga
func ProcessAffiliateCommission(c *gin.Context) {
	var payload TopupWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}

	// Obtener usuario que recargó
	user, err := model.GetUserById(payload.UserID, false)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	// Verificar si tiene inviter
	if user.InviterId == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Usuario sin inviter",
		})
		return
	}

	// Calcular comisión (30%)
	commissionRate := 0.30
	commissionAmount := int(float64(payload.Amount) * commissionRate)

	if commissionAmount <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Comisión cero",
		})
		return
	}

	// Actualizar stats del inviter
	err = model.DB.Model(&model.User{}).
		Where("id = ?", user.InviterId).
		Updates(map[string]interface{}{
			"aff_quota":         model.DB.Raw("aff_quota + ?", commissionAmount),
			"aff_history_quota": model.DB.Raw("aff_history_quota + ?", commissionAmount),
		}).Error

	if err != nil {
		logger.SysLog(fmt.Sprintf("Error updating affiliate commission for inviter %d: %v", user.InviterId, err))
		common.ApiError(c, err)
		return
	}

	// Insertar registro de comisión en tabla commissions si existe
	// (tabla creada por affiliate_system.sql)
	_, _ = model.DB.Exec(`
		INSERT INTO commissions (user_id, inviter_id, amount, source_type, source_id, commission_rate, status, created_at)
		VALUES (?, ?, ?, 'topup', ?, ?, 'pending', ?)
	`, payload.UserID, user.InviterId, commissionAmount, payload.TopupID, commissionRate*100, common.GetTimestamp())

	logger.SysLog(fmt.Sprintf("Affiliate commission processed: user=%d inviter=%d amount=%d topup=%d",
		payload.UserID, user.InviterId, commissionAmount, payload.TopupID))

	c.JSON(http.StatusOK, gin.H{
		"success":           true,
		"commission_amount": commissionAmount,
		"inviter_id":        user.InviterId,
	})
}
