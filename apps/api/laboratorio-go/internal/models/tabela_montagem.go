package models

import (
	"time"

	"gorm.io/gorm"
)

type TabelaMontagem struct {
	ID        uint           `gorm:"primaryKey;autoIncrement"`
	ClienteID uint           `gorm:"not null"`
	Cliente   Cliente        `gorm:"foreignKey:ClienteID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	Servico   TipoServico    `gorm:"type:varchar(50);not null;check:servico IN ('MONTAGEM SIMPLES', 'PARAFUSO', 'TRANSPOSICAO', 'COLORACAO', 'SOMENTE ENCAIXAR')"`
	Valor     float64        `gorm:"not null"`
	CreatedAt time.Time      `gorm:"autoCreateTime"`
	UpdatedAt *time.Time     `gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (TabelaMontagem) TableName() string {
	return "tabelas_montagem"
}
