package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/zorde/api/internal/dto"
	"github.com/zorde/api/internal/models"
	"github.com/zorde/api/internal/repository"
	"github.com/zorde/api/internal/security"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type AutenticacaoUseCase interface {
	Login(ctx context.Context, input dto.LoginInput, ip, userAgent string) (*dto.LoginOutput, string, error)
	Refresh(ctx context.Context, input dto.RefreshInput, ip, userAgent string) (*dto.RefreshOutput, string, error)
	Logout(ctx context.Context, refreshToken string) error
}

type autenticacaoUseCase struct {
	authRepo repository.AutenticacaoRepository
	userRepo repository.UsuarioRepository
	hasher   security.PasswordHasher
}

func NewAutenticacaoUseCase(authRepo repository.AutenticacaoRepository, userRepo repository.UsuarioRepository, hasher security.PasswordHasher) AutenticacaoUseCase {
	return &autenticacaoUseCase{
		authRepo: authRepo,
		userRepo: userRepo,
		hasher:   hasher,
	}
}

func (u *autenticacaoUseCase) Login(ctx context.Context, input dto.LoginInput, ip, userAgent string) (*dto.LoginOutput, string, error) {
	user, err := u.userRepo.FindByEmail(input.Email)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	ok, err := u.hasher.Verify(input.Password, user.Senha)
	if err != nil || !ok {
		return nil, "", ErrInvalidCredentials
	}

	fingerprint := security.GenerateFingerprintHash(ip, userAgent)
	accessToken, refreshToken, err := security.GenerateTokens(user.ID, user.Nome, user.Email, fingerprint)
	if err != nil {
		return nil, "", err
	}

	auth := &models.Autenticacao{
		IDUsuario:    user.ID,
		RefreshToken: refreshToken,
		Status:       models.StatusLogado,
		IP:           ip,
		Dispositivo:  userAgent,
		Navegador:    userAgent,
	}

	if err := u.authRepo.Create(ctx, auth); err != nil {
		return nil, "", err
	}

	now := time.Now()
	if err := u.userRepo.UpdateUltimoAcesso(user.ID, &now); err != nil {
		// Log error but don't fail login
	}

	return &dto.LoginOutput{AccessToken: accessToken}, refreshToken, nil
}

func (u *autenticacaoUseCase) Refresh(ctx context.Context, input dto.RefreshInput, ip, userAgent string) (*dto.RefreshOutput, string, error) {
	auth, err := u.authRepo.FindByRefreshToken(ctx, input.RefreshToken)
	if err != nil || auth.Status != models.StatusLogado {
		return nil, "", ErrInvalidToken
	}

	// Validate the refresh token JWT
	claims, err := security.ValidateToken(input.RefreshToken)
	if err != nil {
		return nil, "", ErrInvalidToken
	}

	fingerprint := security.GenerateFingerprintHash(ip, userAgent)
	if claims.Fingerprint != fingerprint {
		return nil, "", ErrInvalidToken
	}

	user, err := u.userRepo.FindByID(auth.IDUsuario)
	if err != nil {
		return nil, "", ErrInvalidToken
	}

	accessToken, newRefreshToken, err := security.GenerateTokens(user.ID, user.Nome, user.Email, fingerprint)
	if err != nil {
		return nil, "", err
	}

	if err := u.authRepo.UpdateRefreshToken(ctx, auth.ID, newRefreshToken); err != nil {
		return nil, "", err
	}

	return &dto.RefreshOutput{AccessToken: accessToken}, newRefreshToken, nil
}

func (u *autenticacaoUseCase) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil // Nothing to do
	}
	return u.authRepo.UpdateStatusToOffline(ctx, refreshToken)
}
