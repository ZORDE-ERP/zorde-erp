import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from 'src/app/shared/ui/input';
import { HlmLabel } from 'src/app/shared/ui/label';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmButton } from 'src/app/shared/ui/button';
import { FilterCardComponent } from '../../../../shared/components/filter-card/filter-card.component';
import { SuppliersFilter } from '../../state/suppliers.state';

@Component({
  selector: 'app-suppliers-filter',
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
  templateUrl: './suppliers-filter.component.html',
})
export class SuppliersFilterComponent {
  readonly isExpanded = input<boolean>(false);
  readonly filterChanged = output<SuppliersFilter>();
  readonly filterCleared = output<void>();
  readonly toggleExpanded = output<void>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [''],
    document: [''],
    state: [''],
    status: ['']
  });

  onSearch(): void {
    this.filterChanged.emit(this.form.value as SuppliersFilter);
  }

  onClear(): void {
    this.form.reset();
    this.filterCleared.emit();
  }

  onToggle(): void {
    this.toggleExpanded.emit();
  }
}
