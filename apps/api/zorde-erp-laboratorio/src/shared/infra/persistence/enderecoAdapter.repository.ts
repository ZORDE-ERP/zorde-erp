import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { Endereco } from 'src/shared/interfaces/endereco.interface';

@Injectable()
export class EnderecoAdapterRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async create(address: Endereco): Promise<Endereco> {
		const { cep } = address;

		const existingAddress = await this.prisma.endereco.findUnique({
			where: { cep },
		});

		if (existingAddress) {
			return {
				cep: existingAddress.cep as string,
				uf: existingAddress.uf as string,
				cidade: existingAddress.cidade as string,
				logradouro: existingAddress.logradouro as string,
				bairro: existingAddress.bairro as string,
				complemento: existingAddress.complemento as string,
				ibge: existingAddress.ibge as string,
				createdAt: existingAddress.createdAt as Date,
				updatedAt: existingAddress.updatedAt as Date,
			};
		}

		const newAddress = await this.prisma.endereco.create({
			data: {
				cep,
				uf: address.uf,
				cidade: address.cidade,
				logradouro: address.logradouro,
				bairro: address.bairro,
				complemento: address.complemento,
				ibge: address.ibge,
				createdAt: new Date(),
			},
		});

		return {
			cep: newAddress.cep as string,
			uf: newAddress.uf as string,
			cidade: newAddress.cidade as string,
			logradouro: newAddress.logradouro as string,
			bairro: newAddress.bairro as string,
			complemento: newAddress.complemento as string,
			ibge: newAddress.ibge as string,
			createdAt: newAddress.createdAt as Date,
			updatedAt: newAddress.updatedAt as Date,
		};
	}

	public async findByCep(cep: string): Promise<Endereco | null> {
		const address = await this.prisma.endereco.findUnique({
			where: { cep },
		});

		if (!address) {
			return null;
		}

		return {
			cep: address.cep as string,
			uf: address.uf as string,
			cidade: address.cidade as string,
			logradouro: address.logradouro as string,
			bairro: address.bairro as string,
			complemento: address.complemento as string,
			ibge: address.ibge as string,
			createdAt: address.createdAt as Date,
			updatedAt: address.updatedAt as Date,
		};
	}
}
