import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SERVICE_ORDERS_ROUTES } from './service-orders.routing';
import { ServiceOrdersContainerComponent } from './container/service-orders-container.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SERVICE_ORDERS_ROUTES),
    ServiceOrdersContainerComponent,
  ]
})
export class ServiceOrdersModule { }
