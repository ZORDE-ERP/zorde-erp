export interface ClienteQrCodeResponseDto {
	clienteId: number;
	token: string;
	qrGeradoEm: Date;
	qrCodeUrl: string;
	/** Regenerar sobrescreve o token anterior e invalida o QR físico antigo. */
	message: string;
}
