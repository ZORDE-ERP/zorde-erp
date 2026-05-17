import { Component, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmButton } from 'src/app/shared/ui/button';
import { HlmDialogImports } from 'src/app/shared/ui/dialog';
import { Supplier } from '../../models/supplier.model';
import { injectBrnDialogContext, BrnDialogRef } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'app-supplier-form',
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
  ],
  templateUrl: './supplier-form.component.html',
})
export class SupplierFormComponent implements OnInit {
  readonly saved = output<Omit<Supplier, 'id'> | Supplier>();
  readonly cancelled = output<void>();
  protected readonly statusLabels: Record<Supplier['status'], string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
  };
  protected readonly submitted = signal(false);

  // Use Spartan dialog context if it was opened via Dialog
  public readonly context = injectBrnDialogContext({ optional: true });
  private readonly dialogRef = inject(BrnDialogRef, { optional: true });

  private fb = inject(FormBuilder);
  private readonly interactedControls = new Set<string>();

  form = this.fb.group({
    id: [''],
    type: ['JURIDICA', Validators.required],
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
    const supplier = this.context?.$implicit;
    if (supplier) {
      this.form.patchValue(supplier);
    }
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
