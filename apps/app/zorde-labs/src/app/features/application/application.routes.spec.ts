import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { APPLICATION_ROUTES } from './application.routes';

describe('Application routes', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [provideRouter(APPLICATION_ROUTES)],
		}).compileComponents();
	});

	it('should navigate to servicos', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/servicos');
		expect(router.url).toBe('/servicos');
	});

	it('should navigate to clientes', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/clientes');
		expect(router.url).toBe('/clientes');
	});

	it('should navigate to fornecedores', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/fornecedores');
		expect(router.url).toBe('/fornecedores');
	});

	it('should navigate to tabela-de-servicos', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/tabela-de-servicos');
		expect(router.url).toBe('/tabela-de-servicos');
	});

	it('should navigate to ordens-de-servico', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/ordens-de-servico');
		expect(router.url).toBe('/ordens-de-servico');
	});

	it('should navigate to os/scan', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/os/scan');
		expect(router.url).toBe('/os/scan');
	});

	it('should navigate to impressao-os', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/impressao-os');
		expect(router.url).toBe('/impressao-os');
	});
});
