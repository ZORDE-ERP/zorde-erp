export interface ServiceOrderResponseDto {
	id: number;
	codigoOs: string;
	clienteId: number;
	valor?: string | null;
	tabelaMontagemId?: number | null;
	usuarioId: number;
	createdAt: Date | null;
	updatedAt?: Date | null;
	deletedAt?: Date | null;

	cliente?: {
		id: number;
		nome: string;
	} | null;

	tabelaMontagem?: {
		id: number;
		servicoId: number;
		nomeServico?: string | null;
		valor: string | null;
	} | null;
}
