import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmDialogImports } from 'src/app/shared/ui/dialog';
import { injectBrnDialogContext, BrnDialogRef } from '@spartan-ng/brain/dialog';
import {
  ServiceOrder,
  ServiceOrderTabelaMontagemOption,
  ServiceOrderUpsert,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES,
} from '../../models/service-orders.model';
import {
  ClientSelectComponent,
  ClientSelectionChange,
} from '../client-select/client-select.component';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-service-orders-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInput,
    HlmLabel,
    ...BrnSelectImports,
    ...HlmSelectImports,
    HlmDialogImports,
    HlmButton,
    ClientSelectComponent,
    NgxMaskDirective,
  ],
  templateUrl: './service-orders-form.component.html',
})
export class ServiceOrdersFormComponent implements OnInit {
  readonly saved = output<ServiceOrderUpsert>();
  readonly cancelled = output<void>();

  public readonly context = injectBrnDialogContext({ optional: true });
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });

  private fb = inject(FormBuilder);

  /** Tabelas do cliente selecionado (emitidas pelo ClientSelectComponent) */
  readonly clientTabelaOptions = signal<ServiceOrderTabelaMontagemOption[]>([]);

  /** True quando o cliente tem ao menos uma tabela de montagem */
  readonly hasTabela = computed(() => this.clientTabelaOptions().length > 0);

  /** Quando não há tabela, exibimos os tipos de serviço estáticos */
  readonly staticServiceTypes = SERVICE_TYPES;
  readonly serviceTypeLabels = SERVICE_TYPE_LABELS;

  /** Label de serviço selecionado no modo estático (sem tabela) — apenas UX */
  readonly selectedStaticService = signal<string>('');

  /** String do serviço para exibir no trigger quando há tabela */
  readonly tabelaToString = (id: string | null): string =>
    this.clientTabelaOptions().find(o => o.id === id)
      ? (this.serviceTypeLabels[this.clientTabelaOptions().find(o => o.id === id)!.serviceType] ??
        this.clientTabelaOptions().find(o => o.id === id)!.label)
      : (id ?? '');

  /** String do serviço estático */
  readonly staticToString = (v: string | null): string =>
    v ? (this.serviceTypeLabels[v as keyof typeof this.serviceTypeLabels] ?? v) : '';

  protected readonly submitted = signal(false);
  private readonly interactedControls = new Set<string>();

  form = this.fb.group({
    clientId: ['', Validators.required],
    tabelaMontagemId: [null as string | null],
    code: ['', Validators.required],
    assemblyValue: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    const order = this.context?.$implicit as ServiceOrder | undefined;

    if (order) {
      this.form.patchValue({
        clientId: order.clientId,
        tabelaMontagemId: order.tabelaMontagemId,
        code: order.code,
        assemblyValue: order.assemblyValue,
      });
    }

    // Quando uma tabela é selecionada, auto-preenche o valor
    this.form.controls.tabelaMontagemId.valueChanges.subscribe(tabelaId => {
      if (!tabelaId) return;
      const opt = this.clientTabelaOptions().find(o => o.id === tabelaId);
      if (opt) {
        this.form.patchValue({ assemblyValue: opt.value }, { emitEvent: false });
      }
    });
  }

  onClientChanged(event: ClientSelectionChange): void {
    this.clientTabelaOptions.set(event.tabelaOptions);
    this.selectedStaticService.set('');
    // Reseta serviço e valor ao trocar de cliente
    this.form.patchValue({ tabelaMontagemId: null, assemblyValue: 0 }, { emitEvent: false });
  }

  onStaticServiceChange(serviceType: string): void {
    this.selectedStaticService.set(serviceType);
    // Sem tabela → nenhuma auto-atribuição de valor; usuário preenche manualmente
    this.form.patchValue({ tabelaMontagemId: null }, { emitEvent: false });
  }

  protected markControlAsInteracted(controlName: string): void {
    this.interactedControls.add(controlName);
  }

  protected shouldShowError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return (
      !!control &&
      control.invalid &&
      (this.submitted() || (control.touched && this.interactedControls.has(controlName)))
    );
  }

  onSave(): void {
    this.submitted.set(true);

    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const rawValue = String(formValue.assemblyValue ?? '0').replace('R$ ', '').replace(/\./g, '').replace(',', '.');
      const payload: ServiceOrderUpsert = {
        code: formValue.code ?? '',
        clientId: formValue.clientId ?? '',
        tabelaMontagemId: formValue.tabelaMontagemId ?? null,
        assemblyValue: Number(rawValue),
      };
      this.saved.emit(payload);
      if (this.dialogRef) {
        this.dialogRef.close(payload);
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

