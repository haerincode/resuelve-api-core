package migrations

import (
	"github.com/QuantumNous/new-api/model"
	"gorm.io/gorm"
)

func init() {
	AddMigration(&Migration{
		ID: "202609150001_create_payment_tables",
		Migrate: func(db *gorm.DB) error {
			// Create payment_flows table
			if err := db.AutoMigrate(&model.PaymentFlow{}); err != nil {
				return err
			}

			// Create payment_nowpayments table
			if err := db.AutoMigrate(&model.PaymentNOWPayments{}); err != nil {
				return err
			}

			// Create payment_webhook_logs table
			if err := db.AutoMigrate(&model.PaymentWebhookLog{}); err != nil {
				return err
			}

			return nil
		},
		Rollback: func(db *gorm.DB) error {
			return db.Migrator().DropTable(
				&model.PaymentFlow{},
				&model.PaymentNOWPayments{},
				&model.PaymentWebhookLog{},
			)
		},
	})
}
