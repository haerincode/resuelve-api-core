package model

import (
	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
	"time"
)

type Affiliate struct {
	ID              int       `gorm:"primarykey" json:"id"`
	Email           string    `gorm:"uniqueIndex;not null" json:"email"`
	Password        string    `gorm:"not null" json:"-"`
	AffiliateCode   string    `gorm:"uniqueIndex;not null" json:"affiliate_code"`
	UsdtWallet      string    `gorm:"not null" json:"usdt_wallet"`
	FullName        string    `json:"full_name"`
	TelegramHandle  string    `json:"telegram_handle"`
	CommissionRate  float64   `gorm:"type:decimal(5,4);default:0.30;not null" json:"commission_rate"` // 0.0000 - 1.0000 (0% - 100%)
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type AffiliateCommission struct {
	ID          int        `gorm:"primarykey" json:"id"`
	AffiliateID int        `gorm:"not null;index" json:"affiliate_id"`
	Affiliate   Affiliate  `gorm:"foreignKey:AffiliateID" json:"affiliate,omitempty"`
	UserID      int        `gorm:"not null;index" json:"user_id"`
	Amount      float64    `gorm:"not null" json:"amount"`
	TopupAmount float64    `gorm:"not null" json:"topup_amount"`
	Paid        bool       `gorm:"default:false;index" json:"paid"`
	PaidAt      *time.Time `json:"paid_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (Affiliate) TableName() string {
	return "affiliates"
}

func (AffiliateCommission) TableName() string {
	return "affiliate_commissions"
}

func GetAffiliateByEmail(email string) (*Affiliate, error) {
	var affiliate Affiliate
	err := DB.Where("email = ?", email).First(&affiliate).Error
	return &affiliate, err
}

// RecordAffiliateCommissionTx records affiliate commission within a transaction (prevents race conditions)
func RecordAffiliateCommissionTx(tx *gorm.DB, userID int, topupAmount float64) error {
	user, err := GetUserById(userID, false)
	if err != nil || user.InviterId == 0 {
		return nil // Not an error, just no inviter
	}

	inviter, err := GetUserById(user.InviterId, false)
	if err != nil {
		return nil // Not an error, inviter doesn't exist
	}

	affiliate, err := GetAffiliateByEmail(inviter.Email)
	if err != nil {
		return nil // Not an error, inviter is not an affiliate
	}

	// Validate commission rate
	if affiliate.CommissionRate < 0 || affiliate.CommissionRate > 1 {
		common.SysError("Invalid commission rate for affiliate " + affiliate.Email)
		return nil
	}

	commissionAmount := topupAmount * affiliate.CommissionRate
	commission := AffiliateCommission{
		AffiliateID: affiliate.ID,
		UserID:      userID,
		Amount:      commissionAmount,
		TopupAmount: topupAmount,
		Paid:        false,
	}

	if err := tx.Create(&commission).Error; err != nil {
		return err // Propagate error to fail transaction
	}

	return nil
}

// RecordAffiliateCommission is deprecated - use RecordAffiliateCommissionTx inside transaction
// Kept for backward compatibility only
func RecordAffiliateCommission(userID int, topupAmount float64) {
	user, err := GetUserById(userID, false)
	if err != nil || user.InviterId == 0 {
		return
	}

	inviter, err := GetUserById(user.InviterId, false)
	if err != nil {
		return
	}

	affiliate, err := GetAffiliateByEmail(inviter.Email)
	if err != nil {
		return
	}

	// Validate commission rate
	if affiliate.CommissionRate < 0 || affiliate.CommissionRate > 1 {
		affiliate.CommissionRate = 0.30 // Default fallback
	}

	commissionAmount := topupAmount * affiliate.CommissionRate
	commission := AffiliateCommission{
		AffiliateID: affiliate.ID,
		UserID:      userID,
		Amount:      commissionAmount,
		TopupAmount: topupAmount,
		Paid:        false,
	}

	if err := DB.Create(&commission).Error; err != nil {
		common.SysError("Failed to create affiliate commission: " + err.Error())
	}
}
