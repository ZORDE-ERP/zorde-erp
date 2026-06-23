import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Fornecedor = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  compras?: unknown[];
};

type FornecedorForm = {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
};

const API_URL = 'http://localhost:3001/fornecedores';
const EMPTY_FORM: FornecedorForm = {
  nome: '',
  email: '',
  telefone: '',
  endereco: '',
};

@Component({
  selector: 'app-fornecedores',
  imports: [FormsModule],
  templateUrl: './fornecedores.html',
  styleUrl: './fornecedores.scss',
})
export class Fornecedores {
  private readonly http = inject(HttpClient);

  fornecedores = signal<Fornecedor[]>([]);
  form: FornecedorForm = { ...EMPTY_FORM };
  editingId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  constructor() {
    this.loadFornecedores();
  }

  loadFornecedores() {
    this.loading.set(true);
    this.error.set('');

    this.http.get<Fornecedor[]>(API_URL).subscribe({
      next: (fornecedores) => {
        this.fornecedores.set(fornecedores);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao foi possivel carregar os fornecedores.');
        this.loading.set(false);
      },
    });
  }

  save() {
    const data = { ...this.form };

    if (!data.nome.trim() || !data.email.trim() || !data.telefone.trim() || !data.endereco.trim()) {
      this.error.set('Preencha todos os campos.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const editingId = this.editingId();
    const request = editingId
      ? this.http.patch<Fornecedor>(`${API_URL}/${editingId}`, data)
      : this.http.post<Fornecedor>(API_URL, data);

    request.subscribe({
      next: () => {
        this.resetForm();
        this.saving.set(false);
        this.loadFornecedores();
      },
      error: () => {
        this.error.set('Nao foi possivel salvar o fornecedor.');
        this.saving.set(false);
      },
    });
  }

  edit(fornecedor: Fornecedor) {
    this.editingId.set(fornecedor.id);
    this.form = {
      nome: fornecedor.nome,
      email: fornecedor.email,
      telefone: fornecedor.telefone,
      endereco: fornecedor.endereco,
    };
  }

  remove(fornecedor: Fornecedor) {
    const shouldRemove = window.confirm(`Excluir fornecedor "${fornecedor.nome}"?`);

    if (!shouldRemove) {
      return;
    }

    this.error.set('');

    this.http.delete(`${API_URL}/${fornecedor.id}`).subscribe({
      next: () => this.loadFornecedores(),
      error: () => this.error.set('Nao foi possivel excluir o fornecedor.'),
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }
}
