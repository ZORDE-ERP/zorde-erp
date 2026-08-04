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

export function formatCep(value: string): string {
	const digits = onlyDigits(value).slice(0, 8);
	const parts = [digits.slice(0, 5), digits.slice(5, 8)].filter((part) => part.length > 0);

	if (parts.length <= 1) {
		return parts[0] ?? '';
	}
	return `${parts[0]}-${parts[1]}`;
}

export function formatTelefone(value: string): string {
	const digits = onlyDigits(value).slice(0, 11);

	if (digits.length <= 2) {
		return digits;
	}

	const ddd = digits.slice(0, 2);
	const rest = digits.slice(2);

	if (rest.length <= 4) {
		return `(${ddd}) ${rest}`;
	}

	const isCellphone = digits.length > 10;
	const splitIndex = isCellphone ? 5 : 4;
	const firstPart = rest.slice(0, splitIndex);
	const secondPart = rest.slice(splitIndex);

	if (!secondPart) {
		return `(${ddd}) ${firstPart}`;
	}
	return `(${ddd}) ${firstPart}-${secondPart}`;
}

function pad2(value: number): string {
	return value.toString().padStart(2, '0');
}

/**
 * Formats a date to Brazilian format (dd/MM/yyyy or dd/MM/yyyy HH:mm).
 * Accepts an ISO string, a Date instance, or an already formatted dd/MM/yyyy string.
 * Date-only ISO strings (YYYY-MM-DD) are parsed as local dates to avoid UTC shift.
 */
export function formatDateBr(value: string | Date | null | undefined, withTime = false): string {
	if (!value) {
		return '';
	}

	let date: Date;

	if (value instanceof Date) {
		date = value;
	} else {
		const trimmed = value.trim();
		if (!trimmed) {
			return '';
		}

		const alreadyBr = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}))?$/.exec(trimmed);
		if (alreadyBr) {
			const [, day, month, year, hours, minutes] = alreadyBr;
			if (!withTime || !hours) {
				return `${day}/${month}/${year}`;
			}
			return `${day}/${month}/${year} ${hours}:${minutes}`;
		}

		const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
		if (dateOnly) {
			const [, year, month, day] = dateOnly;
			date = new Date(Number(year), Number(month) - 1, Number(day));
		} else {
			date = new Date(trimmed);
		}
	}

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	const day = pad2(date.getDate());
	const month = pad2(date.getMonth() + 1);
	const year = date.getFullYear();

	if (!withTime) {
		return `${day}/${month}/${year}`;
	}

	const hours = pad2(date.getHours());
	const minutes = pad2(date.getMinutes());
	return `${day}/${month}/${year} ${hours}:${minutes}`;
}
