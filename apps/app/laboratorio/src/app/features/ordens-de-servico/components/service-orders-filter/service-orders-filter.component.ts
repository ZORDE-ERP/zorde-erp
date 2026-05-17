import { Component, OnInit, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmButton } from 'src/app/shared/ui/button';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { ServiceOrdersFilter } from '../../state/service-orders.state';
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  ServiceOrderClientOption,
} from '../../models/service-orders.model';
import { ServiceOrdersApi } from '../../api/service-orders.api';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-service-orders-filter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmLabel,
    ...BrnSelectImports,
    ...HlmSelectImports,
    HlmButton,
    FilterCardComponent,
  ],
  templateUrl: './service-orders-filter.component.html',
})
export class ServiceOrdersFilterComponent implements OnInit {
  readonly isExpanded = input<boolean>(false);
  readonly filterChanged = output<ServiceOrdersFilter>();
  readonly filterCleared = output<void>();
  readonly toggleExpanded = output<void>();

  private fb = inject(FormBuilder);
  private readonly api = inject(ServiceOrdersApi);

  readonly clients = signal<ServiceOrderClientOption[]>([]);
  readonly serviceTypes = SERVICE_TYPES;
  readonly serviceTypeLabels = SERVICE_TYPE_LABELS;

  form = this.fb.group({
    code: [''],
    clientId: [''],
    serviceType: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    this.api.getClientes().pipe(take(1)).subscribe(clients => this.clients.set(clients));
  }

  onSearch(): void {
    this.filterChanged.emit(this.form.value as ServiceOrdersFilter);
  }

  onClear(): void {
    this.form.reset();
    this.filterCleared.emit();
  }

  onToggle(): void {
    this.toggleExpanded.emit();
  }
}
