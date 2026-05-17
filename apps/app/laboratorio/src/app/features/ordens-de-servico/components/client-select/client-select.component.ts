import {
  Component,
  computed,
  forwardRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { take } from 'rxjs/operators';
import { ServiceOrdersApi } from '../../api/service-orders.api';
import {
  ServiceOrderClientOption,
  ServiceOrderTabelaMontagemOption,
} from '../../models/service-orders.model';

export interface ClientSelectionChange {
  clientId: string;
  tabelaOptions: ServiceOrderTabelaMontagemOption[];
}

@Component({
  selector: 'app-client-select',
  standalone: true,
  imports: [...BrnSelectImports, ...HlmSelectImports],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClientSelectComponent),
      multi: true,
    },
  ],
  template: `
    <hlm-select
      [value]="value()"
      [disabled]="isDisabled()"
      [itemToString]="clientToString"
      (valueChange)="onSelectChange($event)"
      placeholder="Selecione um cliente"
    >
      <hlm-select-trigger>
        <hlm-select-value />
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        @for (client of clients(); track client.id) {
          <hlm-select-item [value]="client.id">{{ client.name }}</hlm-select-item>
        }
      </hlm-select-content>
    </hlm-select>
  `,
})
export class ClientSelectComponent implements ControlValueAccessor, OnInit {
  readonly clientChanged = output<ClientSelectionChange>();

  private readonly api = inject(ServiceOrdersApi);

  readonly clients = signal<ServiceOrderClientOption[]>([]);
  private readonly allTabelaOptions = signal<ServiceOrderTabelaMontagemOption[]>([]);

  readonly value = signal<string>('');
  readonly isDisabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly clientToString = (id: string | null): string =>
    this.clients().find(c => c.id === id)?.name ?? id ?? '';

  readonly tabelaOptionsForClient = computed(() =>
    this.allTabelaOptions().filter(o => o.clientId === this.value()),
  );

  ngOnInit(): void {
    this.api.getClientes().pipe(take(1)).subscribe(clients => this.clients.set(clients));
    this.api.getTabelaMontagem().pipe(take(1)).subscribe(opts => this.allTabelaOptions.set(opts));
  }

  onSelectChange(clientId: string): void {
    this.value.set(clientId);
    this.onChange(clientId);
    this.onTouched();
    this.clientChanged.emit({
      clientId,
      tabelaOptions: this.allTabelaOptions().filter(o => o.clientId === clientId),
    });
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
