package repository

import (
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type FornecedorRepository interface {
	FindAll() ([]models.Fornecedor, error)
	FindByID(id uint) (*models.Fornecedor, error)
	Create(fornecedor *models.Fornecedor) error
	Update(fornecedor *models.Fornecedor) error
	Delete(id uint) error
}

type fornecedorRepository struct {
	db *gorm.DB
}

func NewFornecedorRepository(db *gorm.DB) FornecedorRepository {
	return &fornecedorRepository{db: db}
}

func (r *fornecedorRepository) FindAll() ([]models.Fornecedor, error) {
	var fornecedores []models.Fornecedor
	result := r.db.Find(&fornecedores)
	return fornecedores, result.Error
}

func (r *fornecedorRepository) FindByID(id uint) (*models.Fornecedor, error) {
	var fornecedor models.Fornecedor
	result := r.db.First(&fornecedor, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &fornecedor, nil
}

func (r *fornecedorRepository) Create(fornecedor *models.Fornecedor) error {
	return r.db.Create(fornecedor).Error
}

func (r *fornecedorRepository) Update(fornecedor *models.Fornecedor) error {
	return r.db.Save(fornecedor).Error
}

func (r *fornecedorRepository) Delete(id uint) error {
	return r.db.Delete(&models.Fornecedor{}, id).Error
}
