package model

import (
	"crypto/rand"
	"fmt"
	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
	"time"
)

type Affiliate struct {
	ID                    int       `gorm:"primarykey" json:"id"`
	Email                 string    `gorm:"uniqueIndex;not null" json:"email"`
	Password              string    `gorm:"not null" json:"-"`
	AffiliateCode         string    `gorm:"uniqueIndex;not null" json:"affiliate_code"`
	UsdtWallet            string    `gorm:"not null" json:"usdt_wallet"`
	FullName              string    `json:"full_name"`
	TelegramHandle        string    `json:"telegram_handle"`
	CommissionRate        float64   `gorm:"type:decimal(5,4);default:0.30;not null" json:"commission_rate"` // 0.0000 - 1.0000
	SecondLevelRate       float64   `gorm:"type:decimal(5,4);default:0.05;not null" json:"second_level_rate"` // 5% comisión de level 2
	ReferredCount         int       `gorm:"default:0" json:"referred_count"`
	TotalEarned           float64   `gorm:"type:decimal(15,2);default:0" json:"total_earned"`
	TotalPaid             float64   `gorm:"type:decimal(15,2);default:0" json:"total_paid"`
	MinimumWithdrawal     float64   `gorm:"type:decimal(15,2);default:100" json:"minimum_withdrawal"` // Mínimo para cobrar
	FraudScore            int       `gorm:"default:0" json:"fraud_score"` // Score de fraude (0-100)
	FraudLocked           bool      `gorm:"default:false" json:"fraud_locked"` // Bloqueado por sospecha de fraude
	Status                string    `gorm:"default:'active'" json:"status"` // active, suspended, banned
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
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

// AffiliateWithdrawal tracks withdrawal requests
type AffiliateWithdrawal struct {
	ID          int       `gorm:"primarykey" json:"id"`
	AffiliateID int       `gorm:"not null;index" json:"affiliate_id"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Status      string    `gorm:"default:'pending'" json:"status"` // pending, approved, paid, rejected
	Wallet      string    `gorm:"not null" json:"wallet"` // USDT wallet address
	TxHash      string    `json:"tx_hash,omitempty"` // Transaction hash
	RequestedAt time.Time `json:"requested_at"`
	ProcessedAt *time.Time `json:"processed_at,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// AffiliateFraudLog tracks potential fraud attempts
type AffiliateFraudLog struct {
	ID          int       `gorm:"primarykey" json:"id"`
	AffiliateID int       `gorm:"index" json:"affiliate_id"`
	UserID      int       `gorm:"index" json:"user_id"`
	Reason      string    `json:"reason"` // same_ip, same_device, rapid_signups, etc
	Score       int       `json:"score"` // Points added to fraud score
	CreatedAt   time.Time `json:"created_at"`
}

func (Affiliate) TableName() string {
	return "affiliates"
}

func (AffiliateCommission) TableName() string {
	return "affiliate_commissions"
}

func (AffiliateWithdrawal) TableName() string {
	return "affiliate_withdrawals"
}

func (AffiliateFraudLog) TableName() string {
	return "affiliate_fraud_logs"
}

func GetAffiliateByEmail(email string) (*Affiliate, error) {
	var affiliate Affiliate
	err := DB.Where("email = ?", email).First(&affiliate).Error
	return &affiliate, err
}

// CreateAffiliateForUser creates an affiliate record for a new user
func CreateAffiliateForUser(user *User) error {
	if user == nil || user.Email == "" {
		return nil
	}

	// Check if affiliate already exists
	var existing Affiliate
	if err := DB.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		return nil // Already exists, no error
	}

	// Use user's AffCode if available, otherwise use ID
	affCode := user.AffCode
	if affCode == "" {
		affCode = generateAffiliateCodeForUser(user.Id)
	}

	affiliate := Affiliate{
		Email:          user.Email,
		Password:       "", // Empty for users registered through main system
		AffiliateCode:  affCode,
		UsdtWallet:     "",
		FullName:       user.DisplayName,
		CommissionRate: 0.30, // 30% default
		CreatedAt:      time.Now(),
	}

	return DB.Create(&affiliate).Error
}

// generateAffiliateCodeForUser generates a unique affiliate code based on user ID
func generateAffiliateCodeForUser(userID int) string {
	// Simple format: aff_<userid>_<randomstring>
	code := fmt.Sprintf("aff_%d_%s", userID, generateShortCode())
	return code
}

// generateShortCode generates a short random code
func generateShortCode() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	randBytes := make([]byte, 6)
	if _, err := rand.Read(randBytes); err != nil {
		return "RANDOM"
	}
	for i := range b {
		b[i] = charset[randBytes[i]%byte(len(charset))]
	}
	return string(b)
}

// RecordAffiliateCommissionTx records affiliate commission with multi-level support
func RecordAffiliateCommissionTx(tx *gorm.DB, userID int, topupAmount float64) error {
	// Validate topupAmount
	if topupAmount <= 0 {
		return nil // Invalid amount, skip commission
	}

	user, err := GetUserById(userID, false)
	if err != nil || user.InviterId == 0 {
		return nil // Not an error, just no inviter
	}

	inviter, err := GetUserById(user.InviterId, false)
	if err != nil {
		return nil // Not an error, inviter doesn't exist
	}

	var affiliate *Affiliate
	affiliate, err = GetAffiliateByEmail(inviter.Email)
	if err != nil {
		// Create affiliate automatically if doesn't exist
		affiliate = &Affiliate{
			Email:             inviter.Email,
			Password:          "",
			AffiliateCode:     inviter.AffCode,
			UsdtWallet:        "",
			FullName:          inviter.DisplayName,
			CommissionRate:    0.30,
			SecondLevelRate:   0.05,
			MinimumWithdrawal: 100,
			Status:            "active",
			CreatedAt:         time.Now(),
		}
		if err := tx.Create(affiliate).Error; err != nil {
			return nil // Don't fail transaction if affiliate creation fails
		}
	}

	// Check if affiliate is suspended or banned
	if affiliate.Status != "active" || affiliate.FraudLocked {
		return nil // Don't process commissions for suspended/locked affiliates
	}

	// Validate commission rate
	if affiliate.CommissionRate < 0 || affiliate.CommissionRate > 1 {
		common.SysError("Invalid commission rate for affiliate " + affiliate.Email)
		return nil
	}

	// Calculate tier bonus (more referrals = higher commission)
	tierBonus := calculateTierBonus(affiliate.ReferredCount)
	finalCommissionRate := affiliate.CommissionRate * (1 + tierBonus)
	if finalCommissionRate > 0.5 { // Cap at 50%
		finalCommissionRate = 0.5
	}

	commissionAmount := topupAmount * finalCommissionRate
	commission := AffiliateCommission{
		AffiliateID: affiliate.ID,
		UserID:      userID,
		Amount:      commissionAmount,
		TopupAmount: topupAmount,
		Paid:        false,
	}

	if err := tx.Create(&commission).Error; err != nil {
		return err
	}

	// Update affiliate totals
	if err := tx.Model(affiliate).
		Update("total_earned", gorm.Expr("total_earned + ?", commissionAmount)).
		Error; err != nil {
		return err
	}

	// MULTI-LEVEL: Process second level commission (5% of first level)
	if inviter.InviterId > 0 {
		secondLevelInviter, err := GetUserById(inviter.InviterId, false)
		if err == nil {
			secondLevelAffiliate, err := GetAffiliateByEmail(secondLevelInviter.Email)
			if err == nil && secondLevelAffiliate.Status == "active" && !secondLevelAffiliate.FraudLocked {
				secondLevelAmount := commissionAmount * secondLevelAffiliate.SecondLevelRate
				secondLevelCommission := AffiliateCommission{
					AffiliateID: secondLevelAffiliate.ID,
					UserID:      userID,
					Amount:      secondLevelAmount,
					TopupAmount: topupAmount,
					Paid:        false,
				}
				if err := tx.Create(&secondLevelCommission).Error; err == nil {
					tx.Model(secondLevelAffiliate).
						Update("total_earned", gorm.Expr("total_earned + ?", secondLevelAmount))
				}
			}
		}
	}

	return nil
}

// calculateTierBonus calculates commission bonus based on referral count
func calculateTierBonus(referredCount int) float64 {
	if referredCount >= 100 {
		return 0.50 // 50% bonus (total 80% commission)
	} else if referredCount >= 50 {
		return 0.33 // 33% bonus (total 60% commission)
	} else if referredCount >= 20 {
		return 0.20 // 20% bonus (total 50% commission)
	} else if referredCount >= 10 {
		return 0.10 // 10% bonus (total 40% commission)
	}
	return 0.0 // No bonus
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

// UpdateAffiliateReferredCount updates the referred count for an affiliate
func UpdateAffiliateReferredCount(userID int) error {
	var count int64
	if err := DB.Model(&User{}).Where("inviter_id = ?", userID).Count(&count).Error; err != nil {
		return err
	}
	return DB.Model(&Affiliate{}).Where("email = (SELECT email FROM users WHERE id = ?)", userID).
		Update("referred_count", count).Error
}

// DetectFraud checks for fraud patterns and updates fraud score
func DetectFraud(affiliateID int, newUserID int, ipAddress string, deviceID string) error {
	affiliate, err := GetAffiliateByUser(affiliateID)
	if err != nil {
		return nil
	}

	fraudScore := 0
	var fraudReasons []string

	// Check 1: Multiple accounts from same affiliate in short time
	var recentCount int64
	DB.Model(&User{}).
		Where("inviter_id = ? AND created_at > ?", affiliateID, time.Now().UnixMilli()-24*3600*1000).
		Count(&recentCount)
	if recentCount > 5 {
		fraudScore += 25
		fraudReasons = append(fraudReasons, "rapid_signups")
	}

	// Check 2: Same device for multiple accounts
	if deviceID != "" {
		var sameDeviceCount int64
		DB.Model(&User{}).
			Where("inviter_id = ?", affiliateID).
			Where("id != ?", newUserID).
			Count(&sameDeviceCount)
		if sameDeviceCount > 2 {
			fraudScore += 30
			fraudReasons = append(fraudReasons, "same_device_multiple_accounts")
		}
	}

	// Check 3: New user has very few activities (likely fake)
	newUser, _ := GetUserById(newUserID, false)
	if newUser != nil && newUser.UsedQuota == 0 {
		createdTime := time.UnixMilli(newUser.CreatedAt)
		if time.Since(createdTime) > 24*time.Hour {
			fraudScore += 15
			fraudReasons = append(fraudReasons, "no_usage_24h")
		}
	}

	// Check 4: Rapid recharges from referred accounts
	var rapidRechargeCount int64
	DB.Model(&User{}).
		Where("inviter_id = ? AND last_login_at > ?", affiliateID, time.Now().UnixMilli()-3600*1000).
		Count(&rapidRechargeCount)
	if rapidRechargeCount > 3 {
		fraudScore += 20
		fraudReasons = append(fraudReasons, "rapid_recharges")
	}

	if fraudScore > 0 {
		// Log fraud attempt
		fraudLog := AffiliateFraudLog{
			AffiliateID: affiliateID,
			UserID:      newUserID,
			Reason:      fmt.Sprintf("%v", fraudReasons),
			Score:       fraudScore,
		}
		DB.Create(&fraudLog)

		// Update affiliate fraud score
		newScore := affiliate.FraudScore + fraudScore
		if newScore >= 100 {
			DB.Model(&Affiliate{}).Where("id = ?", affiliateID).
				Updates(map[string]interface{}{
					"fraud_score":   newScore,
					"fraud_locked":  true,
					"status":        "suspended",
				})
			common.SysLog(fmt.Sprintf("Affiliate %d suspended due to fraud (score: %d)", affiliateID, newScore))
		} else if newScore >= 60 {
			DB.Model(&Affiliate{}).Where("id = ?", affiliateID).
				Update("status", "under_review")
		} else {
			DB.Model(&Affiliate{}).Where("id = ?", affiliateID).
				Update("fraud_score", newScore)
		}
	}

	return nil
}

// GetAffiliateByUser gets affiliate by user ID
func GetAffiliateByUser(userID int) (*Affiliate, error) {
	user, err := GetUserById(userID, false)
	if err != nil {
		return nil, err
	}
	return GetAffiliateByEmail(user.Email)
}

// GetAvailableCommissions calculates available commissions for withdrawal
func GetAvailableCommissions(affiliateID int) (float64, error) {
	var total float64
	err := DB.Model(&AffiliateCommission{}).
		Where("affiliate_id = ? AND paid = false", affiliateID).
		Select("COALESCE(SUM(amount), 0)").
		Row().Scan(&total)
	return total, err
}

// RequestWithdrawal creates a withdrawal request
func RequestWithdrawal(affiliateID int, amount float64, wallet string) error {
	affiliate := &Affiliate{}
	if err := DB.Where("id = ?", affiliateID).First(affiliate).Error; err != nil {
		return err
	}

	if amount < affiliate.MinimumWithdrawal {
		return fmt.Errorf("amount must be at least %.2f", affiliate.MinimumWithdrawal)
	}

	available, _ := GetAvailableCommissions(affiliateID)
	if available < amount {
		return fmt.Errorf("insufficient balance: %.2f available", available)
	}

	withdrawal := AffiliateWithdrawal{
		AffiliateID: affiliateID,
		Amount:      amount,
		Status:      "pending",
		Wallet:      wallet,
		RequestedAt: time.Now(),
	}

	return DB.Create(&withdrawal).Error
}

// ApproveWithdrawal approves a withdrawal request
func ApproveWithdrawal(withdrawalID int, txHash string) error {
	withdrawal := &AffiliateWithdrawal{}
	if err := DB.Where("id = ?", withdrawalID).First(withdrawal).Error; err != nil {
		return err
	}

	now := time.Now()
	return DB.Model(withdrawal).Updates(map[string]interface{}{
		"status":       "paid",
		"tx_hash":      txHash,
		"processed_at": now,
	}).Error
}

// MarkCommissionsAsPaid marks commissions as paid for a withdrawal
func MarkCommissionsAsPaid(affiliateID int, amount float64) error {
	return DB.Model(&AffiliateCommission{}).
		Where("affiliate_id = ? AND paid = false", affiliateID).
		Update("paid", true).Error
}
