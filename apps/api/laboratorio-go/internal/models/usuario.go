package models

import (
	"time"
)

type Usuario struct {
	ID           uint       `gorm:"primaryKey;autoIncrement"`
	Email        string     `gorm:"not null;uniqueIndex:uni_usuario_email_documento"`
	Senha        string     `gorm:"not null"`
	Nome         string     `gorm:"not null"`
	Documento    string     `gorm:"not null;uniqueIndex:uni_usuario_email_documento"`
	Contato      string     `gorm:"not null"`
	UltimoAcesso *time.Time ``
	CreatedAt    time.Time  `gorm:"autoCreateTime"`
	UpdatedAt    *time.Time `gorm:"autoUpdateTime"`
}

func (Usuario) TableName() string {
	return "usuarios"
}
