import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmDialogImports } from 'src/app/shared/ui/dialog';
import { injectBrnDialogContext, BrnDialogRef } from '@spartan-ng/brain/dialog';
import { NgxMaskDirective } from 'ngx-mask';

import { TabelaMontagem, TipoServico, CreateTabelaMontagemDto } from '@zorde/shared-types';
import { ClienteOption } from '../../tabela-montagem.service';

@Component({
  selector: 'app-tabela-montagem-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...BrnSelectImports,
    ...HlmSelectImports,
    HlmInput,
    HlmLabel,
    HlmButton,
    HlmDialogImports,
    NgxMaskDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabela-montagem-modal.component.html',
})
export class TabelaMontagemModalComponent implements OnInit {
  clientes = input<ClienteOption[]>([]);
  initialData = input<TabelaMontagem | null>(null);

  save = output<CreateTabelaMontagemDto>();
  cancel = output<void>();

  readonly context = injectBrnDialogContext({ optional: true });
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });
  private fb = inject(FormBuilder);

  tiposServico = Object.values(TipoServico);

  form = this.fb.group({
    clienteId: [null as number | null, Validators.required],
    servico: [null as TipoServico | null, Validators.required],
    valor: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  get isEdit(): boolean {
    const data = this.context?.$implicit ?? this.initialData();
    return data != null;
  }

  ngOnInit(): void {
    const data: TabelaMontagem | null = this.context?.$implicit ?? this.initialData();
    if (data) {
      this.form.patchValue({
        clienteId: data.clienteId,
        servico: data.servico,
        valor: data.valor,
      });
    }

    const contextClientes: ClienteOption[] | undefined = this.context?.clientes;
    if (contextClientes && contextClientes.length > 0) {
      // clientes already provided via dialog context
    }
  }

  getClientes(): ClienteOption[] {
    return this.context?.clientes ?? this.clientes();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formValue = this.form.value;
    const rawValor = String(formValue.valor ?? '0').replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    
    const value: CreateTabelaMontagemDto = {
      clienteId: formValue.clienteId as number,
      servico: formValue.servico as TipoServico,
      valor: Number(rawValor)
    };
    this.save.emit(value);
    this.dialogRef?.close(value);
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef?.close();
  }
}
