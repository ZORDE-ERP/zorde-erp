package usecase

import (
	"errors"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"gorm.io/gorm"
)

type ClienteUseCase interface {
	GetAll() ([]dto.ClienteResponse, error)
	GetByID(id uint) (*dto.ClienteResponse, error)
	Create(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error)
	Update(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error)
	Delete(id uint) error
}

type clienteUseCase struct {
	repo repository.ClienteRepository
}

func NewClienteUseCase(repo repository.ClienteRepository) ClienteUseCase {
	return &clienteUseCase{repo: repo}
}

func toClienteResponse(c *models.Cliente) *dto.ClienteResponse {
	return &dto.ClienteResponse{
		ID:         c.ID,
		Nome:       c.Nome,
		Email:      c.Email,
		Contato:    c.Contato,
		TipoPessoa: string(c.TipoPessoa),
		Documento:  c.Documento,
		Status:     string(c.Status),
		CEP:        c.CEP,
		UF:         c.UF,
		Cidade:     c.Cidade,
		Logradouro: c.Logradouro,
		Numero:     c.Numero,
		Bairro:     c.Bairro,
		Observacao: c.Observacao,
		CreatedAt:  c.CreatedAt,
		UpdatedAt:  c.UpdatedAt,
	}
}

func (uc *clienteUseCase) GetAll() ([]dto.ClienteResponse, error) {
	clientes, err := uc.repo.FindAll()
	if err != nil {
		return nil, err
	}
	responses := make([]dto.ClienteResponse, len(clientes))
	for i := range clientes {
		responses[i] = *toClienteResponse(&clientes[i])
	}
	return responses, nil
}

func (uc *clienteUseCase) GetByID(id uint) (*dto.ClienteResponse, error) {
	cliente, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return toClienteResponse(cliente), nil
}

func (uc *clienteUseCase) Create(req *dto.CreateClienteRequest) (*dto.ClienteResponse, error) {
	status := models.StatusPessoaAtivo
	if req.Status != "" {
		status = models.StatusPessoa(req.Status)
	}
	cliente := &models.Cliente{
		Nome:       req.Nome,
		Email:      req.Email,
		Contato:    req.Contato,
		TipoPessoa: models.TipoPessoa(req.TipoPessoa),
		Documento:  req.Documento,
		Status:     status,
		CEP:        req.CEP,
		UF:         req.UF,
		Cidade:     req.Cidade,
		Logradouro: req.Logradouro,
		Numero:     req.Numero,
		Bairro:     req.Bairro,
		Observacao: req.Observacao,
		UsuarioID:  req.UsuarioID,
	}
	if err := uc.repo.Create(cliente); err != nil {
		return nil, err
	}
	return toClienteResponse(cliente), nil
}

func (uc *clienteUseCase) Update(id uint, req *dto.UpdateClienteRequest) (*dto.ClienteResponse, error) {
	cliente, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	status := models.StatusPessoaAtivo
	if req.Status != "" {
		status = models.StatusPessoa(req.Status)
	}
	cliente.Nome = req.Nome
	cliente.Email = req.Email
	cliente.Contato = req.Contato
	cliente.TipoPessoa = models.TipoPessoa(req.TipoPessoa)
	cliente.Documento = req.Documento
	cliente.Status = status
	cliente.CEP = req.CEP
	cliente.UF = req.UF
	cliente.Cidade = req.Cidade
	cliente.Logradouro = req.Logradouro
	cliente.Numero = req.Numero
	cliente.Bairro = req.Bairro
	cliente.Observacao = req.Observacao
	cliente.UsuarioID = req.UsuarioID
	if err := uc.repo.Update(cliente); err != nil {
		return nil, err
	}
	return toClienteResponse(cliente), nil
}

func (uc *clienteUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return err
	}
	return uc.repo.Delete(id)
}
