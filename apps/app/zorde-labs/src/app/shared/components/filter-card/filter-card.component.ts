import { Component, input, model, output } from '@angular/core';
import { LucideChevronDown, LucideChevronUp, LucideFunnel } from '@lucide/angular';
import { AppButtonDirective, AppCardImports, AppIconButtonDirective } from '@repo/angular-ui';

@Component({
	selector: 'app-filter-card',
	templateUrl: './filter-card.component.html',
	imports: [...AppCardImports, AppButtonDirective, AppIconButtonDirective, LucideFunnel, LucideChevronDown, LucideChevronUp],
})
export class FilterCardComponent {
	/** Título do card de filtros. */
	public readonly title = input('Filtros');
	/** Descrição opcional abaixo do título. */
	public readonly description = input<string>();
	/** Controla se o conteúdo inicia/permanece aberto. Use `[(expanded)]` no pai. */
	public readonly expanded = model(true);
	/** Texto do botão de limpar. */
	public readonly clearLabel = input('Limpar filtros');

	public readonly cleared = output<void>();

	protected toggle(): void {
		this.expanded.update((open) => !open);
	}

	protected onClear(): void {
		this.cleared.emit();
	}
}
