import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { globalEnvironment } from '../../../config/env.validation';
import { BusinessRuleException } from '../../errors/app.exception';

export interface LogoImageResult {
	secureUrl: string;
	publicId: string;
}

export type LogoEntityKind = 'cliente' | 'fornecedor';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB

@Injectable()
export class LogoImageService {
	private readonly logger = new Logger(LogoImageService.name);
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

	public validateFile(file: { buffer?: Buffer; mimetype?: string; size?: number } | undefined): void {
		if (!file?.buffer?.length) {
			throw new BusinessRuleException('Arquivo de imagem é obrigatório');
		}
		if (!file.mimetype || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
			throw new BusinessRuleException('Formato inválido. Use JPEG, PNG, WebP ou SVG');
		}
		const size = file.size ?? file.buffer.length;
		if (size > MAX_LOGO_BYTES) {
			throw new BusinessRuleException('Imagem muito grande. Máximo permitido: 2MB');
		}
	}

	public async uploadBuffer(
		buffer: Buffer,
		options: { kind: LogoEntityKind; entityId: number; mimeType: string },
	): Promise<LogoImageResult> {
		this.ensureConfigured();
		const folder = `zorde-labs/${options.kind === 'cliente' ? 'clientes' : 'fornecedores'}/logos/${options.kind}-${options.entityId}`;
		const publicId = `${options.kind}-${options.entityId}-logo`;
		const format = this.mimeToFormat(options.mimeType);

		try {
			const result = await new Promise<UploadApiResponse>((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						public_id: publicId,
						folder,
						resource_type: 'image',
						format,
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
				stream.end(buffer);
			});

			return {
				secureUrl: result.secure_url,
				publicId: result.public_id,
			};
		} catch (error) {
			this.logger.error(`Falha ao enviar logo do ${options.kind} ${options.entityId} ao Cloudinary`, error);
			throw new BusinessRuleException('Não foi possível enviar a imagem do logo');
		}
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

	private mimeToFormat(mimeType: string): string | undefined {
		switch (mimeType) {
			case 'image/jpeg':
				return 'jpg';
			case 'image/png':
				return 'png';
			case 'image/webp':
				return 'webp';
			case 'image/svg+xml':
				return 'svg';
			default:
				return undefined;
		}
	}
}
