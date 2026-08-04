import { downloadBlob } from './download-blob';

describe('downloadBlob', () => {
	it('should create an object URL, trigger a click on a hidden anchor and revoke the URL', () => {
		const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
		const objectUrl = 'blob:mock-url';

		const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue(objectUrl);
		const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
		const clickSpy = vi.fn();
		const anchor = { href: '', download: '', click: clickSpy } as unknown as HTMLAnchorElement;
		const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);

		downloadBlob(blob, 'folhas-os-cliente.pdf');

		expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
		expect(createElementSpy).toHaveBeenCalledWith('a');
		expect(anchor.href).toBe(objectUrl);
		expect(anchor.download).toBe('folhas-os-cliente.pdf');
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(revokeObjectURLSpy).toHaveBeenCalledWith(objectUrl);

		createObjectURLSpy.mockRestore();
		revokeObjectURLSpy.mockRestore();
		createElementSpy.mockRestore();
	});
});
