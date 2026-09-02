package model

import (
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

func init() {
	if DB == nil {
		return
	}

	// Auto-migrate affiliate tables
	if err := DB.AutoMigrate(&Affiliate{}, &AffiliateCommission{}); err != nil {
		panic("failed to migrate affiliate tables: " + err.Error())
	}
}
