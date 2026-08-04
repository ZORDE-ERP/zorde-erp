import { formatCnpj, formatCpf, formatTelefone } from '@repo/angular-ui';
import { DataTableAction, DataTableColumn } from '../../../shared/components/data-table/data-table.model';
import { Cliente } from '../models/cliente.model';

export const ACTIONS: readonly DataTableAction<Cliente>[] = [
	{ value: 'editar', label: 'Editar', icon: 'pencil', color: 'orange' },
	{ value: 'excluir', label: 'Excluir', icon: 'delete', color: 'red' },
];

export const COLUMNS: readonly DataTableColumn<Cliente>[] = [
	{
		key: 'nome',
		header: 'Nome',
		sortable: true,
		minWidth: '12rem',
		type: 'avatar',
		value: (row: Cliente) => row.logoUrl ?? '',
		avatarName: (row: Cliente) => row.nome,
	},
	{
		key: 'documento',
		header: 'Documento',
		sortable: true,
		minWidth: '9rem',
		value: (row: Cliente) => (row.tipoPessoa === 'JURIDICA' ? formatCnpj(row.documento) : formatCpf(row.documento)),
	},
	{
		key: 'contato',
		header: 'Contato',
		minWidth: '9rem',
		value: (row: Cliente) => (row.contato ? formatTelefone(row.contato) : '—'),
	},
	{
		key: 'status',
		header: 'Status',
		type: 'badge',
		align: 'center',
		minWidth: '6rem',
		badgeVariant: (row: Cliente) => (row.status === 'ATIVO' ? 'success' : 'neutral'),
		value: (row: Cliente) => (row.status === 'ATIVO' ? 'Ativo' : 'Inativo'),
	},
	{
		key: 'cidade',
		header: 'Cidade/UF',
		minWidth: '9rem',
		value: (row: Cliente) => (row.cidade ? `${row.cidade}/${row.uf ?? ''}` : '—'),
	},
];
