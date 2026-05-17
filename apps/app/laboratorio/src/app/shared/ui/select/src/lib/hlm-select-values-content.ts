import { Directive } from '@angular/core';
import { classes } from 'src/app/shared/ui/utils';

@Directive({ selector: '[hlmSelectValuesContent],hlm-select-values-content' })
export class HlmSelectValuesContent {
  constructor() {
    classes(() => 'flex gap-1');
  }
}
