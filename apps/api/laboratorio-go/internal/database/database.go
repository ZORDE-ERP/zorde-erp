package database

import (
	"github.com/zorde/api/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Usuario{},
		&models.SolicitacaoCadastro{},
		&models.Cliente{},
		&models.Fornecedor{},
		&models.TabelaMontagem{},
		&models.OrdemDeServico{},
		&models.Autenticacao{},
	)
}
