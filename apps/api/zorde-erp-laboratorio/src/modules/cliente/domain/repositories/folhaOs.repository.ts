import type { StatusFolhaOs } from '../../../../shared/enums/folha-os.enum';
import type { FolhaOsImpressaEntity } from '../entities/folhaOsImpressa.entity';

export const IFOLHA_OS_REPOSITORY = 'IFolhaOsRepository';

export interface CreateLoteComFolhasResult {
	loteId: number;
	quantidade: number;
	folhas: FolhaOsImpressaEntity[];
}

export interface IFolhaOsRepository {
	createLoteComFolhas(params: {
		clienteId: number;
		usuarioId: number;
		quantidade: number;
	}): Promise<CreateLoteComFolhasResult>;
	findById(id: number, usuarioId: number): Promise<FolhaOsImpressaEntity | null>;
	findByCodigoFolha(codigoFolha: string, usuarioId: number): Promise<FolhaOsImpressaEntity | null>;
	vincularOrdem(params: {
		folhaId: number;
		ordemDeServicoId: number;
		usuarioId: number;
		status: StatusFolhaOs;
	}): Promise<FolhaOsImpressaEntity>;
}
