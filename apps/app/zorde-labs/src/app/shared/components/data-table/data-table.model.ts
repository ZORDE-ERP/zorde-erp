import type { TemplateRef } from '@angular/core';
import type { AppBadgeVariant } from '@repo/angular-ui';

export type DataTableRowId = string | number;

/**
 * Paleta semântica e atalhos de cor para destaque visual de células, linhas e ações.
 * `blue`, `green`, `yellow`, `red` e `orange` usam os tokens do design system.
 */
export type DataTableColor =
	| 'primary'
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral'
	| 'blue'
	| 'green'
	| 'yellow'
	| 'red'
	| 'orange';

export type DataTableBorderSide = 'left' | 'right' | 'top' | 'bottom';

export type DataTableCellType = 'text' | 'badge' | 'image' | 'avatar' | 'icon';

export interface DataTableCellContext<T> {
	readonly $implicit: T;
	readonly row: T;
	readonly column: DataTableColumn<T>;
	readonly value: unknown;
	readonly rowIndex: number;
	readonly rowId: DataTableRowId;
}

export interface DataTableAppearance {
	readonly background?: DataTableColor;
	readonly foreground?: DataTableColor;
	readonly border?: {
		readonly side: DataTableBorderSide;
		readonly color: DataTableColor;
	};
}

export interface DataTableColumn<T> {
	readonly key: string;
	readonly header: string;
	readonly sortable?: boolean;
	readonly width?: string;
	readonly minWidth?: string;
	readonly align?: 'left' | 'center' | 'right';
	readonly type?: DataTableCellType;
	readonly template?: TemplateRef<DataTableCellContext<T>>;
	readonly value?: (row: T) => unknown;
	readonly imageAlt?: (row: T) => string;
	readonly avatarName?: (row: T) => string;
	readonly icon?: string | ((row: T) => string);
	readonly badgeVariant?: AppBadgeVariant | ((row: T) => AppBadgeVariant);
	readonly appearance?: DataTableAppearance | ((row: T) => DataTableAppearance | undefined);
}

export interface DataTableAction<T> {
	readonly value: string;
	readonly label: string;
	readonly icon?: string;
	readonly color?: DataTableColor;
	readonly disabled?: boolean | ((row: T) => boolean);
	readonly hidden?: boolean | ((row: T) => boolean);
}

export interface DataTableToolbarAction<T> {
	readonly value: string;
	readonly label: string;
	readonly icon?: string;
	readonly color?: DataTableColor;
	readonly disabled?: boolean | ((selectedRows: readonly T[]) => boolean);
}

/** Dados da ação que são relevantes para quem consome o evento. */
export interface DataTableActionDetail {
	readonly value: string;
	readonly label: string;
	readonly icon?: string;
	readonly color?: DataTableColor;
}

/** Dados da ação global que são relevantes para quem consome o evento. */
export interface DataTableToolbarActionDetail {
	readonly value: string;
	readonly label: string;
	readonly icon?: string;
	readonly color?: DataTableColor;
}

export interface DataTableActionEvent<T = unknown> {
	readonly action: DataTableActionDetail;
	readonly row: T;
	readonly rowId: DataTableRowId;
	readonly rowIndex: number;
}

export interface DataTableToolbarActionEvent<T = unknown> {
	readonly action: DataTableToolbarActionDetail;
	readonly selectedIds: readonly DataTableRowId[];
	readonly selectedRows: readonly T[];
}

export interface DataTableSelectionChange<T> {
	readonly selectedIds: readonly DataTableRowId[];
	readonly selectedRows: readonly T[];
}

export interface DataTableSort {
	readonly column: string;
	readonly direction: 'asc' | 'desc';
}

export interface DataTablePaginationChange {
	readonly page: number;
	readonly pageSize: number;
}
