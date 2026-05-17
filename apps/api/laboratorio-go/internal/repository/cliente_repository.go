package repository

import (
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type ClienteRepository interface {
	FindAll() ([]models.Cliente, error)
	FindByID(id uint) (*models.Cliente, error)
	Create(cliente *models.Cliente) error
	Update(cliente *models.Cliente) error
	Delete(id uint) error
}

type clienteRepository struct {
	db *gorm.DB
}

func NewClienteRepository(db *gorm.DB) ClienteRepository {
	return &clienteRepository{db: db}
}

func (r *clienteRepository) FindAll() ([]models.Cliente, error) {
	var clientes []models.Cliente
	result := r.db.Find(&clientes)
	return clientes, result.Error
}

func (r *clienteRepository) FindByID(id uint) (*models.Cliente, error) {
	var cliente models.Cliente
	result := r.db.First(&cliente, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &cliente, nil
}

func (r *clienteRepository) Create(cliente *models.Cliente) error {
	return r.db.Create(cliente).Error
}

func (r *clienteRepository) Update(cliente *models.Cliente) error {
	return r.db.Save(cliente).Error
}

func (r *clienteRepository) Delete(id uint) error {
	return r.db.Delete(&models.Cliente{}, id).Error
}
