/**
 * Extrai clienteId (c), token (t) e opcionalmente codigoFolha de uma URL ou código bipado.
 */
export function parseOsScanInput(raw: string): { clienteId: number; token: string; codigoFolha?: string } | null {
	const trimmed = raw.trim();
	if (!trimmed) {
		return null;
	}

	try {
		const url = trimmed.includes('://')
			? new URL(trimmed)
			: new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, 'http://local');

		const clienteId = Number(url.searchParams.get('c'));
		const token = url.searchParams.get('t')?.trim() ?? '';
		const codigoFolha = url.searchParams.get('f')?.trim() || url.searchParams.get('codigoFolha')?.trim() || undefined;

		if (!Number.isFinite(clienteId) || clienteId <= 0 || !token) {
			return null;
		}

		return { clienteId, token, codigoFolha };
	} catch {
		return null;
	}
}
