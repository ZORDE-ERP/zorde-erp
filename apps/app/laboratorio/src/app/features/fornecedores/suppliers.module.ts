import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SUPPLIERS_ROUTES } from './suppliers.routing';
import { SuppliersContainerComponent } from './container/suppliers-container.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SUPPLIERS_ROUTES),
    SuppliersContainerComponent
  ]
})
export class SuppliersModule { }
