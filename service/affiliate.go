package service

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

// TriggerAffiliateCommission triggers affiliate commission calculation for a topup
func TriggerAffiliateCommission(userID int, amount float64) {
	// Get user
	user, err := model.GetUserById(userID, false)
	if err != nil || user.InviterId == 0 {
		return // No inviter or error, skip silently
	}

	// Get inviter user
	inviter, err := model.GetUserById(user.InviterId, false)
	if err != nil {
		return
	}

	// Get affiliate by inviter email
	affiliate, err := model.GetAffiliateByEmail(inviter.Email)
	if err != nil {
		return // Inviter not an affiliate
	}

	// Calculate 30% commission
	commissionAmount := amount * 0.30

	// Create commission record
	commission := model.AffiliateCommission{
		AffiliateID: affiliate.ID,
		UserID:      userID,
		Amount:      commissionAmount,
		TopupAmount: amount,
		Paid:        false,
	}

	if err := model.DB.Create(&commission).Error; err != nil {
		common.SysError("Failed to create affiliate commission: " + err.Error())
	}
}
