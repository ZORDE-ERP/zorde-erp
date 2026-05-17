import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CLIENTS_ROUTES } from './clients.routing';
import { ClientsContainerComponent } from './container/clients-container.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CLIENTS_ROUTES),
    ClientsContainerComponent
  ]
})
export class ClientsModule { }
