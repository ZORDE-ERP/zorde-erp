import { formatCnpj, formatCpf, formatTelefone } from '@repo/angular-ui';
import { DataTableAction, DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { Fornecedor } from '../models/fornecedor.model';

export const ACTIONS: readonly DataTableAction<Fornecedor>[] = [
	{ value: 'editar', label: 'Editar', icon: 'pencil', color: 'orange' },
	{ value: 'excluir', label: 'Excluir', icon: 'delete', color: 'red' },
];

export const COLUMNS: readonly DataTableColumn<Fornecedor>[] = [
	{ key: 'nome', header: 'Nome', sortable: true, minWidth: '10rem' },
	{
		key: 'documento',
		header: 'Documento',
		sortable: true,
		minWidth: '9rem',
		value: (row) => (row.tipoPessoa === 'JURIDICA' ? formatCnpj(row.documento) : formatCpf(row.documento)),
	},
	{
		key: 'contato',
		header: 'Contato',
		minWidth: '9rem',
		value: (row) => (row.contato ? formatTelefone(row.contato) : '—'),
	},
	{
		key: 'status',
		header: 'Status',
		type: 'badge',
		align: 'center',
		minWidth: '6rem',
		badgeVariant: (row) => (row.status === 'ATIVO' ? 'success' : 'neutral'),
		value: (row) => (row.status === 'ATIVO' ? 'Ativo' : 'Inativo'),
	},
	{
		key: 'cidade',
		header: 'Cidade/UF',
		minWidth: '9rem',
		value: (row) => (row.cidade ? `${row.cidade}/${row.uf ?? ''}` : '—'),
	},
];
