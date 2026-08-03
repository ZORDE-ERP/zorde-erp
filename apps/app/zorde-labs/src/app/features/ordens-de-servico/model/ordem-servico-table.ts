import { formatBrlFromNumber, formatDateBr } from '@repo/angular-ui';
import type { DataTableAction, DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import type { OrdemServico, StatusOrdemServico } from '../models/ordem-servico.model';

const STATUS_LABEL: Record<StatusOrdemServico, string> = {
	LANCADA: 'Lançada',
	FATURADA: 'Faturada',
	CANCELADA: 'Cancelada',
};

export const ACTIONS: readonly DataTableAction<OrdemServico>[] = [
	{ value: 'status-lancada', label: 'Marcar lançada', icon: 'file', color: 'blue' },
	{ value: 'status-faturada', label: 'Marcar faturada', icon: 'file-text', color: 'green' },
	{ value: 'status-cancelada', label: 'Cancelar', icon: 'x', color: 'orange' },
	{ value: 'editar-obs', label: 'Editar observação', icon: 'pencil', color: 'orange' },
	{ value: 'excluir', label: 'Excluir', icon: 'delete', color: 'red' },
];

export const COLUMNS: readonly DataTableColumn<OrdemServico>[] = [
	{ key: 'codigoOs', header: 'Código OS', sortable: true, minWidth: '8rem' },
	{
		key: 'cliente',
		header: 'Cliente',
		sortable: true,
		minWidth: '10rem',
		value: (row: OrdemServico) => row.cliente?.nome ?? `Cliente #${row.clienteId}`,
	},
	{
		key: 'valorTotal',
		header: 'Valor total',
		align: 'right',
		minWidth: '8rem',
		value: (row: OrdemServico) => formatBrlFromNumber(row.valorTotal),
	},
	{
		key: 'status',
		header: 'Status',
		type: 'badge',
		align: 'center',
		minWidth: '7rem',
		badgeVariant: (row: OrdemServico) => {
			if (row.status === 'FATURADA') {
				return 'success';
			}
			if (row.status === 'CANCELADA') {
				return 'error';
			}
			return 'info';
		},
		value: (row: OrdemServico) => STATUS_LABEL[row.status],
	},
	{
		key: 'origem',
		header: 'Origem',
		minWidth: '7rem',
		value: (row: OrdemServico) => (row.origem === 'QR_SCAN' ? 'QR Scan' : 'Manual'),
	},
	{
		key: 'createdAt',
		header: 'Data',
		minWidth: '8rem',
		value: (row: OrdemServico) => formatDateBr(row.createdAt, true) || '—',
	},
];
