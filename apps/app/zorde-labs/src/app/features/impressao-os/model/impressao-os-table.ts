import { formatDateBr } from '@repo/angular-ui';
import { DataTableAction, DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { Cliente } from '../../clientes/models/cliente.model';

export const ACTIONS: readonly DataTableAction<Cliente>[] = [
	{ value: 'ver-qr', label: 'Ver QR', icon: 'qrcode', color: 'primary' },
	{ value: 'imprimir-folhas', label: 'Imprimir', icon: 'print', color: 'orange' },
];

export const COLUMNS: readonly DataTableColumn<Cliente>[] = [
	{ key: 'nome', header: 'Cliente', sortable: true, minWidth: '12rem' },
	{
		key: 'qrStatus',
		header: 'QR Code',
		type: 'badge',
		align: 'center',
		minWidth: '8rem',
		badgeVariant: (row) => (row.qrCodeUrl ? 'success' : 'neutral'),
		value: (row) => (row.qrCodeUrl ? 'QR ativo' : 'Sem QR'),
	},
	{
		key: 'qrGeradoEm',
		header: 'QR gerado em',
		sortable: true,
		minWidth: '10rem',
		value: (row) => (row.qrGeradoEm ? formatDateBr(row.qrGeradoEm, true) : '—'),
	},
];
