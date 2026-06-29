import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import { AtualizarClienteDto } from '../dtos/cliente.dto';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clienteToResponse } from '../mappers/clienteResponse.mapper';

@Injectable()
export class AtualizarClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
	) {}

	public async execute(clienteDto: AtualizarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
		const existing = await this.clienteRepository.findById(clienteDto.id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Cliente não encontrado');
		}

		const client = new ClienteEntity({
			id: clienteDto.id,
			nome: clienteDto.nome ?? existing.getNome(),
			email: clienteDto.email ?? existing.getEmail(),
			contato: clienteDto.contato ?? existing.getContato(),
			tipoPessoa: clienteDto.tipoPessoa ?? existing.getTipoPessoa(),
			documento: clienteDto.documento ?? existing.getDocumento(),
			status: clienteDto.status ?? existing.getStatus(),
			cep: clienteDto.cep,
			razaoSocial: clienteDto.razaoSocial ?? existing.getRazaoSocial(),
			nomeFantasia: clienteDto.nomeFantasia ?? existing.getNomeFantasia(),
			observacao: clienteDto.observacao,
			usuarioId,
			logradouro: clienteDto.logradouro,
			complemento: clienteDto.complemento,
			bairro: clienteDto.bairro,
			cidade: clienteDto.cidade,
			uf: clienteDto.uf,
			ibge: clienteDto.ibge,
			numeroEndereco: clienteDto.numeroEndereco,
			createdAt: existing.getCreatedAt(),
			updatedAt: new Date(),
		});

		const updatedClient = await this.clienteRepository.update(client);

		return clienteToResponse(updatedClient);
	}
}
