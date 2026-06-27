import { Inject, Injectable } from '@nestjs/common';
import { FornecedorEntity } from '../../domain/entities/fornecedor.entity';
import type { IFornecedorRepository } from '../../domain/repositories/i-fornecedor.repository';
import { I_FORNECEDOR_REPOSITORY } from '../../domain/repositories/i-fornecedor.repository';
import type { CriarFornecedorDto } from '../dtos/criar-fornecedor.dto';
import { FornecedorResponseDto } from '../dtos/fornecedor-response.dto';

@Injectable()
export class CriarFornecedorUseCase {
	public constructor(
		@Inject(I_FORNECEDOR_REPOSITORY)
		private readonly fornecedorRepository: IFornecedorRepository,
	) {}

	public async execute(dto: CriarFornecedorDto, usuarioId: number): Promise<FornecedorResponseDto> {
		const cleanDocumento = dto.documento.replace(/\D/g, '');

		const fornecedor = FornecedorEntity.create({
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

		const created = await this.fornecedorRepository.criar(fornecedor);

		return FornecedorResponseDto.fromEntity(created);
	}
}
