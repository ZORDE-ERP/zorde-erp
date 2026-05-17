import { Component, output, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, map, tap } from 'rxjs/operators';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmDialogImports } from 'src/app/shared/ui/dialog';
import { Client } from '../../models/client.model';
import { injectBrnDialogContext, BrnDialogRef } from '@spartan-ng/brain/dialog';
import { BrasilApiService } from '../../../../core/services/brasil-api.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-client-form',
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
    NgxMaskDirective,
  ],
  templateUrl: './client-form.component.html',
})
export class ClientFormComponent implements OnInit {
  readonly saved = output<Omit<Client, 'id'> | Client>();
  readonly cancelled = output<void>();
  protected readonly statusLabels: Record<Client['status'], string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
  };
  protected readonly submitted = signal(false);
  protected readonly loadingDocument = signal(false);
  protected readonly loadingCep = signal(false);
  protected readonly documentStatus = signal<'idle' | 'valid-cpf' | 'invalid-cpf' | 'invalid-cnpj' | 'cnpj-found' | 'valid-cnpj-not-found'>('idle');

  // Use Spartan dialog context if it was opened via Dialog
  public readonly context = injectBrnDialogContext({ optional: true });
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });

  private fb = inject(FormBuilder);
  private readonly brasilApi = inject(BrasilApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly interactedControls = new Set<string>();

  form = this.fb.group({
    id: [''],
    type: ['FISICA', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    contact: ['', Validators.required],
    document: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    zipCode: [''],
    street: [''],
    neighborhood: [''],
    state: [''],
    city: [''],
    number: [''],
    notes: ['']
  });

  ngOnInit() {
    const client = this.context?.$implicit;
    if (client) {
      this.form.patchValue(client);
    }

    // Documento (CPF/CNPJ): valida CPF/CNPJ localmente, busca CNPJ na BrasilAPI
    this.form.controls.document.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      map(v => (v ?? '').replace(/\D/g, '')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(digits => {
      if (digits.length === 11) {
        this.documentStatus.set(this.brasilApi.validateCpf(digits) ? 'valid-cpf' : 'invalid-cpf');
      } else if (digits.length === 14) {
        if (!this.brasilApi.validateCnpj(digits)) {
          this.documentStatus.set('invalid-cnpj');
        } else {
          this.loadingDocument.set(true);
          this.documentStatus.set('idle');
          this.brasilApi.lookupCnpj(digits).subscribe(data => {
            this.loadingDocument.set(false);
            if (data) {
              this.documentStatus.set('cnpj-found');
              this.form.patchValue({
                name: data.razao_social || data.nome_fantasia || '',
                email: data.email || '',
                contact: data.ddd_telefone_1 || '',
                street: data.logradouro || '',
                number: data.numero || '',
                neighborhood: data.bairro || '',
                city: data.municipio || '',
                state: data.uf || '',
                zipCode: data.cep || '',
              }, { emitEvent: false });
            } else {
              this.documentStatus.set('valid-cnpj-not-found');
            }
          });
        }
      } else {
        this.documentStatus.set('idle');
      }
    });

    // CEP: busca endereço na BrasilAPI
    this.form.controls.zipCode.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      map(v => (v ?? '').replace(/\D/g, '')),
      filter(digits => digits.length === 8),
      tap(() => this.loadingCep.set(true)),
      switchMap(digits => this.brasilApi.lookupCep(digits)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      this.loadingCep.set(false);
      if (data) {
        this.form.patchValue({
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        }, { emitEvent: false });
      }
    });
  }

  protected markControlAsInteracted(controlName: string): void {
    this.interactedControls.add(controlName);
  }

  protected shouldShowError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return !!control && control.invalid && (this.submitted() || (control.touched && this.interactedControls.has(controlName)));
  }

  onSave(): void {
    this.submitted.set(true);

    if (this.form.valid) {
      const formValue = this.form.getRawValue() as any;
      this.saved.emit(formValue);
      if (this.dialogRef) {
        this.dialogRef.close(formValue);
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
