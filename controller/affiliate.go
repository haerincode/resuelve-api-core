package controller

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AffiliateRegisterRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8"`
	UsdtWallet      string `json:"usdt_wallet" binding:"required"`
	FullName        string `json:"full_name"`
	TelegramHandle  string `json:"telegram_handle"`
}

type AffiliateLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AffiliateUpdateWalletRequest struct {
	UsdtWallet string `json:"usdt_wallet" binding:"required"`
}

type MarkPaidRequest struct {
	CommissionIDs []int `json:"commission_ids" binding:"required"`
}

func generateAffiliateCode() (string, error) {
	b := make([]byte, 6)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return strings.ToUpper(base64.RawURLEncoding.EncodeToString(b)[:8]), nil
}

func GetUserAffiliateToken(c *gin.Context) {
	userID := c.GetInt("id")
	user, err := model.GetUserById(userID, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
		return
	}

	// Check if user has AffCode
	if user.AffCode == "" {
		user.AffCode = common.GetRandomString(4)
		if err := user.Update(false); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate affiliate code"})
			return
		}
	}

	// Check if affiliate account exists with this user's email
	affiliate := &model.Affiliate{}
	err = model.DB.Where("email = ?", user.Email).First(affiliate).Error
	if err != nil {
		// No affiliate account - redirect to registration
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"needs_registration": true,
			"email": user.Email,
			"affiliate_code": user.AffCode,
		})
		return
	}

	token, err := generateJWT(affiliate.ID, affiliate.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"needs_registration": false,
		"token": token,
		"email": affiliate.Email,
		"affiliate_code": affiliate.AffiliateCode,
	})
}

func generateJWT(affiliateID int, email string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default-jwt-secret-change-in-production"
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"affiliate_id": affiliateID,
		"email":        email,
		"exp":          time.Now().Add(24 * time.Hour).Unix(),
	})

	return token.SignedString([]byte(secret))
}

func RegisterAffiliate(c *gin.Context) {
	var req AffiliateRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email exists
	var existing model.Affiliate
	if err := model.DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate unique code
	code, err := generateAffiliateCode()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate code"})
		return
	}

	// Create affiliate
	affiliate := model.Affiliate{
		Email:          req.Email,
		Password:       string(hashedPassword),
		AffiliateCode:  code,
		UsdtWallet:     req.UsdtWallet,
		FullName:       req.FullName,
		TelegramHandle: req.TelegramHandle,
	}

	if err := model.DB.Create(&affiliate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create affiliate"})
		return
	}

	token, err := generateJWT(affiliate.ID, affiliate.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":          token,
		"affiliate_code": code,
		"email":          affiliate.Email,
	})
}

func AffiliateLogin(c *gin.Context) {
	var req AffiliateLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var affiliate model.Affiliate
	if err := model.DB.Where("email = ?", req.Email).First(&affiliate).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(affiliate.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := generateJWT(affiliate.ID, affiliate.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":          token,
		"affiliate_code": affiliate.AffiliateCode,
		"email":          affiliate.Email,
	})
}

func GetAffiliateDashboard(c *gin.Context) {
	affiliateID := c.GetInt("affiliate_id")

	var affiliate model.Affiliate
	if err := model.DB.First(&affiliate, affiliateID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Affiliate not found"})
		return
	}

	// Count referred users
	var referredCount int64
	model.DB.Model(&model.User{}).Where("inviter_id = ?", affiliateID).Count(&referredCount)

	// Sum commissions
	var totalEarned, totalPending float64
	model.DB.Model(&model.AffiliateCommission{}).
		Where("affiliate_id = ?", affiliateID).
		Select("COALESCE(SUM(amount), 0)").
		Row().Scan(&totalEarned)

	model.DB.Model(&model.AffiliateCommission{}).
		Where("affiliate_id = ? AND paid = false", affiliateID).
		Select("COALESCE(SUM(amount), 0)").
		Row().Scan(&totalPending)

	c.JSON(http.StatusOK, gin.H{
		"affiliate_code":  affiliate.AffiliateCode,
		"email":           affiliate.Email,
		"usdt_wallet":     affiliate.UsdtWallet,
		"full_name":       affiliate.FullName,
		"telegram_handle": affiliate.TelegramHandle,
		"referred_count":  referredCount,
		"total_earned":    totalEarned,
		"total_pending":   totalPending,
		"created_at":      affiliate.CreatedAt,
	})
}

func GetAffiliateCommissions(c *gin.Context) {
	affiliateID := c.GetInt("affiliate_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset := (page - 1) * limit

	var commissions []model.AffiliateCommission
	var total int64

	model.DB.Model(&model.AffiliateCommission{}).
		Where("affiliate_id = ?", affiliateID).
		Count(&total)

	if err := model.DB.Where("affiliate_id = ?", affiliateID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&commissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch commissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"commissions": commissions,
		"total":       total,
		"page":        page,
		"limit":       limit,
	})
}

func UpdateAffiliateWallet(c *gin.Context) {
	affiliateID := c.GetInt("affiliate_id")
	var req AffiliateUpdateWalletRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := model.DB.Model(&model.Affiliate{}).
		Where("id = ?", affiliateID).
		Update("usdt_wallet", req.UsdtWallet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update wallet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Wallet updated successfully"})
}

func GetAllAffiliates(c *gin.Context) {
	var affiliates []model.Affiliate

	if err := model.DB.Order("created_at DESC").Find(&affiliates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch affiliates"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"affiliates": affiliates})
}

func GetPendingCommissions(c *gin.Context) {
	var commissions []model.AffiliateCommission

	if err := model.DB.Preload("Affiliate").
		Where("paid = false").
		Order("created_at DESC").
		Find(&commissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending commissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"commissions": commissions})
}

func MarkCommissionsPaid(c *gin.Context) {
	var req MarkPaidRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := model.DB.Model(&model.AffiliateCommission{}).
		Where("id IN ?", req.CommissionIDs).
		Updates(map[string]interface{}{
			"paid":    true,
			"paid_at": time.Now(),
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark commissions as paid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Commissions marked as paid"})
}

func ExportPendingCommissions(c *gin.Context) {
	var commissions []model.AffiliateCommission

	if err := model.DB.Preload("Affiliate").
		Where("paid = false").
		Order("created_at DESC").
		Find(&commissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch commissions"})
		return
	}

	csv := "ID,Affiliate Email,USDT Wallet,Amount,User ID,Created At\n"
	for _, c := range commissions {
		csv += strconv.Itoa(c.ID) + "," +
			c.Affiliate.Email + "," +
			c.Affiliate.UsdtWallet + "," +
			strconv.FormatFloat(c.Amount, 'f', 2, 64) + "," +
			strconv.Itoa(c.UserID) + "," +
			c.CreatedAt.Format("2006-01-02 15:04:05") + "\n"
	}

	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=pending_commissions.csv")
	c.String(http.StatusOK, csv)
}
