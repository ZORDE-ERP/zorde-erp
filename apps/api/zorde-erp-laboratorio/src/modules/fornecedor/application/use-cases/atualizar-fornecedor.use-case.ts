import { Inject, Injectable } from '@nestjs/common';
import { TipoPessoa } from '../../../../shared/enums/tipo-pessoa.enum';
import { BusinessRuleException, EntityNotFoundException } from '../../../../shared/errors/app.exception';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import type { AtualizarFornecedorDto } from '../dtos/atualizar-fornecedor.dto';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class AtualizarFornecedorUseCase {
	public constructor(
		@Inject(I_FORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(id: number, dto: AtualizarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		const existing = await this.fornecedorRepository.buscarPorId(id);

		if (!existing || existing.deletedAt || existing.usuarioId !== usuarioId) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		const updateData: Record<string, unknown> = {};

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

		const updated = await this.fornecedorRepository.atualizar(id, updateData);

		return FornecedorResponseDto.fromEntity(updated);
	}
}
