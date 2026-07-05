import type { ServiceOrderEntity } from '../entities/ordemDeServico.entity';

export const ISERVICE_ORDER_REPOSITORY = 'IServiceOrderRepository';

export interface IServiceOrderRepository {
	create(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity>;
	findById(id: number, usuarioId: number): Promise<ServiceOrderEntity | null>;
	findByUsuarioId(usuarioId: number): Promise<ServiceOrderEntity[]>;
	update(serviceOrder: ServiceOrderEntity): Promise<ServiceOrderEntity>;
	softDelete(id: number, usuarioId: number): Promise<void>;
}
