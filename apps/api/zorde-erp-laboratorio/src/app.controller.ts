import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/publicRoutes.decorator';

@Controller()
export class AppController {
	public constructor(private readonly appService: AppService) {}

	@Public()
	@Get()
	public getHello(): string {
		return this.appService.getHello();
	}
}
