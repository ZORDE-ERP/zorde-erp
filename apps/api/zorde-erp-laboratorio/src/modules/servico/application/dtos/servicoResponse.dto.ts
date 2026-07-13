export interface ServicoResponseDto {
	id: number;
	usuarioId: number;
	nome: string;
	descricao?: string | null;
	createdAt: Date;
	updatedAt?: Date | null;
}
