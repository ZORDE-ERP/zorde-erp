import {
	DataTableAction,
	DataTableColumn,
	DataTableToolbarAction,
} from '../../../shared/components/data-table/data-table.model';
import { Servico } from '../models/service.model';

export const ACTIONS: readonly DataTableAction<Servico>[] = [
	{ value: 'editar', label: 'Editar', icon: 'pencil', color: 'orange' },
	{ value: 'excluir', label: 'Excluir', icon: 'delete', color: 'red' },
];

export const TOOLBAR_ACTIONS: readonly DataTableToolbarAction<Servico>[] = [
	{ value: 'export', label: 'Exportar CSV', icon: 'export', color: 'primary' },
	{ value: 'print', label: 'Imprimir', icon: 'print', color: 'orange' },
];

export const COLUMNS: readonly DataTableColumn<Servico>[] = [
	{ key: 'nome', header: 'Nome', sortable: true, minWidth: '7rem' },
	{ key: 'descricao', header: 'Descrição', sortable: true, minWidth: '10rem' },
];
