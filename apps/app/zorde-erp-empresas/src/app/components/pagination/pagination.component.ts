import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container">
      <div class="pagination-info">
        <span>
          Mostrando {{ (skip + 1) }} a {{ Math.min(skip + take, total) }} de {{ total }} registros
        </span>
        <select [(ngModel)]="pageSize" (change)="onPageSizeChange()" class="page-size-select">
          <option value="5">5 por página</option>
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>

      <div class="pagination-buttons">
        <button
          (click)="onPrevious()"
          [disabled]="skip === 0"
          class="btn-paginate"
        >
          ← Anterior
        </button>

        <div class="page-numbers">
          <button
            *ngFor="let page of pageNumbers"
            (click)="onPageClick(page)"
            [class.active]="page === currentPage"
            class="page-btn"
          >
            {{ page }}
          </button>
        </div>

        <button
          (click)="onNext()"
          [disabled]="skip + take >= total"
          class="btn-paginate"
        >
          Próximo →
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 8px;
        margin-top: 1rem;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .pagination-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: #666;
        font-size: 0.875rem;
      }

      .page-size-select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.875rem;
        cursor: pointer;
      }

      .pagination-buttons {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-paginate {
        padding: 0.5rem 1rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s;
      }

      .btn-paginate:hover:not(:disabled) {
        background: #5568d3;
        transform: translateY(-2px);
      }

      .btn-paginate:disabled {
        background: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .page-numbers {
        display: flex;
        gap: 0.25rem;
      }

      .page-btn {
        padding: 0.5rem 0.75rem;
        background: white;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.3s;
      }

      .page-btn:hover {
        background: #f0f0f0;
      }

      .page-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      @media (max-width: 768px) {
        .pagination-container {
          flex-direction: column;
          align-items: stretch;
        }

        .pagination-info,
        .pagination-buttons {
          justify-content: center;
        }

        .page-numbers {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() total = 0;
  @Input() skip = 0;
  @Input() take = 10;
  @Output() pageChange = new EventEmitter<{ skip: number; take: number }>();

  Math = Math;
  pageSize: any = 10;
  currentPage = 1;

  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.total / this.take);
    const maxButtons = 5;
    const numbers: number[] = [];

    let start = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  onPrevious(): void {
    if (this.skip >= this.take) {
      const newSkip = this.skip - this.take;
      this.skip = newSkip;
      this.currentPage = Math.floor(newSkip / this.take) + 1;
      this.pageChange.emit({ skip: newSkip, take: this.take });
    }
  }

  onNext(): void {
    if (this.skip + this.take < this.total) {
      const newSkip = this.skip + this.take;
      this.skip = newSkip;
      this.currentPage = Math.floor(newSkip / this.take) + 1;
      this.pageChange.emit({ skip: newSkip, take: this.take });
    }
  }

  onPageClick(page: number): void {
    const newSkip = (page - 1) * this.take;
    this.skip = newSkip;
    this.currentPage = page;
    this.pageChange.emit({ skip: newSkip, take: this.take });
  }

  onPageSizeChange(): void {
    const newPageSize = parseInt(this.pageSize, 10);
    this.take = newPageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.pageChange.emit({ skip: 0, take: newPageSize });
  }
}
