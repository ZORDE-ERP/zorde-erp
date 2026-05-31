import { Inject, Injectable } from '@nestjs/common';
import { I_CLIENTE_REPOSITORY } from '../../domain/repositories/i-cliente.repository';
import type { IClienteRepository } from '../../domain/repositories/i-cliente.repository';
import { AtualizarClienteDto } from '../dtos/atualizar-cliente.dto';
import { ClienteResponseDto } from '../dtos/cliente-response.dto';
import { EntityNotFoundException, BusinessRuleException } from '../../../../shared/errors/app.exception';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';

@Injectable()
export class AtualizarClienteUseCase {
  constructor(
    @Inject(I_CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number, dto: AtualizarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
    const existing = await this.clienteRepository.buscarPorId(id);

    if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
      throw new EntityNotFoundException('Cliente não encontrado');
    }

    const updateData: any = {};

    if (dto.nome !== undefined) updateData.nome = dto.nome;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.contato !== undefined) updateData.contato = dto.contato;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.cep !== undefined) updateData.cep = dto.cep;
    if (dto.uf !== undefined) updateData.uf = dto.uf;
    if (dto.cidade !== undefined) updateData.cidade = dto.cidade;
    if (dto.logradouro !== undefined) updateData.logradouro = dto.logradouro;
    if (dto.numero !== undefined) updateData.numero = dto.numero;
    if (dto.bairro !== undefined) updateData.bairro = dto.bairro;
    if (dto.observacao !== undefined) updateData.observacao = dto.observacao;

    // Se houver alteração de tipo de pessoa ou documento, validar
    const finalTipoPessoa = dto.tipoPessoa !== undefined ? dto.tipoPessoa : existing.tipoPessoa;
    const finalDocumento = dto.documento !== undefined ? dto.documento : existing.documento;

    if (dto.tipoPessoa !== undefined || dto.documento !== undefined) {
      const cleanDoc = finalDocumento.replace(/\D/g, '');
      if (finalTipoPessoa === TipoPessoa.FISICA && cleanDoc.length !== 11) {
        throw new BusinessRuleException('CPF deve conter exatamente 11 dígitos');
      } else if (finalTipoPessoa === TipoPessoa.JURIDICA && cleanDoc.length !== 14) {
        throw new BusinessRuleException('CNPJ deve conter exatamente 14 dígitos');
      }
      updateData.tipoPessoa = finalTipoPessoa;
      updateData.documento = cleanDoc;
    }

    updateData.updatedAt = new Date();

    const updated = await this.clienteRepository.atualizar(id, updateData);

    return ClienteResponseDto.fromEntity(updated);
  }
}
