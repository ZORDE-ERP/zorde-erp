import { Injectable, inject, Type } from '@angular/core';
import { HlmDialogService } from 'src/app/shared/ui/dialog';
import { Observable } from 'rxjs';
import { ModalConfig } from './modal.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private dialogService = inject(HlmDialogService);

  open<T = any, R = any>(component: Type<any>, config?: ModalConfig<T>): Observable<R | undefined> {
    const dialogRef = this.dialogService.open(component, {
      context: this.buildContext(config?.data),
      contentClass: this.getSizeClass(config?.size)
    });
    
    return dialogRef.closed$ as Observable<R | undefined>;
  }

  private buildContext<T>(data?: T): Record<string, unknown> | undefined {
    if (data === undefined) {
      return undefined;
    }

    if (data !== null && typeof data === 'object') {
      return {
        ...(data as Record<string, unknown>),
        $implicit: data,
      };
    }

    return {
      $implicit: data,
    };
  }

  private getSizeClass(size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'): string {
    switch(size) {
      case 'sm': return 'sm:max-w-[425px]';
      case 'lg': return 'sm:max-w-[800px]';
      case 'xl': return 'sm:max-w-[1140px]';
      case 'full': return 'sm:max-w-[100vw] sm:h-[100vh] rounded-none';
      case 'md':
      default:
        return 'sm:max-w-[600px]';
    }
  }
}
