import { type ArgumentMetadata, BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { Schema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
	public constructor(private schema: Schema) {}

	public transform(value: unknown, _metadata: ArgumentMetadata): unknown {
		const result = this.schema.safeParse(value);

		if (!result.success) {
			const errors = result.error.issues.map((err) => ({
				field: err.path.join('.'),
				message: err.message,
			}));
			throw new BadRequestException({
				message: 'Falha na validação dos dados de entrada',
				errors,
			});
		}

		return result.data;
	}
}
