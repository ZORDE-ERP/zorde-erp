import { z } from 'zod';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

export const criarFornecedorSchema = z
	.object({
		nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
		email: z.string().email('E-mail inválido'),
		contato: z.string().optional(),
		tipoPessoa: z.nativeEnum(TipoPessoa, {
			message: 'Tipo de pessoa inválido (FISICA ou JURIDICA)',
		}),
		documento: z.string().min(11, 'Documento inválido'),
		status: z.nativeEnum(StatusPessoa).default(StatusPessoa.ATIVO),
		cep: z.string().optional(),
		uf: z.string().optional(),
		cidade: z.string().optional(),
		logradouro: z.string().optional(),
		numero: z.string().optional(),
		bairro: z.string().optional(),
		observacao: z.string().optional(),
	})
	.refine(
		(data) => {
			const clean = data.documento.replace(/\D/g, '');
			if (data.tipoPessoa === TipoPessoa.FISICA) {
				return clean.length === 11;
			} else {
				return clean.length === 14;
			}
		},
		{
			message: 'CPF deve ter 11 dígitos e CNPJ deve ter 14 dígitos',
			path: ['documento'],
		},
	);

export type CriarFornecedorDto = z.infer<typeof criarFornecedorSchema>;
