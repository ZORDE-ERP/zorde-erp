export class PedidoStatusChangedEvent {
  constructor(
    public pedidoId: string,
    public fromStageId: string,
    public toStageId: string,
    public organizationId: string,
    public changedBy: string,
  ) {}
}
