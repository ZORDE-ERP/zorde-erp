package repository

import (
	"time"

	"github.com/zorde/api/internal/models"
	"gorm.io/gorm"
)

type UsuarioRepository interface {
	Create(u *models.Usuario) error
	FindAll() ([]models.Usuario, error)
	FindByID(id uint) (*models.Usuario, error)
	FindByEmail(email string) (*models.Usuario, error)
	Update(u *models.Usuario) error
	UpdateUltimoAcesso(id uint, data *time.Time) error
	Delete(id uint) error
}

type usuarioRepository struct {
	db *gorm.DB
}

func NewUsuarioRepository(db *gorm.DB) UsuarioRepository {
	return &usuarioRepository{db: db}
}

func (r *usuarioRepository) Create(u *models.Usuario) error {
	return r.db.Create(u).Error
}

func (r *usuarioRepository) FindAll() ([]models.Usuario, error) {
	var usuarios []models.Usuario
	return usuarios, r.db.Find(&usuarios).Error
}

func (r *usuarioRepository) FindByID(id uint) (*models.Usuario, error) {
	var u models.Usuario
	if err := r.db.First(&u, id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *usuarioRepository) FindByEmail(email string) (*models.Usuario, error) {
	var u models.Usuario
	if err := r.db.Where("email = ?", email).First(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *usuarioRepository) Update(u *models.Usuario) error {
	return r.db.Save(u).Error
}

func (r *usuarioRepository) UpdateUltimoAcesso(id uint, data *time.Time) error {
	return r.db.Model(&models.Usuario{}).Where("id = ?", id).Update("ultimo_acesso", data).Error
}

func (r *usuarioRepository) Delete(id uint) error {
	return r.db.Delete(&models.Usuario{}, id).Error
}
