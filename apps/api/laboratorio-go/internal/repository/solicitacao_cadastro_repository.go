package repository

import (
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type SolicitacaoCadastroRepository interface {
	Create(s *models.SolicitacaoCadastro) error
	FindByEmail(email string) (*models.SolicitacaoCadastro, error)
	DeleteByEmail(email string) error
}

type solicitacaoCadastroRepository struct {
	db *gorm.DB
}

func NewSolicitacaoCadastroRepository(db *gorm.DB) SolicitacaoCadastroRepository {
	return &solicitacaoCadastroRepository{db: db}
}

func (r *solicitacaoCadastroRepository) Create(s *models.SolicitacaoCadastro) error {
	return r.db.Create(s).Error
}

func (r *solicitacaoCadastroRepository) FindByEmail(email string) (*models.SolicitacaoCadastro, error) {
	var s models.SolicitacaoCadastro
	if err := r.db.Where("email = ?", email).First(&s).Error; err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *solicitacaoCadastroRepository) DeleteByEmail(email string) error {
	return r.db.Where("email = ?", email).Delete(&models.SolicitacaoCadastro{}).Error
}
