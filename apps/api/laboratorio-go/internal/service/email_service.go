package service

import (
	"fmt"
	"strings"

	"github.com/resend/resend-go/v3"
)

type EmailService interface {
	SendVerificationCode(to string, code string) error
}

type resendEmailService struct {
	client *resend.Client
}

func NewEmailService(apiKey string) EmailService {
	return &resendEmailService{
		client: resend.NewClient(apiKey),
	}
}

const emailTemplate = `<div style="background-color: #0f172a; padding: 40px 20px; font-family: 'Inter', system-ui, sans-serif; color: #f8fafc; text-align: center;">
    <div style="max-width: 400px; margin: 0 auto; background: #1e293b; border-radius: 24px; padding: 40px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
        <div style="margin-bottom: 30px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #38bdf8, #818cf8); border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-weight: bold; color: white; font-size: 24px;">Z</span>
            </div>
        </div>
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #fff;">Verifique sua conta</h1>
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">Use o código abaixo para confirmar seu acesso ao <b>Zorde Gestão Lab</b>.</p>
        
        <div style="margin: 32px 0; background: #0f172a; border-radius: 16px; padding: 24px; border: 1px dashed #38bdf8;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8;">${code}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b;">Esse código expira em 5 minutos por segurança.</p>
        <div style="margin-top: 32px; border-top: 1px solid #334155; padding-top: 24px;">
            <p style="font-size: 12px; color: #475569;">Não solicitou este código? Apenas ignore este e-mail.</p>
        </div>
    </div>
</div>`

func (s *resendEmailService) SendVerificationCode(to string, code string) error {
	html := strings.ReplaceAll(emailTemplate, "${code}", code)
	text := fmt.Sprintf("Seu código de verificação do Zorde Gestão é: %s\n\nEsse código expira em 5 minutos.\n\nSe você não solicitou este código, ignore este email.", code)

	params := &resend.SendEmailRequest{
		From:    "Zorde Gestão <send@zorde.com.br>",
		To:      []string{to},
		Subject: "Seu código de verificação - Zorde Gestão",
		Html:    html,
		Text:    text,
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("falha ao enviar email: %w", err)
	}
	return nil
}
