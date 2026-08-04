import { Component, computed, input } from '@angular/core';
import { joinClasses } from '../../utils/join-classes';

export type AppAvatarSize = 'sm' | 'md' | 'lg';

@Component({
	selector: 'app-avatar',
	templateUrl: './app-avatar.html',
})
export class AppAvatarComponent {
	public readonly name = input.required<string>();
	public readonly src = input<string>();
	public readonly size = input<AppAvatarSize>('md');
	public readonly status = input<'online' | 'offline' | null>(null);

	protected readonly initials = computed((): string => {
		const parts = this.name().trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) {
			return '?';
		}
		if (parts.length === 1) {
			return parts[0].slice(0, 2).toUpperCase();
		}
		return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
	});

	protected readonly sizeClasses = computed((): string => {
		const sizes: Record<AppAvatarSize, string> = {
			sm: 'h-8 w-8 text-xs',
			md: 'h-10 w-10 text-sm',
			lg: 'h-12 w-12 text-base',
		};
		return sizes[this.size()];
	});

	protected readonly statusClasses = computed((): string => {
		return joinClasses(
			'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface',
			this.status() === 'online' ? 'bg-success' : 'bg-text-muted',
		);
	});
}
