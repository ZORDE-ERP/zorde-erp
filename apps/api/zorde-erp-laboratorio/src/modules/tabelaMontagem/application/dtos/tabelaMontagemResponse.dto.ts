import type { TipoServico } from '../../../../shared/enums/tipo-servico.enum';

export interface TabelaMontagemResponseDto {
	id: number;
	clienteId: number;
	nomeCliente?: string | null;
	servico: TipoServico;
	valor: number;
	createdAt: Date;
	updatedAt?: Date | null;
}
