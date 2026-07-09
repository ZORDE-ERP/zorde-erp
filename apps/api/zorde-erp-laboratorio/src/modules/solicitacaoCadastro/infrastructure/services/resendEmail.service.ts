import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
	private readonly resend: Resend;
	private readonly logger = new Logger(ResendEmailService.name);

	public constructor() {
		this.resend = new Resend(process.env.RESEND_API_KEY);
	}

	public async enviarCodigoOtp(email: string, codigo: string): Promise<void> {
		const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifique seu E-mail — Zorde Laboratório</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0b0f19;
            color: #f3f4f6;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 580px;
            margin: 40px auto;
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
            border: 1px solid #374151;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
          }
          .email-header {
            background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
            padding: 30px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .email-content {
            padding: 40px 30px;
            text-align: center;
          }
          .email-content p {
            font-size: 16px;
            line-height: 1.6;
            color: #d1d5db;
            margin-top: 0;
            margin-bottom: 24px;
          }
          .otp-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            display: inline-block;
          }
          .otp-code {
            font-size: 38px;
            font-weight: 800;
            color: #818cf8;
            letter-spacing: 6px;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
          }
          .email-footer {
            background-color: rgba(0, 0, 0, 0.2);
            padding: 24px 30px;
            border-top: 1px solid #374151;
            text-align: center;
            font-size: 13px;
            color: #9ca3af;
          }
          .email-footer a {
            color: #6366f1;
            text-decoration: none;
          }
          .warning-text {
            font-size: 14px;
            color: #fca5a5;
            margin-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Zorde Laboratório</h1>
          </div>
          <div class="email-content">
            <p>Olá,</p>
            <p>Seja bem-vindo ao <strong>Zorde Laboratório</strong>. Para concluir sua solicitação de cadastro e confirmar seu endereço de e-mail, utilize o código de segurança abaixo:</p>
            
            <div class="otp-card">
              <h2 class="otp-code">${codigo}</h2>
            </div>
            
            <p class="warning-text">Este código expira em <strong>5 minutos</strong>.</p>
            <p>Se você não solicitou este cadastro, por favor desconsidere este e-mail.</p>
          </div>
          <div class="email-footer">
            <p>Zorde ERP &copy; ${new Date().getFullYear()} — Todos os direitos reservados.</p>
            <p>Este é um e-mail automático. Não responda diretamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

		const { data, error } = await this.resend.emails.send({
			from: 'Zorde Laboratório <onboarding@resend.dev>',
			to: email,
			subject: `${codigo} é o seu código de confirmação`,
			html,
		});

		if (error) {
			this.logger.error(`Erro ao enviar e-mail OTP para ${email}:`, error);
			throw new InternalServerErrorException('Falha ao enviar e-mail de confirmação');
		}

		this.logger.log(`E-mail OTP enviado com sucesso para ${email}. ID: ${data?.id}`);
	}
}
