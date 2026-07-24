import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';

describe('Design system routes', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [provideRouter(routes)],
		}).compileComponents();
	});

	it('should navigate to playground overview', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/playground');
		expect(router.url).toBe('/playground');
	});

	it('should navigate to colors foundation page', async () => {
		const router = TestBed.inject(Router);
		await router.navigateByUrl('/playground/foundations/colors');
		expect(router.url).toBe('/playground/foundations/colors');
	});
});
