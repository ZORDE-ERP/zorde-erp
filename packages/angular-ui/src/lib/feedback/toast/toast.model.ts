export type AppToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface AppToast {
	readonly id: string;
	readonly message: string;
	readonly variant: AppToastVariant;
}
