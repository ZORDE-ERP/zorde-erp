export type SummaryCardVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface SummaryCardItem {
	/** Identificador estável do card (útil no clique / filtros). */
	id: string;
	/** Rótulo exibido acima do valor. */
	label: string;
	/** Valor principal (total, percentual, texto curto, etc.). */
	value: string | number;
	/** Nome do ícone Lucide (ex.: `layers`, `circle-check`). */
	icon?: string;
	/** Variante visual do valor e do ícone. */
	variant?: SummaryCardVariant;
	/**
	 * Se `false`, o card não emite clique e não tem affordance de botão.
	 * Default: `true`.
	 */
	clickable?: boolean;
	/** Payload livre para o pai (filtros, metadados, etc.). */
	data?: unknown;
}
