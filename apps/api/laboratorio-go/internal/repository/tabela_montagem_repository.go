package repository

import (
	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type TabelaMontagemRepository interface {
	FindAll(page, limit int, search string) ([]models.TabelaMontagem, int64, error)
	FindByID(id uint) (*models.TabelaMontagem, error)
	Create(tabela *models.TabelaMontagem) error
	Update(tabela *models.TabelaMontagem) error
	Delete(id uint) error
}

type tabelaMontagemRepository struct {
	db *gorm.DB
}

func NewTabelaMontagemRepository(db *gorm.DB) TabelaMontagemRepository {
	return &tabelaMontagemRepository{db: db}
}

func (r *tabelaMontagemRepository) FindAll(page, limit int, search string) ([]models.TabelaMontagem, int64, error) {
	var tabelas []models.TabelaMontagem
	var total int64

	query := r.db.Model(&models.TabelaMontagem{}).Preload("Cliente")
	if search != "" {
		query = query.Joins("JOIN clientes ON clientes.id = tabelas_montagem.cliente_id").
			Where("clientes.nome ILIKE ? OR tabelas_montagem.servico ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Limit(limit).Offset(offset).Find(&tabelas).Error; err != nil {
		return nil, 0, err
	}

	return tabelas, total, nil
}

func (r *tabelaMontagemRepository) FindByID(id uint) (*models.TabelaMontagem, error) {
	var tabela models.TabelaMontagem
	result := r.db.Preload("Cliente").First(&tabela, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &tabela, nil
}

func (r *tabelaMontagemRepository) Create(tabela *models.TabelaMontagem) error {
	return r.db.Create(tabela).Error
}

func (r *tabelaMontagemRepository) Update(tabela *models.TabelaMontagem) error {
	return r.db.Save(tabela).Error
}

func (r *tabelaMontagemRepository) Delete(id uint) error {
	return r.db.Delete(&models.TabelaMontagem{}, id).Error
}
