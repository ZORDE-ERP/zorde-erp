/**
 * Extrai clienteId (c), token (t) e codigoFolha (f) de uma URL ou código bipado.
 * Para folha impressa, `f` é obrigatório.
 */
export function parseOsScanInput(raw: string): { clienteId: number; token: string; codigoFolha: string } | null {
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
		const codigoFolha = url.searchParams.get('f')?.trim() || url.searchParams.get('codigoFolha')?.trim() || '';

		if (!Number.isFinite(clienteId) || clienteId <= 0 || !token || !codigoFolha) {
			return null;
		}

		return { clienteId, token, codigoFolha };
	} catch {
		return null;
	}
}
