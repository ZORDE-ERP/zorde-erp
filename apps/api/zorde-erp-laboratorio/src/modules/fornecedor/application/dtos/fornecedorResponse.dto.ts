import type { StatusPessoa } from '../../../../shared/enums/status-pessoa.enum';
import type { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

export interface FornecedorResponseDto {
	id: number;
	nome: string;
	email: string;
	contato?: string | null;
	tipoPessoa: TipoPessoa;
	razaoSocial?: string | null;
	nomeFantasia?: string | null;
	documento: string;
	status: StatusPessoa;
	cep?: string | null;
	uf?: string | null;
	cidade?: string | null;
	logradouro?: string | null;
	complemento?: string | null;
	numero?: string | null; // Keep if needed for backward compatibility or remove if not in customer. Customer response has: `numero?: string | null`? Wait, let's look at ClienteResponseDto. It has: `numero?: string | null`. Let's keep it just in case.
	bairro?: string | null;
	ibge?: string | null;
	observacao?: string | null;
	numeroEndereco?: string | null;
	usuarioId: number;
	createdAt: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;
}
