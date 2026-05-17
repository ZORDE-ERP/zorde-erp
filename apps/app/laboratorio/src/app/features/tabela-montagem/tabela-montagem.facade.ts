import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TabelaMontagemService, ClienteOption } from './tabela-montagem.service';
import {
  TabelaMontagem,
  CreateTabelaMontagemDto,
  UpdateTabelaMontagemDto,
} from '@zorde/shared-types';

@Injectable({ providedIn: 'root' })
export class TabelaMontagemFacade {
  private service = inject(TabelaMontagemService);
  private destroyRef = inject(DestroyRef);

  // ── State signals ────────────────────────────────────────────────────────────
  items = signal<TabelaMontagem[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  searchTerm = signal<string>('');
  clientes = signal<ClienteOption[]>([]);

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize()) || 1);

  // ── Search debounce ──────────────────────────────────────────────────────────
  private search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(term => {
        this.searchTerm.set(term);
        this.currentPage.set(1);
        this.load();
      });
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getAll(this.currentPage(), this.pageSize(), this.searchTerm())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.items.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erro ao carregar registros.');
          this.loading.set(false);
        },
      });
  }

  create(dto: CreateTabelaMontagemDto): void {
    this.loading.set(true);
    this.service.create(dto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.load();
      },
      error: () => {
        this.error.set('Erro ao criar registro.');
        this.loading.set(false);
      },
    });
  }

  update(id: number, dto: UpdateTabelaMontagemDto): void {
    this.loading.set(true);
    this.service.update(id, dto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.load(),
      error: () => {
        this.error.set('Erro ao atualizar registro.');
        this.loading.set(false);
      },
    });
  }

  remove(id: number): void {
    this.loading.set(true);
    this.service.remove(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.load(),
      error: () => {
        this.error.set('Erro ao excluir registro.');
        this.loading.set(false);
      },
    });
  }

  setSearch(term: string): void {
    this.search$.next(term);
  }

  setPage(page: number): void {
    this.currentPage.set(page);
    this.load();
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.load();
  }

  loadClientes(): void {
    this.service.getClientes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => this.clientes.set(list),
      error: () => {},
    });
  }
}
