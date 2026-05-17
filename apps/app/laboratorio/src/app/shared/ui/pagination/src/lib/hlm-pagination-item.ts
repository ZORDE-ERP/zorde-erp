import { Directive } from '@angular/core';
import { classes } from 'src/app/shared/ui/utils';

@Directive({
  selector: 'li[hlmPaginationItem]',
  host: {
    'data-slot': 'pagination-item',
  },
})
export class HlmPaginationItem {
  constructor() {
    classes(() => '');
  }
}
