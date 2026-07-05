import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/errors/app.exception';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import { type UpdateFornecedorDto } from '../dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedorToResponse } from '../mappers/fornecedorResponse.mapper';

@Injectable()
export class UpdateFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(data: UpdateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		const {
			id,
			nome,
			email,
			contato,
			tipoPessoa,
			documento,
			status,
			cep,
			razaoSocial,
			nomeFantasia,
			observacao,
			logradouro,
			complemento,
			bairro,
			cidade,
			uf,
			ibge,
			numeroEndereco,
		} = data;

		const existing = await this.fornecedorRepository.findById(data.id, usuarioId);

		if (!existing) {
			throw new EntityNotFoundException('Fornecedor não encontrado');
		}

		const fornecedor = new FornecedorEntity({
			id,
			documento: documento ?? existing.getDocumento(),
			email: email ?? existing.getEmail(),
			nome: nome ?? existing.getNome(),
			contato: contato ?? existing.getContato(),
			tipoPessoa: tipoPessoa ?? existing.getTipoPessoa(),
			status: status ?? existing.getStatus(),
			cep: cep ?? existing.getCep(),
			razaoSocial: razaoSocial ?? existing.getRazaoSocial(),
			nomeFantasia: nomeFantasia ?? existing.getNomeFantasia(),
			observacao: observacao ?? existing.getObservacao(),
			logradouro: logradouro ?? existing.getLogradouro(),
			complemento: complemento ?? existing.getComplemento(),
			bairro: bairro ?? existing.getBairro(),
			cidade: cidade ?? existing.getCidade(),
			uf: uf ?? existing.getUf(),
			ibge: ibge ?? existing.getIbge(),
			numeroEndereco: numeroEndereco ?? existing.getNumeroEndereco(),
			usuarioId,
		});

		const updatedFornecedor = await this.fornecedorRepository.update(fornecedor);

		return fornecedorToResponse(updatedFornecedor);
	}
}
