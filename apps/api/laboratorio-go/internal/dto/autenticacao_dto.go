package dto

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"senha"` // Note: Frontend might send "senha" or "password". Let's use "senha" based on standard.
}

type LoginOutput struct {
	AccessToken string `json:"access_token"`
}

type RefreshInput struct {
	RefreshToken string `json:"refresh_token"`
}

type RefreshOutput struct {
	AccessToken string `json:"access_token"`
}
