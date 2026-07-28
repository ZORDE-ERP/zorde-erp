import { z } from 'zod';
import { OrigemOrdemServico, OrigemValorItem, StatusOrdemServico } from '../../../../shared/enums/ordem-de-servico.enum';

const orderItemSchema = z
	.object({
		tabelaMontagemId: z.coerce.number().int().positive().nullish(),
		descricaoManual: z.string().min(1, 'descricaoManual é obrigatória para item avulso').nullish(),
		quantidade: z.coerce.number().int().min(1, 'quantidade deve ser >= 1'),
		valorUnitario: z.coerce.number().min(0, 'valorUnitario deve ser >= 0'),
		origemValor: z.enum(OrigemValorItem).default(OrigemValorItem.TABELA),
	})
	.superRefine((item, ctx) => {
		if (item.tabelaMontagemId == null && !item.descricaoManual) {
			ctx.addIssue({
				code: 'custom',
				message: 'Informe tabelaMontagemId ou descricaoManual',
				path: ['descricaoManual'],
			});
		}
	});

export const createOrderSchema = z
	.object({
		clienteId: z.coerce.number().int().positive('clienteId inválido'),
		origem: z.enum(OrigemOrdemServico).default(OrigemOrdemServico.MANUAL),
		codigoOS: z.string().min(1).optional(),
		observacao: z.string().optional(),
		folhaId: z.coerce.number().int().positive().optional(),
		codigoFolha: z.string().min(1).optional(),
		itens: z.array(orderItemSchema).min(1, 'A OS precisa ter ao menos 1 item'),
	})
	.refine((data) => !(data.folhaId != null && data.codigoFolha != null), {
		message: 'Informe apenas folhaId ou codigoFolha',
		path: ['codigoFolha'],
	})
	.superRefine((data, ctx) => {
		if (data.origem === OrigemOrdemServico.QR_SCAN && !data.codigoFolha) {
			ctx.addIssue({
				code: 'custom',
				message: 'codigoFolha é obrigatório para origem QR_SCAN',
				path: ['codigoFolha'],
			});
		}
	});

export const updateOrderSchema = z.object({
	id: z.coerce.number().int().positive(),
	codigoOS: z.string().min(1, 'O código da OS é obrigatório').optional(),
	observacao: z.string().nullish(),
	status: z.enum(StatusOrdemServico).optional(),
});

export const listOrdersQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).default(10),
	status: z.enum(StatusOrdemServico).optional(),
	clienteId: z.coerce.number().int().positive().optional(),
	dataInicio: z.coerce.date().optional(),
	dataFim: z.coerce.date().optional(),
});

export const faturarOrdensSchema = z.object({
	clienteId: z.coerce.number().int().positive('clienteId inválido'),
	dataInicio: z.coerce.date(),
	dataFim: z.coerce.date(),
});

export const fechamentoQuerySchema = z.object({
	clienteId: z.coerce.number().int().positive().optional(),
	dataInicio: z.coerce.date(),
	dataFim: z.coerce.date(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type ListOrdersQueryDto = z.infer<typeof listOrdersQuerySchema>;
export type FaturarOrdensDto = z.infer<typeof faturarOrdensSchema>;
export type FechamentoQueryDto = z.infer<typeof fechamentoQuerySchema>;
export type CreateOrderItemDto = z.infer<typeof orderItemSchema>;
