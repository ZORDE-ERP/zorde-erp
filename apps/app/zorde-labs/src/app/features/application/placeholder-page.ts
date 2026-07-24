import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-placeholder-page',
	template: '<p>{{ title() }} works</p>',
})
export class PlaceholderPage {
	private readonly route = inject(ActivatedRoute);
	private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

	protected readonly title = computed(() => {
		const { title } = this.routeData();
		return String(title ?? 'Página');
	});
}
