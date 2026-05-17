package models

import (
	"time"

	"gorm.io/gorm"
)

type Cliente struct {
	ID         uint           `gorm:"primaryKey;autoIncrement"`
	Nome       string         `gorm:"not null"`
	Email      string         `gorm:"not null"`
	Contato    *string        ``
	TipoPessoa TipoPessoa     `gorm:"type:varchar(20);not null;check:tipo_pessoa IN ('FISICA', 'JURIDICA')"`
	Documento  string         `gorm:"not null"`
	Status     StatusPessoa   `gorm:"type:varchar(20);not null;default:'ATIVO';check:status IN ('ATIVO', 'INATIVO')"`
	CEP        *string        ``
	UF         *string        ``
	Cidade     *string        ``
	Logradouro *string        ``
	Numero     *string        ``
	Bairro     *string        ``
	Observacao *string        ``
	UsuarioID  uint           `gorm:"not null"`
	Usuario    Usuario        `gorm:"foreignKey:UsuarioID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	CreatedAt  time.Time      `gorm:"autoCreateTime"`
	UpdatedAt  *time.Time     `gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}

func (Cliente) TableName() string {
	return "clientes"
}
