export interface TabelaMontagemResponseDto {
	id: number;
	clienteId: number;
	nomeCliente?: string | null;
	servicoId: number;
	nomeServico?: string | null;
	valor: number;
	createdAt: Date;
	updatedAt?: Date | null;
}
