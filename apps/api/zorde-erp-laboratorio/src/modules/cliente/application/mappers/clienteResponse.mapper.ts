import type { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';

export function clienteToResponse(entity: ClienteEntity): ClienteResponseDto {
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
		usuarioId: entity.getUsuarioId(),
		qrCodeUrl: entity.getQrCodeUrl() ?? null,
		qrGeradoEm: entity.getQrGeradoEm() ?? null,
		logoUrl: entity.getLogoUrl() ?? null,
		createdAt: entity.getCreatedAt() as Date,
		updatedAt: entity.getUpdatedAt() as Date,
	};
}

export function clientesToResponse(entities: ClienteEntity[]): ClienteResponseDto[] {
	return entities.map(clienteToResponse);
}
