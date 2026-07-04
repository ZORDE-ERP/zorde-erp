import type { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';

export function fornecedorToResponse(entity: FornecedorEntity): FornecedorResponseDto {
	return {
		id: entity.getId() as number,
		nome: entity.getNome(),
		email: entity.getEmail(),
		contato: entity.getContato() ?? null,
		tipoPessoa: entity.getTipoPessoa(),
		documento: entity.getDocumento(),
		status: entity.getStatus(),
		cep: entity.getCep() ?? null,
		uf: entity.getUf() ?? null,
		cidade: entity.getCidade() ?? null,
		logradouro: entity.getLogradouro() ?? null,
		complemento: entity.getComplemento() ?? null,
		bairro: entity.getBairro() ?? null,
		ibge: entity.getIbge() ?? null,
		observacao: entity.getObservacao() ?? null,
		numeroEndereco: entity.getNumeroEndereco() ?? null,
		razaoSocial: entity.getRazaoSocial() ?? null,
		nomeFantasia: entity.getNomeFantasia() ?? null,
		usuarioId: entity.getUsuarioId(),
		createdAt: entity.getCreatedAt() as Date,
		updatedAt: entity.getUpdatedAt() as Date,
	};
}

export function fornecedoresToResponse(entities: FornecedorEntity[]): FornecedorResponseDto[] {
	return entities.map(fornecedorToResponse);
}
