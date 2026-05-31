import { Inject, Injectable } from '@nestjs/common';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { CriarClienteDto } from '../dtos/criar-cliente.dto';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';
import { ClienteEntity } from '../../domain/entities/cliente.entity';

@Injectable()
export class CriarClienteUseCase {
  constructor(
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CriarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
    const cleanDocumento = dto.documento.replace(/\D/g, '');

    const cliente = ClienteEntity.create({
      nome: dto.nome,
      email: dto.email,
      contato: dto.contato,
      tipoPessoa: dto.tipoPessoa,
      documento: cleanDocumento,
      status: dto.status,
      cep: dto.cep,
      uf: dto.uf,
      cidade: dto.cidade,
      logradouro: dto.logradouro,
      numero: dto.numero,
      bairro: dto.bairro,
      observacao: dto.observacao,
      usuarioId,
    });

    const created = await this.clienteRepository.criar(cliente);

    return ClienteResponseDto.fromEntity(created);
  }
}
