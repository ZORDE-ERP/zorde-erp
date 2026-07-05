import { Inject, Injectable } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { IFornecedorRepository } from '../../domain/repositories/fornecedor.repository';
import { IFORNECEDOR_REPOSITORY } from '../../domain/repositories/fornecedor.repository';
import { CreateFornecedorDto } from '../dtos/fornecedor.dto';
import type { FornecedorResponseDto } from '../dtos/fornecedorResponse.dto';
import { fornecedorToResponse } from '../mappers/fornecedorResponse.mapper';

@Injectable()
export class CreateFornecedorUseCase {
	public constructor(
		@Inject(IFORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
		private readonly enderecoAdapterRepository: EnderecoAdapterRepository,
	) {}

	public async execute(dto: CreateFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		const cleanDocumento = dto.documento.replace(/\D/g, '');

		const fornecedor = new FornecedorEntity({
			nome: dto.nome,
			email: dto.email,
			contato: dto.contato,
			tipoPessoa: dto.tipoPessoa,
			documento: cleanDocumento,
			status: dto.status,
			razaoSocial: dto.razaoSocial,
			nomeFantasia: dto.nomeFantasia,
			cep: dto.cep,
			logradouro: dto.logradouro,
			complemento: dto.complemento,
			bairro: dto.bairro,
			cidade: dto.cidade,
			uf: dto.uf,
			ibge: dto.ibge,
			observacao: dto.observacao,
			usuarioId,
			numeroEndereco: dto.numeroEndereco,
		});

		if (dto.cep) {
			await this.enderecoAdapterRepository.create({
				cep: dto.cep,
				uf: dto.uf,
				cidade: dto.cidade,
				logradouro: dto.logradouro,
				bairro: dto.bairro,
				complemento: dto.complemento,
				ibge: dto.ibge,
			});
		}

		const newFornecedor = await this.fornecedorRepository.create(fornecedor);

		return fornecedorToResponse(newFornecedor);
	}
}
