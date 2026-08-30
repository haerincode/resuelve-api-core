package controller

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/oauth"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/console_setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/gin-gonic/gin"
)

func TestStatus(c *gin.Context) {
	err := model.PingDB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"message": "数据库连接失败",
		})
		return
	}
	// 获取HTTP统计信息
	httpStats := middleware.GetStats()
	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Server is running",
		"http_stats": httpStats,
	})
	return
}

func GetStatus(c *gin.Context) {

	cs := console_setting.GetConsoleSetting()
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()

	passkeySetting := system_setting.GetPasskeySettings()
	legalSetting := system_setting.GetLegalSettings()

	data := gin.H{
		"version":                     common.Version,
		"start_time":                  common.StartTime,
		"email_verification":          common.EmailVerificationEnabled,
		"github_oauth":                common.GitHubOAuthEnabled,
		"github_client_id":            common.GitHubClientId,
		"discord_oauth":               system_setting.GetDiscordSettings().Enabled,
		"discord_client_id":           system_setting.GetDiscordSettings().ClientId,
		"linuxdo_oauth":               common.LinuxDOOAuthEnabled,
		"linuxdo_client_id":           common.LinuxDOClientId,
		"linuxdo_minimum_trust_level": common.LinuxDOMinimumTrustLevel,
		"telegram_oauth":              common.TelegramOAuthEnabled,
		"telegram_bot_name":           common.TelegramBotName,
		"theme":                       "default",
		"system_name":                 common.SystemName,
		"logo":                        common.Logo,
		"footer_html":                 common.Footer,
		"wechat_qrcode":               common.WeChatAccountQRCodeImageURL,
		"wechat_login":                common.WeChatAuthEnabled,
		"server_address":              system_setting.ServerAddress,
		"turnstile_check":             common.TurnstileCheckEnabled,
		"turnstile_site_key":          common.TurnstileSiteKey,
		"docs_link":                   operation_setting.GetGeneralSetting().DocsLink,
		"quota_per_unit":              common.QuotaPerUnit,
		// 兼容旧前端：保留 display_in_currency，同时提供新的 quota_display_type
		"display_in_currency":           operation_setting.IsCurrencyDisplay(),
		"quota_display_type":            operation_setting.GetQuotaDisplayType(),
		"custom_currency_symbol":        operation_setting.GetGeneralSetting().CustomCurrencySymbol,
		"custom_currency_exchange_rate": operation_setting.GetGeneralSetting().CustomCurrencyExchangeRate,
		"enable_batch_update":           common.BatchUpdateEnabled,
		"enable_drawing":                common.DrawingEnabled,
		"enable_task":                   common.TaskEnabled,
		"enable_data_export":            common.DataExportEnabled,
		"data_export_default_time":      common.DataExportDefaultTime,
		"default_collapse_sidebar":      common.DefaultCollapseSidebar,
		"mj_notify_enabled":             setting.MjNotifyEnabled,
		"chats":                         setting.Chats,
		"demo_site_enabled":             operation_setting.DemoSiteEnabled,
		"self_use_mode_enabled":         operation_setting.SelfUseModeEnabled,
		"register_enabled":              common.RegisterEnabled,
		"password_login_enabled":        common.PasswordLoginEnabled,
		"password_register_enabled":     common.PasswordRegisterEnabled,
		"default_use_auto_group":        setting.DefaultUseAutoGroup,

		"usd_exchange_rate": operation_setting.USDExchangeRate,
		"price":             operation_setting.Price,
		"stripe_unit_price": setting.StripeUnitPrice,

		// 面板启用开关
		"api_info_enabled":      cs.ApiInfoEnabled,
		"uptime_kuma_enabled":   cs.UptimeKumaEnabled,
		"announcements_enabled": cs.AnnouncementsEnabled,
		"faq_enabled":           cs.FAQEnabled,

		// 模块管理配置
		"HeaderNavModules":    common.OptionMap["HeaderNavModules"],
		"SidebarModulesAdmin": common.OptionMap["SidebarModulesAdmin"],

		"oidc_enabled":                system_setting.GetOIDCSettings().Enabled,
		"oidc_client_id":              system_setting.GetOIDCSettings().ClientId,
		"oidc_authorization_endpoint": system_setting.GetOIDCSettings().AuthorizationEndpoint,
		"oidc_display_name":           system_setting.GetOIDCSettings().GetEffectiveDisplayName(),
		"passkey_login":               passkeySetting.Enabled,
		"passkey_display_name":        passkeySetting.RPDisplayName,
		"passkey_rp_id":               passkeySetting.RPID,
		"passkey_origins":             passkeySetting.Origins,
		"passkey_allow_insecure":      passkeySetting.AllowInsecureOrigin,
		"passkey_user_verification":   passkeySetting.UserVerification,
		"passkey_attachment":          passkeySetting.AttachmentPreference,
		"setup":                       constant.Setup,
		"user_agreement_enabled":      legalSetting.UserAgreement != "",
		"privacy_policy_enabled":      legalSetting.PrivacyPolicy != "",
		"checkin_enabled":             operation_setting.GetCheckinSetting().Enabled,
	}

	// 根据启用状态注入可选内容
	if cs.ApiInfoEnabled {
		data["api_info"] = console_setting.GetApiInfo()
	}
	if cs.AnnouncementsEnabled {
		data["announcements"] = console_setting.GetAnnouncements()
	}
	if cs.FAQEnabled {
		data["faq"] = console_setting.GetFAQ()
	}

	// Add enabled custom OAuth providers
	customProviders := oauth.GetEnabledCustomProviders()
	if len(customProviders) > 0 {
		type CustomOAuthInfo struct {
			Id                    int    `json:"id"`
			Name                  string `json:"name"`
			Slug                  string `json:"slug"`
			Icon                  string `json:"icon"`
			ClientId              string `json:"client_id"`
			AuthorizationEndpoint string `json:"authorization_endpoint"`
			Scopes                string `json:"scopes"`
		}
		providersInfo := make([]CustomOAuthInfo, 0, len(customProviders))
		for _, p := range customProviders {
			config := p.GetConfig()
			providersInfo = append(providersInfo, CustomOAuthInfo{
				Id:                    config.Id,
				Name:                  config.Name,
				Slug:                  config.Slug,
				Icon:                  config.Icon,
				ClientId:              config.ClientId,
				AuthorizationEndpoint: config.AuthorizationEndpoint,
				Scopes:                config.Scopes,
			})
		}
		data["custom_oauth_providers"] = providersInfo
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    data,
	})
	return
}

func GetNotice(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    common.OptionMap["Notice"],
	})
	return
}

func GetAbout(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    common.OptionMap["About"],
	})
	return
}

func GetUserAgreement(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    system_setting.GetLegalSettings().UserAgreement,
	})
	return
}

func GetPrivacyPolicy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    system_setting.GetLegalSettings().PrivacyPolicy,
	})
	return
}

func GetMidjourney(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    common.OptionMap["Midjourney"],
	})
	return
}

func GetHomePageContent(c *gin.Context) {
	common.OptionMapRWMutex.RLock()
	defer common.OptionMapRWMutex.RUnlock()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    common.OptionMap["HomePageContent"],
	})
	return
}

func SendEmailVerification(c *gin.Context) {
	email := model.NormalizeEmail(c.Query("email"))
	if err := common.Validate.Var(email, "required,email"); err != nil {
		common.ApiErrorI18n(c, i18n.MsgInvalidParams)
		return
	}
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的邮箱地址",
		})
		return
	}
	localPart := parts[0]
	domainPart := parts[1]
	if common.EmailDomainRestrictionEnabled {
		allowed := false
		for _, domain := range common.EmailDomainWhitelist {
			if domainPart == domain {
				allowed = true
				break
			}
		}
		if !allowed {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "The administrator has enabled the email domain name whitelist, and your email address is not allowed due to special symbols or it's not in the whitelist.",
			})
			return
		}
	}
	if common.EmailAliasRestrictionEnabled {
		containsSpecialSymbols := strings.Contains(localPart, "+") || strings.Contains(localPart, ".")
		if containsSpecialSymbols {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "El administrador ha habilitado la restricción de alias de correo, su dirección fue rechazada por contener símbolos especiales.",
			})
			return
		}
	}

	if model.IsEmailAlreadyTaken(email) {
		common.ApiErrorI18n(c, i18n.MsgUserEmailAlreadyTaken)
		return
	}
	code := common.GenerateVerificationCode(6)
	common.RegisterVerificationCodeWithKey(email, code, common.EmailVerificationPurpose)
	subject := fmt.Sprintf("Verificación de correo — %s", common.SystemName)
	content := fmt.Sprintf(`<div style="background:#1a1a1a;color:#e0e0e0;padding:40px 20px;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#2a2a2a;border-radius:12px;padding:32px">
    <h1 style="color:#e79055;margin:0 0 24px;font-size:28px">Resuelve-API</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Hola,</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Estás verificando tu correo electrónico en <strong>%s</strong>.</p>
    <div style="background:#1a1a1a;border:2px solid #56a97a;border-radius:8px;padding:20px;text-align:center;margin:24px 0">
      <div style="font-size:13px;color:#999;margin-bottom:8px">Tu código de verificación</div>
      <div style="font-size:32px;font-weight:700;color:#56a97a;letter-spacing:4px;font-family:monospace">%s</div>
    </div>
    <p style="font-size:14px;color:#bbb;margin:24px 0 0">Este código es válido por <strong>%d minutos</strong>. Si no solicitaste esta verificación, ignora este correo.</p>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #444;font-size:13px;color:#999;text-align:center">
      Resuelve-API · Infraestructura de IA en Chile para LatAm · <a href="https://resuelve-api.lat" style="color:#e79055;text-decoration:none">resuelve-api.lat</a>
    </div>
  </div>
</div>`, common.SystemName, code, common.VerificationValidMinutes)
	err := common.SendEmail(subject, email, content)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
	return
}

func SendPasswordResetEmail(c *gin.Context) {
	email := model.NormalizeEmail(c.Query("email"))
	if err := common.Validate.Var(email, "required,email"); err != nil {
		common.ApiErrorI18n(c, i18n.MsgInvalidParams)
		return
	}
	if _, err := model.GetUniqueUserByEmail(email); err == nil {
		code := common.GenerateVerificationCode(0)
		common.RegisterVerificationCodeWithKey(email, code, common.PasswordResetPurpose)
		link := fmt.Sprintf("%s/user/reset?email=%s&token=%s", system_setting.ServerAddress, email, code)
		subject := fmt.Sprintf("Restablecimiento de contraseña — %s", common.SystemName)
		content := fmt.Sprintf(`<div style="background:#1a1a1a;color:#e0e0e0;padding:40px 20px;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#2a2a2a;border-radius:12px;padding:32px">
    <h1 style="color:#e79055;margin:0 0 24px;font-size:28px">Resuelve-API</h1>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Hola,</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Solicitaste restablecer tu contraseña en <strong>%s</strong>.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="%s" style="display:inline-block;background:#e79055;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:16px">Restablecer contraseña</a>
    </div>
    <p style="font-size:14px;color:#bbb;margin:24px 0 0">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p style="background:#1a1a1a;padding:12px;border-radius:6px;font-size:13px;color:#56a97a;word-break:break-all;font-family:monospace;margin:12px 0 24px">%s</p>
    <p style="font-size:14px;color:#bbb;margin:0">Este enlace es válido por <strong>%d minutos</strong>. Si no solicitaste este restablecimiento, ignora este correo.</p>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #444;font-size:13px;color:#999;text-align:center">
      Resuelve-API · Infraestructura de IA en Chile para LatAm · <a href="https://resuelve-api.lat" style="color:#e79055;text-decoration:none">resuelve-api.lat</a>
    </div>
  </div>
</div>`, common.SystemName, link, link, common.VerificationValidMinutes)
		err := common.SendEmail(subject, email, content)
		if err != nil {
			logger.LogError(c.Request.Context(), fmt.Sprintf("failed to send password reset email to %s: %s", email, err.Error()))
		}
	} else if err != nil && !errors.Is(err, model.ErrEmailNotFound) {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("skip password reset email for %s: %s", email, err.Error()))
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
}

type PasswordResetRequest struct {
	Email string `json:"email"`
	Token string `json:"token"`
}

func ResetPassword(c *gin.Context) {
	var req PasswordResetRequest
	err := json.NewDecoder(c.Request.Body).Decode(&req)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	req.Email = model.NormalizeEmail(req.Email)
	if req.Email == "" || req.Token == "" {
		common.ApiErrorI18n(c, i18n.MsgInvalidParams)
		return
	}
	if !common.VerifyCodeWithKey(req.Email, req.Token, common.PasswordResetPurpose) {
		common.ApiErrorI18n(c, i18n.MsgUserPasswordResetLinkInvalid)
		return
	}
	password := common.GenerateVerificationCode(12)
	err = model.ResetUserPasswordByEmail(req.Email, password)
	if err != nil {
		if errors.Is(err, model.ErrEmailNotFound) || errors.Is(err, model.ErrEmailAmbiguous) {
			common.ApiErrorI18n(c, i18n.MsgUserPasswordResetLinkInvalid)
			return
		}
		common.ApiError(c, err)
		return
	}
	common.DeleteKey(req.Email, common.PasswordResetPurpose)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    password,
	})
	return
}
