package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type TopupWebhookRequest struct {
	UserID int     `json:"user_id" binding:"required"`
	Amount float64 `json:"amount" binding:"required"`
}

func HandleTopupWebhook(c *gin.Context) {
	var req TopupWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user
	user, err := model.GetUserById(req.UserID, false)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if user was referred
	if user.InviterId == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "User not referred, no commission"})
		return
	}

	// Get inviter user
	inviter, err := model.GetUserById(user.InviterId, false)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inviter user not found"})
		return
	}

	// Get affiliate by inviter email
	affiliate, err := model.GetAffiliateByEmail(inviter.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Affiliate not found for inviter"})
		return
	}

	// Calculate 30% commission
	commissionAmount := req.Amount * 0.30

	// Create commission record
	commission := model.AffiliateCommission{
		AffiliateID: affiliate.ID,
		UserID:      req.UserID,
		Amount:      commissionAmount,
		TopupAmount: req.Amount,
		Paid:        false,
	}

	if err := model.DB.Create(&commission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create commission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Commission recorded",
		"affiliate_id": affiliate.ID,
		"amount":       commissionAmount,
	})
}
