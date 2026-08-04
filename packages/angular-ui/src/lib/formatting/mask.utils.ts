export function onlyDigits(value: string): string {
	return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
	const digits = onlyDigits(value).slice(0, 11);
	const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 11)].filter(
		(part) => part.length > 0,
	);

	if (parts.length <= 1) {
		return parts[0] ?? '';
	}
	if (parts.length === 2) {
		return `${parts[0]}.${parts[1]}`;
	}
	if (parts.length === 3) {
		return `${parts[0]}.${parts[1]}.${parts[2]}`;
	}
	return `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}`;
}

export function formatCnpj(value: string): string {
	const digits = onlyDigits(value).slice(0, 14);
	const p1 = digits.slice(0, 2);
	const p2 = digits.slice(2, 5);
	const p3 = digits.slice(5, 8);
	const p4 = digits.slice(8, 12);
	const p5 = digits.slice(12, 14);

	let result = p1;
	if (p2) {
		result += `.${p2}`;
	}
	if (p3) {
		result += `.${p3}`;
	}
	if (p4) {
		result += `/${p4}`;
	}
	if (p5) {
		result += `-${p5}`;
	}
	return result;
}

/** Model value is number of cents as string digits, display is BRL currency. */
export function formatBrlFromDigits(digits: string): string {
	const normalized = onlyDigits(digits);
	if (!normalized) {
		return '';
	}
	const cents = Number.parseInt(normalized, 10);
	if (Number.isNaN(cents)) {
		return '';
	}
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(cents / 100);
}

export function formatBrlFromNumber(value: number | null | undefined): string {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return '';
	}
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value);
}

export function parseBrlDigitsToNumber(digits: string): number | null {
	const normalized = onlyDigits(digits);
	if (!normalized) {
		return null;
	}
	const cents = Number.parseInt(normalized, 10);
	if (Number.isNaN(cents)) {
		return null;
	}
	return cents / 100;
}
