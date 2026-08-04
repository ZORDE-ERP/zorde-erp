import { ApplicationRef } from '@angular/core';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext): Promise<ApplicationRef> => {
	return bootstrapApplication(App, config, context);
};

export default bootstrap;
