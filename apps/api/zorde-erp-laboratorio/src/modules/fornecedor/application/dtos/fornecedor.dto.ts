import { z } from 'zod';
import { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

export const updateFornecedorSchema = z.object({
	id: z.coerce.number(),
	nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').optional(),
	email: z.email('E-mail inválido').optional(),
	contato: z.string().optional(),
	tipoPessoa: z.enum(TipoPessoa).optional(),
	documento: z.string().optional(),
	status: z.enum(StatusPessoa).optional(),
	cep: z.string().optional(),
	uf: z.string().optional(),
	cidade: z.string().optional(),
	logradouro: z.string().optional(),
	numero: z.string().optional(),
	bairro: z.string().optional(),
	observacao: z.string().optional(),
	numeroEndereco: z.string().optional(),
	complemento: z.string().optional(),
	ibge: z.string().optional(),
	razaoSocial: z.string().optional(),
	nomeFantasia: z.string().optional(),
});

export const createFornecedorSchema = z
	.object({
		nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
		email: z.email('E-mail inválido'),
		contato: z.string().optional(),
		tipoPessoa: z.enum(TipoPessoa, {
			message: 'Tipo de pessoa inválido (FISICA ou JURIDICA)',
		}),
		documento: z.string().min(11, 'Documento inválido'),
		status: z.enum(StatusPessoa).default(StatusPessoa.ATIVO),
		razaoSocial: z.string().optional(),
		nomeFantasia: z.string().optional(),
		cep: z.string().optional(),
		uf: z.string().optional(),
		cidade: z.string().optional(),
		logradouro: z.string().optional(),
		numero: z.string().optional(),
		complemento: z.string().optional(),
		bairro: z.string().optional(),
		ibge: z.string().optional(),
		observacao: z.string().optional(),
		numeroEndereco: z.string().optional(),
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

export type CreateFornecedorDto = z.infer<typeof createFornecedorSchema>;
export type UpdateFornecedorDto = z.infer<typeof updateFornecedorSchema>;
