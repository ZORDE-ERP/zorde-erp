import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	ElementRef,
	inject,
	input,
	model,
	output,
	signal,
} from '@angular/core';
import {
	LucideChevronDown,
	LucideChevronLeft,
	LucideChevronRight,
	LucideChevronsUpDown,
	LucideDownload,
	LucideDynamicIcon,
	LucideEllipsisVertical,
	LucideEye,
	LucideFile,
	LucideFileText,
	LucideMail,
	LucidePencil,
	LucidePrinter,
	LucideQrCode,
	LucideSend,
	LucideTrash2,
	LucideX,
	provideLucideIcons,
} from '@lucide/angular';
import {
	AppAvatarComponent,
	AppBadgeComponent,
	AppBadgeVariant,
	AppCheckboxDirective,
	AppEmptyStateComponent,
	AppIconButtonDirective,
	AppSpinnerComponent,
} from '@repo/angular-ui';
import type {
	DataTableAction,
	DataTableActionEvent,
	DataTableAppearance,
	DataTableCellContext,
	DataTableColor,
	DataTableColumn,
	DataTablePaginationChange,
	DataTableRowId,
	DataTableSelectionChange,
	DataTableSort,
	DataTableToolbarAction,
	DataTableToolbarActionEvent,
} from './data-table.model';

const COLOR_CLASS: Record<DataTableColor, string> = {
	primary: 'bg-primary/10 text-primary',
	success: 'bg-success-muted text-success-foreground',
	warning: 'bg-warning-muted text-warning-foreground',
	error: 'bg-error-muted text-error-foreground',
	info: 'bg-info-muted text-info-foreground',
	neutral: 'bg-surface-muted text-text-secondary',
	blue: 'bg-primary/10 text-primary',
	green: 'bg-success-muted text-success-foreground',
	yellow: 'bg-warning-muted text-warning-foreground',
	red: 'bg-error-muted text-error-foreground',
	orange: 'bg-accent/10 text-accent',
};

const FOREGROUND_CLASS: Record<DataTableColor, string> = {
	primary: 'text-primary',
	success: 'text-success-foreground',
	warning: 'text-warning-foreground',
	error: 'text-error-foreground',
	info: 'text-info-foreground',
	neutral: 'text-text-secondary',
	blue: 'text-primary',
	green: 'text-success-foreground',
	yellow: 'text-warning-foreground',
	red: 'text-error',
	orange: 'text-orange-500 font-bold',
};

const BORDER_CLASS: Record<NonNullable<DataTableAppearance['border']>['side'], Record<DataTableColor, string>> = {
	left: {
		primary: 'border-l-4 border-l-primary',
		success: 'border-l-4 border-l-success',
		warning: 'border-l-4 border-l-warning',
		error: 'border-l-4 border-l-error',
		info: 'border-l-4 border-l-info',
		neutral: 'border-l-4 border-l-border-strong',
		blue: 'border-l-4 border-l-primary',
		green: 'border-l-4 border-l-success',
		yellow: 'border-l-4 border-l-warning',
		red: 'border-l-4 border-l-error',
		orange: 'border-l-4 border-l-accent',
	},
	right: {
		primary: 'border-r-4 border-r-primary',
		success: 'border-r-4 border-r-success',
		warning: 'border-r-4 border-r-warning',
		error: 'border-r-4 border-r-error',
		info: 'border-r-4 border-r-info',
		neutral: 'border-r-4 border-r-border-strong',
		blue: 'border-r-4 border-r-primary',
		green: 'border-r-4 border-r-success',
		yellow: 'border-r-4 border-r-warning',
		red: 'border-r-4 border-r-error',
		orange: 'border-r-4 border-r-accent',
	},
	top: {
		primary: 'border-t-4 border-t-primary',
		success: 'border-t-4 border-t-success',
		warning: 'border-t-4 border-t-warning',
		error: 'border-t-4 border-t-error',
		info: 'border-t-4 border-t-info',
		neutral: 'border-t-4 border-t-border-strong',
		blue: 'border-t-4 border-t-primary',
		green: 'border-t-4 border-t-success',
		yellow: 'border-t-4 border-t-warning',
		red: 'border-t-4 border-t-error',
		orange: 'border-t-4 border-t-accent',
	},
	bottom: {
		primary: 'border-b-4 border-b-primary',
		success: 'border-b-4 border-b-success',
		warning: 'border-b-4 border-b-warning',
		error: 'border-b-4 border-b-error',
		info: 'border-b-4 border-b-info',
		neutral: 'border-b-4 border-b-border-strong',
		blue: 'border-b-4 border-b-primary',
		green: 'border-b-4 border-b-success',
		yellow: 'border-b-4 border-b-warning',
		red: 'border-b-4 border-b-error',
		orange: 'border-b-4 border-b-accent',
	},
};

@Component({
	selector: 'app-data-table',
	imports: [
		NgTemplateOutlet,
		AppAvatarComponent,
		AppBadgeComponent,
		AppCheckboxDirective,
		AppEmptyStateComponent,
		AppIconButtonDirective,
		AppSpinnerComponent,
		LucideDynamicIcon,
	],
	providers: [
		provideLucideIcons(
			LucideChevronDown,
			LucideChevronLeft,
			LucideChevronRight,
			LucideChevronsUpDown,
			LucideEllipsisVertical,
			LucideDownload,
			LucideEye,
			LucideFile,
			LucideFileText,
			LucideMail,
			LucidePencil,
			LucidePrinter,
			LucideQrCode,
			LucideSend,
			LucideTrash2,
			LucideX,
		),
	],
	templateUrl: './data-table.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'block',
		'(document:click)': 'onDocumentClick($event)',
	},
})
export class DataTableComponent<T extends object = object> {
	private readonly elementRef = inject(ElementRef<HTMLElement>);

	/** Itens da lista atual. Com `serverPagination`, devem ser apenas os itens da página atual. */
	public readonly rows = input<readonly T[]>([]);
	// biome-ignore lint/suspicious/noExplicitAny: Angular does not infer generic component types from template inputs.
	public readonly columns = input.required<readonly DataTableColumn<any>[]>();
	public readonly rowId = input<string | ((row: T) => DataTableRowId)>('id');
	// biome-ignore lint/suspicious/noExplicitAny: accepts actions typed against the parent row interface.
	public readonly actions = input<readonly DataTableAction<any>[]>([]);
	// biome-ignore lint/suspicious/noExplicitAny: accepts actions typed against the parent row interface.
	public readonly toolbarActions = input<readonly DataTableToolbarAction<any>[]>([]);
	public readonly selectable = input(false);
	public readonly loading = input(false);
	public readonly emptyTitle = input('Nenhum registro encontrado');
	public readonly emptyDescription = input<string>();
	/** Altura máxima opcional para habilitar rolagem vertical da área da tabela. */
	public readonly maxHeight = input<string>();
	public readonly pagination = input(true);
	public readonly serverPagination = input(false);
	public readonly totalItems = input<number | null>(null);
	public readonly pageSizeOptions = input<readonly number[]>([10, 25, 50, 100]);
	public readonly ariaLabel = input('Tabela de dados');

	/** Estado controlável pelo pai com `[(page)]`, `[(pageSize)]`, `[(selectedIds)]` e `[(sort)]`. */
	public readonly page = model(1);
	public readonly pageSize = model(10);
	public readonly selectedIds = model<readonly DataTableRowId[]>([]);
	public readonly sort = model<DataTableSort | null>(null);

	public readonly actionTriggered = output<DataTableActionEvent>();
	public readonly toolbarActionTriggered = output<DataTableToolbarActionEvent>();
	public readonly selectionChanged = output<DataTableSelectionChange<T>>();
	public readonly paginationChanged = output<DataTablePaginationChange>();
	public readonly sortChanged = output<DataTableSort | null>();

	protected readonly openActionMenuId = signal<DataTableRowId | null>(null);

	protected readonly sortedRows = computed(() => {
		const sort = this.sort();
		const rows = [...this.rows()];
		if (!sort) {
			return rows;
		}

		return rows.sort((left, right) => {
			const result = String(this.valueForKey(left, sort.column)).localeCompare(
				String(this.valueForKey(right, sort.column)),
				'pt-BR',
				{
					numeric: true,
					sensitivity: 'base',
				},
			);
			return sort.direction === 'asc' ? result : -result;
		});
	});

	protected readonly total = computed(() => Math.max(0, this.totalItems() ?? this.rows().length));
	protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
	protected readonly activePage = computed(() => Math.min(Math.max(1, this.page()), this.pageCount()));
	protected readonly visibleRows = computed(() => {
		if (!this.pagination() || this.serverPagination()) {
			return this.sortedRows();
		}
		const offset = (this.activePage() - 1) * this.pageSize();
		return this.sortedRows().slice(offset, offset + this.pageSize());
	});
	protected readonly allVisibleSelected = computed(() => {
		const visible = this.visibleRows();
		return visible.length > 0 && visible.every((row) => this.selectedIds().includes(this.idOf(row)));
	});
	protected readonly someVisibleSelected = computed(() => {
		const visible = this.visibleRows();
		return !this.allVisibleSelected() && visible.some((row) => this.selectedIds().includes(this.idOf(row)));
	});

	protected rowIndex(index: number): number {
		return this.serverPagination() || !this.pagination() ? index : (this.activePage() - 1) * this.pageSize() + index;
	}

	protected idOf(row: T): DataTableRowId {
		const accessor = this.rowId();
		return typeof accessor === 'function' ? accessor(row) : (this.valueForKey(row, accessor) as DataTableRowId);
	}

	protected value(column: DataTableColumn<T>, row: T): unknown {
		return column.value ? column.value(row) : this.valueForKey(row, column.key);
	}

	protected textValue(column: DataTableColumn<T>, row: T): string {
		const value = this.value(column, row);
		return value === null || value === undefined ? '—' : String(value);
	}

	protected cellContext(column: DataTableColumn<T>, row: T, rowIndex: number): DataTableCellContext<T> {
		return { $implicit: row, row, column, value: this.value(column, row), rowIndex, rowId: this.idOf(row) };
	}

	protected cellClasses(column: DataTableColumn<T>, row: T): string {
		const appearance = typeof column.appearance === 'function' ? column.appearance(row) : column.appearance;
		return this.appearanceClasses(appearance);
	}

	protected badgeVariant(column: DataTableColumn<T>, row: T): AppBadgeVariant {
		return typeof column.badgeVariant === 'function' ? column.badgeVariant(row) : (column.badgeVariant ?? 'neutral');
	}

	protected iconName(column: DataTableColumn<T>, row: T): string {
		return typeof column.icon === 'function' ? column.icon(row) : (column.icon ?? this.textValue(column, row));
	}

	protected avatarName(column: DataTableColumn<T>, row: T): string {
		return column.avatarName?.(row) ?? this.textValue(column, row);
	}

	protected sortColumn(column: DataTableColumn<T>): void {
		if (!column.sortable) {
			return;
		}
		const current = this.sort();
		const next =
			current?.column === column.key && current.direction === 'asc'
				? { column: column.key, direction: 'desc' as const }
				: { column: column.key, direction: 'asc' as const };
		this.sort.set(next);
		this.sortChanged.emit(next);
		this.setPage(1);
	}

	protected sortLabel(column: DataTableColumn<T>): string {
		const sort = this.sort();
		if (sort?.column !== column.key) {
			return `Ordenar por ${column.header}`;
		}
		return sort.direction === 'asc'
			? `Ordenado por ${column.header}, crescente`
			: `Ordenado por ${column.header}, decrescente`;
	}

	protected isSorted(column: DataTableColumn<T>, direction: 'asc' | 'desc'): boolean {
		return this.sort()?.column === column.key && this.sort()?.direction === direction;
	}

	protected toggleVisibleSelection(checked: boolean): void {
		const visibleIds = this.visibleRows().map((row) => this.idOf(row));
		const selected = new Set(this.selectedIds());
		for (const id of visibleIds) {
			checked ? selected.add(id) : selected.delete(id);
		}
		this.updateSelection([...selected]);
	}

	protected toggleRowSelection(row: T, checked: boolean): void {
		const selected = new Set(this.selectedIds());
		const id = this.idOf(row);
		checked ? selected.add(id) : selected.delete(id);
		this.updateSelection([...selected]);
	}

	protected isSelected(row: T): boolean {
		return this.selectedIds().includes(this.idOf(row));
	}

	protected selectAction(action: DataTableAction<T>, row: T, rowIndex: number): void {
		if (this.isActionDisabled(action, row)) {
			return;
		}
		this.openActionMenuId.set(null);
		this.actionTriggered.emit({ action, row, rowId: this.idOf(row), rowIndex });
	}

	protected visibleActions(row: T): readonly DataTableAction<T>[] {
		return this.actions().filter((action) => !(typeof action.hidden === 'function' ? action.hidden(row) : action.hidden));
	}

	protected useActionMenu(row: T): boolean {
		console.log(this.visibleActions(row).length);
		return this.visibleActions(row).length >= 3;
	}

	protected isActionDisabled(action: DataTableAction<T>, row: T): boolean {
		return typeof action.disabled === 'function' ? action.disabled(row) : (action.disabled ?? false);
	}

	protected toggleActionMenu(row: T): void {
		const id = this.idOf(row);
		this.openActionMenuId.update((openId) => (openId === id ? null : id));
	}

	protected isActionMenuOpen(row: T): boolean {
		return this.openActionMenuId() === this.idOf(row);
	}

	protected isMenuNearBottom(index: number): boolean {
		return index >= this.visibleRows().length - 2;
	}

	protected runToolbarAction(action: DataTableToolbarAction<T>): void {
		const selectedRows = this.rows().filter((row) => this.selectedIds().includes(this.idOf(row)));
		if (typeof action.disabled === 'function' ? action.disabled(selectedRows) : action.disabled) {
			return;
		}
		this.toolbarActionTriggered.emit({ action, selectedIds: this.selectedIds(), selectedRows });
	}

	protected isToolbarActionDisabled(action: DataTableToolbarAction<T>): boolean {
		const selectedRows = this.rows().filter((row) => this.selectedIds().includes(this.idOf(row)));
		return typeof action.disabled === 'function' ? action.disabled(selectedRows) : (action.disabled ?? false);
	}

	protected setPage(page: number): void {
		const next = Math.min(Math.max(1, page), this.pageCount());
		if (next === this.activePage() && this.page() === next) {
			return;
		}
		this.page.set(next);
		this.paginationChanged.emit({ page: next, pageSize: this.pageSize() });
	}

	protected setPageSize(value: string): void {
		const pageSize = Number(value);
		if (!Number.isFinite(pageSize) || pageSize <= 0) {
			return;
		}
		this.pageSize.set(pageSize);
		this.page.set(1);
		this.paginationChanged.emit({ page: 1, pageSize });
	}

	protected pageLabel(): string {
		if (this.total() === 0) {
			return '0 itens';
		}
		const from = (this.activePage() - 1) * this.pageSize() + 1;
		const to = Math.min(from + this.visibleRows().length - 1, this.total());
		return `${from}–${to} de ${this.total()} itens`;
	}

	protected actionIcon(action: DataTableAction<T> | DataTableToolbarAction<T>): string | undefined {
		const aliases: Record<string, string> = {
			edit: 'pencil',
			delete: 'trash-2',
			view: 'eye',
			email: 'mail',
			export: 'download',
			print: 'printer',
			pdf: 'file-text',
			qrcode: 'qr-code',
		};
		return action.icon ? (aliases[action.icon] ?? action.icon) : undefined;
	}

	protected actionColor(action: DataTableAction<T> | DataTableToolbarAction<T>): string {
		return action.color ? FOREGROUND_CLASS[action.color] : 'text-text-primary';
	}

	protected actionMenuClasses(action: DataTableAction<T>): string {
		return `${this.appearanceClasses({
			background: action.color ?? 'neutral',
			border: { side: 'left', color: action.color ?? 'neutral' },
		})} mx-1 my-0.5 rounded-md hover:brightness-95`;
	}

	protected onDocumentClick(event: MouseEvent): void {
		if (!this.elementRef.nativeElement.contains(event.target as Node)) {
			this.openActionMenuId.set(null);
		}
	}

	private updateSelection(selectedIds: readonly DataTableRowId[]): void {
		this.selectedIds.set(selectedIds);
		const selectedRows = this.rows().filter((row) => selectedIds.includes(this.idOf(row)));
		this.selectionChanged.emit({ selectedIds, selectedRows });
	}

	private valueForKey(row: T, key: string): unknown {
		return key.split('.').reduce<unknown>((value, part) => {
			return value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined;
		}, row);
	}

	private appearanceClasses(appearance: DataTableAppearance | undefined): string {
		if (!appearance) {
			return '';
		}
		const classes = [
			appearance.background ? COLOR_CLASS[appearance.background] : '',
			appearance.foreground ? FOREGROUND_CLASS[appearance.foreground] : '',
		];
		if (appearance.border) {
			classes.push('border-0', BORDER_CLASS[appearance.border.side][appearance.border.color]);
		}
		return classes.filter(Boolean).join(' ');
	}
}
