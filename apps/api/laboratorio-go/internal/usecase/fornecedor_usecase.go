package usecase

import (
	"errors"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"gorm.io/gorm"
)

type FornecedorUseCase interface {
	GetAll() ([]dto.FornecedorResponse, error)
	GetByID(id uint) (*dto.FornecedorResponse, error)
	Create(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error)
	Update(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error)
	Delete(id uint) error
}

type fornecedorUseCase struct {
	repo repository.FornecedorRepository
}

func NewFornecedorUseCase(repo repository.FornecedorRepository) FornecedorUseCase {
	return &fornecedorUseCase{repo: repo}
}

func toFornecedorResponse(f *models.Fornecedor) *dto.FornecedorResponse {
	return &dto.FornecedorResponse{
		ID:         f.ID,
		Nome:       f.Nome,
		Email:      f.Email,
		Contato:    f.Contato,
		TipoPessoa: string(f.TipoPessoa),
		Documento:  f.Documento,
		Status:     string(f.Status),
		CEP:        f.CEP,
		UF:         f.UF,
		Cidade:     f.Cidade,
		Logradouro: f.Logradouro,
		Numero:     f.Numero,
		Bairro:     f.Bairro,
		Observacao: f.Observacao,
		CreatedAt:  f.CreatedAt,
		UpdatedAt:  f.UpdatedAt,
	}
}

func (uc *fornecedorUseCase) GetAll() ([]dto.FornecedorResponse, error) {
	fornecedores, err := uc.repo.FindAll()
	if err != nil {
		return nil, err
	}
	responses := make([]dto.FornecedorResponse, len(fornecedores))
	for i := range fornecedores {
		responses[i] = *toFornecedorResponse(&fornecedores[i])
	}
	return responses, nil
}

func (uc *fornecedorUseCase) GetByID(id uint) (*dto.FornecedorResponse, error) {
	fornecedor, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return toFornecedorResponse(fornecedor), nil
}

func (uc *fornecedorUseCase) Create(req *dto.CreateFornecedorRequest) (*dto.FornecedorResponse, error) {
	status := models.StatusPessoaAtivo
	if req.Status != "" {
		status = models.StatusPessoa(req.Status)
	}
	fornecedor := &models.Fornecedor{
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
	if err := uc.repo.Create(fornecedor); err != nil {
		return nil, err
	}
	return toFornecedorResponse(fornecedor), nil
}

func (uc *fornecedorUseCase) Update(id uint, req *dto.UpdateFornecedorRequest) (*dto.FornecedorResponse, error) {
	fornecedor, err := uc.repo.FindByID(id)
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
	fornecedor.Nome = req.Nome
	fornecedor.Email = req.Email
	fornecedor.Contato = req.Contato
	fornecedor.TipoPessoa = models.TipoPessoa(req.TipoPessoa)
	fornecedor.Documento = req.Documento
	fornecedor.Status = status
	fornecedor.CEP = req.CEP
	fornecedor.UF = req.UF
	fornecedor.Cidade = req.Cidade
	fornecedor.Logradouro = req.Logradouro
	fornecedor.Numero = req.Numero
	fornecedor.Bairro = req.Bairro
	fornecedor.Observacao = req.Observacao
	fornecedor.UsuarioID = req.UsuarioID
	if err := uc.repo.Update(fornecedor); err != nil {
		return nil, err
	}
	return toFornecedorResponse(fornecedor), nil
}

func (uc *fornecedorUseCase) Delete(id uint) error {
	_, err := uc.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return gorm.ErrRecordNotFound
		}
		return err
	}
	return uc.repo.Delete(id)
}
