package repository

import (
	"context"

	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type AutenticacaoRepository interface {
	Create(ctx context.Context, auth *models.Autenticacao) error
	FindByRefreshToken(ctx context.Context, token string) (*models.Autenticacao, error)
	UpdateRefreshToken(ctx context.Context, id uint, newToken string) error
	UpdateStatusToOffline(ctx context.Context, token string) error
}

type autenticacaoRepository struct {
	db *gorm.DB
}

func NewAutenticacaoRepository(db *gorm.DB) AutenticacaoRepository {
	return &autenticacaoRepository{db: db}
}

func (r *autenticacaoRepository) Create(ctx context.Context, auth *models.Autenticacao) error {
	return r.db.WithContext(ctx).Create(auth).Error
}

func (r *autenticacaoRepository) FindByRefreshToken(ctx context.Context, token string) (*models.Autenticacao, error) {
	var auth models.Autenticacao
	err := r.db.WithContext(ctx).Preload("Usuario").Where("refresh_token = ?", token).First(&auth).Error
	if err != nil {
		return nil, err
	}
	return &auth, nil
}

func (r *autenticacaoRepository) UpdateRefreshToken(ctx context.Context, id uint, newToken string) error {
	return r.db.WithContext(ctx).Model(&models.Autenticacao{}).Where("id = ?", id).Update("refresh_token", newToken).Error
}

func (r *autenticacaoRepository) UpdateStatusToOffline(ctx context.Context, token string) error {
	return r.db.WithContext(ctx).Model(&models.Autenticacao{}).Where("refresh_token = ?", token).Update("status", models.StatusOffline).Error
}
