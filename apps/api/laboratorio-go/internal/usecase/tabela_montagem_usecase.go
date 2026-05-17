package usecase

import (
	"errors"
	"fmt"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"gorm.io/gorm"
)

var validTiposServico = map[string]bool{
	"MONTAGEM SIMPLES": true,
	"PARAFUSO":         true,
	"TRANSPOSICAO":     true,
	"COLORACAO":        true,
	"SOMENTE ENCAIXAR": true,
}

type TabelaMontagemUseCase interface {
	GetAll(page, limit int, search string) (*dto.TabelaMontagemListResponse, error)
	GetByID(id uint) (*dto.TabelaMontagemResponse, error)
	Create(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error)
	Update(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error)
	Delete(id uint) error
}

type tabelaMontagemUseCase struct {
	repo repository.TabelaMontagemRepository
}

func NewTabelaMontagemUseCase(repo repository.TabelaMontagemRepository) TabelaMontagemUseCase {
	return &tabelaMontagemUseCase{repo: repo}
}

func toTabelaMontagemResponse(t *models.TabelaMontagem) *dto.TabelaMontagemResponse {
	return &dto.TabelaMontagemResponse{
		ID:          t.ID,
		ClienteID:   t.ClienteID,
		NomeCliente: t.Cliente.Nome,
		Servico:     string(t.Servico),
		Valor:       t.Valor,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}

func (uc *tabelaMontagemUseCase) GetAll(page, limit int, search string) (*dto.TabelaMontagemListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	tabelas, total, err := uc.repo.FindAll(page, limit, search)
	if err != nil {
		return nil, err
	}

	items := make([]dto.TabelaMontagemResponse, len(tabelas))
	for i := range tabelas {
		items[i] = *toTabelaMontagemResponse(&tabelas[i])
	}

	return &dto.TabelaMontagemListResponse{Items: items, Total: total}, nil
}

func (uc *tabelaMontagemUseCase) GetByID(id uint) (*dto.TabelaMontagemResponse, error) {
	tabela, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return toTabelaMontagemResponse(tabela), nil
}

func (uc *tabelaMontagemUseCase) Create(req *dto.CreateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
	if !validTiposServico[req.Servico] {
		return nil, fmt.Errorf("tipo de serviço inválido: %s", req.Servico)
	}

	tabela := &models.TabelaMontagem{
		ClienteID: req.ClienteID,
		Servico:   models.TipoServico(req.Servico),
		Valor:     req.Valor,
	}

	if err := uc.repo.Create(tabela); err != nil {
		return nil, err
	}

	created, err := uc.repo.FindByID(tabela.ID)
	if err != nil {
		return nil, err
	}

	return toTabelaMontagemResponse(created), nil
}

func (uc *tabelaMontagemUseCase) Update(id uint, req *dto.UpdateTabelaMontagemRequest) (*dto.TabelaMontagemResponse, error) {
	if !validTiposServico[req.Servico] {
		return nil, fmt.Errorf("tipo de serviço inválido: %s", req.Servico)
	}

	tabela, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}

	tabela.ClienteID = req.ClienteID
	tabela.Servico = models.TipoServico(req.Servico)
	tabela.Valor = req.Valor

	if err := uc.repo.Update(tabela); err != nil {
		return nil, err
	}

	updated, err := uc.repo.FindByID(tabela.ID)
	if err != nil {
		return nil, err
	}

	return toTabelaMontagemResponse(updated), nil
}

func (uc *tabelaMontagemUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return err
	}
	return uc.repo.Delete(id)
}
