package models

import (
	"time"

	"gorm.io/gorm"
)

type OrdemDeServico struct {
	ID               uint           `gorm:"primaryKey;autoIncrement"`
	CodigoOS         string         `gorm:"not null"`
	ClienteID        uint           `gorm:"not null"`
	Cliente          Cliente        `gorm:"foreignKey:ClienteID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	Valor            *float64       ``
	TabelaMontagemID *uint          `gorm:"default:null"`
	TabelaMontagem   TabelaMontagem `gorm:"foreignKey:TabelaMontagemID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	UsuarioID        uint           `gorm:"not null"`
	Usuario          Usuario        `gorm:"foreignKey:UsuarioID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	CreatedAt        time.Time      `gorm:"autoCreateTime"`
	UpdatedAt        *time.Time     `gorm:"autoUpdateTime"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (OrdemDeServico) TableName() string {
	return "ordens_de_servico"
}
