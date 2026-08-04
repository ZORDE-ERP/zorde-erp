import { twMerge } from 'tailwind-merge';

export function joinClasses(...parts: ReadonlyArray<string | false | null | undefined>): string {
	return twMerge(parts.filter(Boolean).join(' '));
}
