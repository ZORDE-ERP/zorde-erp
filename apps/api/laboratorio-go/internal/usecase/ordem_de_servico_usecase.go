package usecase

import (
	"errors"
	"fmt"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"gorm.io/gorm"
)

type OrdemDeServicoUseCase interface {
	GetAll() ([]dto.OrdemDeServicoResponse, error)
	GetByID(id uint) (*dto.OrdemDeServicoResponse, error)
	Create(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error)
	Update(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error)
	Delete(id uint) error
}

type ordemDeServicoUseCase struct {
	repo        repository.OrdemDeServicoRepository
	clienteRepo repository.ClienteRepository
	tabelaRepo  repository.TabelaMontagemRepository
}

func NewOrdemDeServicoUseCase(
	repo repository.OrdemDeServicoRepository,
	clienteRepo repository.ClienteRepository,
	tabelaRepo repository.TabelaMontagemRepository,
) OrdemDeServicoUseCase {
	return &ordemDeServicoUseCase{
		repo:        repo,
		clienteRepo: clienteRepo,
		tabelaRepo:  tabelaRepo,
	}
}

func toOrdemDeServicoResponse(o *models.OrdemDeServico) *dto.OrdemDeServicoResponse {
	var tabelaRef *dto.TabelaMontagemRefResponse
	if o.TabelaMontagemID != nil {
		tabelaRef = &dto.TabelaMontagemRefResponse{
			ID:      o.TabelaMontagemID,
			Servico: string(o.TabelaMontagem.Servico),
		}
	}
	return &dto.OrdemDeServicoResponse{
		ID:        o.ID,
		CodigoOS:  o.CodigoOS,
		ClienteID: o.ClienteID,
		Cliente: dto.ClienteRefResponse{
			ID:   o.Cliente.ID,
			Nome: o.Cliente.Nome,
		},
		Valor:            o.Valor,
		TabelaMontagemID: o.TabelaMontagemID,
		TabelaMontagem:   tabelaRef,
		CreatedAt:        o.CreatedAt,
		UpdatedAt:        o.UpdatedAt,
	}
}

func (uc *ordemDeServicoUseCase) GetAll() ([]dto.OrdemDeServicoResponse, error) {
	ordens, err := uc.repo.FindAll()
	if err != nil {
		return nil, err
	}
	responses := make([]dto.OrdemDeServicoResponse, len(ordens))
	for i := range ordens {
		responses[i] = *toOrdemDeServicoResponse(&ordens[i])
	}
	return responses, nil
}

func (uc *ordemDeServicoUseCase) GetByID(id uint) (*dto.OrdemDeServicoResponse, error) {
	ordem, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return toOrdemDeServicoResponse(ordem), nil
}

func (uc *ordemDeServicoUseCase) validateRelations(clienteID uint, tabelaMontagemID *uint) error {
	_, err := uc.clienteRepo.FindByID(clienteID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("cliente com id %d não encontrado", clienteID)
		}
		return err
	}
	if tabelaMontagemID != nil {
		_, err = uc.tabelaRepo.FindByID(*tabelaMontagemID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("tabela de montagem com id %d não encontrada", *tabelaMontagemID)
			}
			return err
		}
	}
	return nil
}

func (uc *ordemDeServicoUseCase) Create(req *dto.CreateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
	if err := uc.validateRelations(req.ClienteID, req.TabelaMontagemID); err != nil {
		return nil, err
	}
	ordem := &models.OrdemDeServico{
		CodigoOS:         req.CodigoOS,
		ClienteID:        req.ClienteID,
		Valor:            req.Valor,
		TabelaMontagemID: req.TabelaMontagemID,
		UsuarioID:        req.UsuarioID,
	}
	if err := uc.repo.Create(ordem); err != nil {
		return nil, err
	}
	// Reload with preloads
	criada, err := uc.repo.FindByID(ordem.ID)
	if err != nil {
		return nil, err
	}
	return toOrdemDeServicoResponse(criada), nil
}

func (uc *ordemDeServicoUseCase) Update(id uint, req *dto.UpdateOrdemDeServicoRequest) (*dto.OrdemDeServicoResponse, error) {
	ordem, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	if err := uc.validateRelations(req.ClienteID, req.TabelaMontagemID); err != nil {
		return nil, err
	}
	ordem.CodigoOS = req.CodigoOS
	ordem.ClienteID = req.ClienteID
	ordem.Valor = req.Valor
	ordem.TabelaMontagemID = req.TabelaMontagemID
	ordem.UsuarioID = req.UsuarioID
	if err := uc.repo.Update(ordem); err != nil {
		return nil, err
	}
	// Reload with preloads
	atualizada, err := uc.repo.FindByID(ordem.ID)
	if err != nil {
		return nil, err
	}
	return toOrdemDeServicoResponse(atualizada), nil
}

func (uc *ordemDeServicoUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return err
	}
	return uc.repo.Delete(id)
}
