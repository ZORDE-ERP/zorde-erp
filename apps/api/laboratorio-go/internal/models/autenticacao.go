package models

import (
	"time"
)

type StatusSessao string

const (
	StatusLogado  StatusSessao = "logado"
	StatusOffline StatusSessao = "offline"
)

type Autenticacao struct {
	ID           uint         `gorm:"primaryKey;autoIncrement"`
	IDUsuario    uint         `gorm:"not null;index"`
	RefreshToken string       `gorm:"not null;uniqueIndex"`
	Status       StatusSessao `gorm:"not null;default:'logado'"`
	IP           string       `gorm:"not null"`
	Dispositivo  string       `gorm:"not null"`
	Navegador    string       `gorm:"not null"`
	CreatedAt    time.Time    `gorm:"autoCreateTime"`
	UpdatedAt    *time.Time   `gorm:"autoUpdateTime"`
	
	Usuario      Usuario      `gorm:"foreignKey:IDUsuario"`
}

func (Autenticacao) TableName() string {
	return "autenticacao"
}
