import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import * as QRCode from 'qrcode';
import { globalEnvironment } from '../../../../config/env.validation';
import { BusinessRuleException } from '../../../../shared/errors/app.exception';

export interface QrCodeImageResult {
	secureUrl: string;
	publicId: string;
}

@Injectable()
export class QrCodeImageService {
	private readonly logger = new Logger(QrCodeImageService.name);
	private configured = false;

	private ensureConfigured(): void {
		if (this.configured) return;

		cloudinary.config({
			cloud_name: globalEnvironment.CLOUDINARY_CLOUD_NAME,
			api_key: globalEnvironment.CLOUDINARY_API_KEY,
			api_secret: globalEnvironment.CLOUDINARY_API_SECRET,
			secure: true,
		});
		this.configured = true;
	}

	public buildScanUrl(clienteId: number, qrToken: string, codigoFolha?: string): string {
		const base = globalEnvironment.FRONTEND_APP_URL.replace(/\/$/, '');
		const params = new URLSearchParams({
			c: String(clienteId),
			t: qrToken,
		});
		if (codigoFolha) {
			params.set('f', codigoFolha);
		}
		return `${base}/os/scan?${params.toString()}`;
	}

	public async generatePngDataUrl(scanUrl: string): Promise<string> {
		return QRCode.toDataURL(scanUrl, {
			errorCorrectionLevel: 'M',
			margin: 2,
			width: 256,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
	}

	public async generateSvg(scanUrl: string): Promise<string> {
		return QRCode.toString(scanUrl, {
			type: 'svg',
			errorCorrectionLevel: 'M',
			margin: 2,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});
	}

	public async uploadSvg(svg: string, clienteId: number): Promise<QrCodeImageResult> {
		this.ensureConfigured();
		const publicId = `zorde/qr-codes/cliente-${clienteId}`;

		try {
			const result = await new Promise<UploadApiResponse>((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						public_id: publicId,
						folder: `zorde-labs/clientes/qr-codes/cliente-${clienteId}`,
						resource_type: 'image',
						format: 'svg',
						overwrite: true,
						invalidate: true,
					},
					(error, uploadResult) => {
						if (error || !uploadResult) {
							reject(error ?? new Error('Upload Cloudinary sem resposta'));
							return;
						}
						resolve(uploadResult);
					},
				);
				stream.end(Buffer.from(svg, 'utf8'));
			});

			return {
				secureUrl: result.secure_url,
				publicId: result.public_id,
			};
		} catch (error) {
			this.logger.error(`Falha ao enviar QR SVG do cliente ${clienteId} ao Cloudinary`, error);
			throw new BusinessRuleException('Não foi possível gerar a imagem do QR Code');
		}
	}

	public async generateAndUpload(clienteId: number, qrToken: string): Promise<QrCodeImageResult> {
		const scanUrl = this.buildScanUrl(clienteId, qrToken);
		const svg = await this.generateSvg(scanUrl);
		return this.uploadSvg(svg, clienteId);
	}

	public async destroy(publicId: string | null | undefined): Promise<void> {
		if (!publicId) return;
		this.ensureConfigured();
		try {
			await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
		} catch (error) {
			this.logger.warn(`Falha ao remover asset Cloudinary ${publicId}`, error as Error);
		}
	}
}
