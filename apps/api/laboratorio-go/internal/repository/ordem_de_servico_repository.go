package repository

import (
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type OrdemDeServicoRepository interface {
	FindAll() ([]models.OrdemDeServico, error)
	FindByID(id uint) (*models.OrdemDeServico, error)
	Create(ordem *models.OrdemDeServico) error
	Update(ordem *models.OrdemDeServico) error
	Delete(id uint) error
}

type ordemDeServicoRepository struct {
	db *gorm.DB
}

func NewOrdemDeServicoRepository(db *gorm.DB) OrdemDeServicoRepository {
	return &ordemDeServicoRepository{db: db}
}

func (r *ordemDeServicoRepository) FindAll() ([]models.OrdemDeServico, error) {
	var ordens []models.OrdemDeServico
	result := r.db.Preload("Cliente").Preload("TabelaMontagem").Find(&ordens)
	return ordens, result.Error
}

func (r *ordemDeServicoRepository) FindByID(id uint) (*models.OrdemDeServico, error) {
	var ordem models.OrdemDeServico
	result := r.db.Preload("Cliente").Preload("TabelaMontagem").First(&ordem, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &ordem, nil
}

func (r *ordemDeServicoRepository) Create(ordem *models.OrdemDeServico) error {
	return r.db.Create(ordem).Error
}

func (r *ordemDeServicoRepository) Update(ordem *models.OrdemDeServico) error {
	return r.db.Save(ordem).Error
}

func (r *ordemDeServicoRepository) Delete(id uint) error {
	return r.db.Delete(&models.OrdemDeServico{}, id).Error
}
