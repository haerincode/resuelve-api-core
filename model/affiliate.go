package model

import (
	"github.com/QuantumNous/new-api/common"
	"time"
)

type Affiliate struct {
	ID             int       `gorm:"primarykey" json:"id"`
	Email          string    `gorm:"uniqueIndex;not null" json:"email"`
	Password       string    `gorm:"not null" json:"-"`
	AffiliateCode  string    `gorm:"uniqueIndex;not null" json:"affiliate_code"`
	UsdtWallet     string    `gorm:"not null" json:"usdt_wallet"`
	FullName       string    `json:"full_name"`
	TelegramHandle string    `json:"telegram_handle"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
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

	commissionAmount := topupAmount * 0.30
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
