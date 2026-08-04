import { z } from 'zod';

export const folhaOsStatusQuerySchema = z.object({
	codigoFolha: z.string().min(1, 'codigoFolha é obrigatório'),
	clienteId: z.coerce.number().int().positive('clienteId inválido'),
});

export type FolhaOsStatusQueryDto = z.infer<typeof folhaOsStatusQuerySchema>;

export interface FolhaOsStatusResponseDto {
	codigoFolha: string;
	clienteId: number;
	status: string;
	ordemDeServicoId?: number | null;
}
