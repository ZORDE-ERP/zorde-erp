import { randomBytes } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { EnderecoAdapterRepository } from 'src/shared/infra/persistence/enderecoAdapter.repository';
import { ClienteEntity } from '../../domain/entities/cliente.entity';
import type { IClienteRepository } from '../../domain/repositories/cliente.repository';
import { ICLIENTE_REPOSITORY } from '../../domain/repositories/cliente.repository';
import { QrCodeImageService } from '../../infrastructure/services/qrCodeImage.service';
import { CriarClienteDto } from '../dtos/cliente.dto';
import type { ClienteResponseDto } from '../dtos/clienteResponse.dto';
import { clienteToResponse } from '../mappers/clienteResponse.mapper';

@Injectable()
export class CriarClienteUseCase {
	public constructor(
		@Inject(ICLIENTE_REPOSITORY)
		private readonly clienteRepository: IClienteRepository,
		private readonly enderecoAdapterRepository: EnderecoAdapterRepository,
		private readonly qrCodeImageService: QrCodeImageService,
	) {}

	public async execute(dto: CriarClienteDto, usuarioId: number): Promise<ClienteResponseDto> {
		const cleanDocumento = dto.documento.replace(/\D/g, '');

		const client = new ClienteEntity({
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

		const newClient = await this.clienteRepository.create(client);
		const clienteId = newClient.getId() as number;

		const token = randomBytes(32).toString('hex');
		const qrGeradoEm = new Date();
		const image = await this.qrCodeImageService.generateAndUpload(clienteId, token);

		const withQr = await this.clienteRepository.updateQrCode(clienteId, usuarioId, {
			qrToken: token,
			qrGeradoEm,
			qrCodeUrl: image.secureUrl,
			qrCodePublicId: image.publicId,
		});

		return clienteToResponse(withQr);
	}
}
