package models

import "time"

type SolicitacaoCadastro struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	Email     string    `gorm:"not null;uniqueIndex"`
	Codigo    string    `gorm:"not null;type:varchar(6)"`
	Expiracao time.Time `gorm:"not null"`
	CriadoEm  time.Time `gorm:"not null;autoCreateTime"`
}

func (SolicitacaoCadastro) TableName() string {
	return "solicitacao_cadastro"
}
