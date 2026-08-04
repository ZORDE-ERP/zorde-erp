import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
	AppCepMaskDirective,
	AppCnpjMaskDirective,
	AppCpfMaskDirective,
	AppFieldComponent,
	AppInputDirective,
	AppSelectDirective,
	AppSpinnerComponent,
	AppTelefoneMaskDirective,
	AppTextareaDirective,
	onlyDigits,
} from '@repo/angular-ui';
import { CepLookupService } from '../../providers/cep-lookup.service';
import { CnpjLookupService } from '../../providers/cnpj-lookup.service';
import { EMPTY_PESSOA_FORM_VALUE, PessoaFormValue } from './pessoa-form.model';

export type PessoaFormSection = 'dados' | 'endereco' | 'all';

@Component({
	selector: 'app-pessoa-form',
	templateUrl: './pessoa-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		FormsModule,
		AppFieldComponent,
		AppInputDirective,
		AppSelectDirective,
		AppTextareaDirective,
		AppSpinnerComponent,
		AppCpfMaskDirective,
		AppCnpjMaskDirective,
		AppCepMaskDirective,
		AppTelefoneMaskDirective,
	],
})
export class PessoaFormComponent {
	private readonly cnpjLookupService = inject(CnpjLookupService);
	private readonly cepLookupService = inject(CepLookupService);
	private readonly destroyRef = inject(DestroyRef);

	public readonly value = model<PessoaFormValue>(EMPTY_PESSOA_FORM_VALUE);
	/** Controla quais seções renderizar (útil com tabs no modal). */
	public readonly section = input<PessoaFormSection>('all');

	protected readonly cnpjLoading = signal(false);
	protected readonly cnpjWarning = signal(false);
	protected readonly cepLoading = signal(false);
	protected readonly cepWarning = signal(false);

	protected readonly showDados = computed((): boolean => {
		const section = this.section();
		return section === 'all' || section === 'dados';
	});

	protected readonly showEndereco = computed((): boolean => {
		const section = this.section();
		return section === 'all' || section === 'endereco';
	});

	protected readonly showSectionHeading = computed((): boolean => this.section() === 'all');

	protected isJuridica(): boolean {
		return this.value().tipoPessoa === 'JURIDICA';
	}

	protected setField<K extends keyof PessoaFormValue>(key: K, fieldValue: PessoaFormValue[K]): void {
		this.value.update((current) => ({ ...current, [key]: fieldValue }));
	}

	protected onTipoPessoaChange(tipoPessoa: string): void {
		this.cnpjWarning.set(false);
		this.setField('tipoPessoa', tipoPessoa === 'JURIDICA' ? 'JURIDICA' : 'FISICA');
	}

	protected onDocumentoChange(documento: string): void {
		this.setField('documento', documento);

		if (!this.isJuridica()) {
			return;
		}

		const digits = onlyDigits(documento);
		if (digits.length === 14) {
			this.lookupCnpj(digits);
		}
	}

	protected onCepChange(cep: string): void {
		this.setField('cep', cep);

		const digits = onlyDigits(cep);
		if (digits.length === 8) {
			this.lookupCep(digits);
		}
	}

	protected onNumeroChange(numero: string): void {
		this.value.update((current) => ({ ...current, numero, numeroEndereco: numero }));
	}

	private lookupCnpj(cnpj: string): void {
		this.cnpjWarning.set(false);
		this.cnpjLoading.set(true);

		this.cnpjLookupService
			.buscar(cnpj)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((empresa) => {
				this.cnpjLoading.set(false);

				if (!empresa) {
					this.cnpjWarning.set(true);
					return;
				}

				this.value.update((current) => ({
					...current,
					razaoSocial: current.razaoSocial || empresa.razaoSocial,
					nomeFantasia: current.nomeFantasia || empresa.nomeFantasia,
					email: current.email || empresa.email,
					contato: current.contato || empresa.telefone,
					cep: current.cep || empresa.cep,
					uf: current.uf || empresa.uf,
					cidade: current.cidade || empresa.cidade,
					logradouro: current.logradouro || empresa.logradouro,
					bairro: current.bairro || empresa.bairro,
					numero: current.numero || empresa.numero,
					numeroEndereco: current.numeroEndereco || empresa.numero,
					complemento: current.complemento || empresa.complemento,
				}));
			});
	}

	private lookupCep(cep: string): void {
		this.cepWarning.set(false);
		this.cepLoading.set(true);

		this.cepLookupService
			.buscar(cep)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((endereco) => {
				this.cepLoading.set(false);

				if (!endereco) {
					this.cepWarning.set(true);
					return;
				}

				this.value.update((current) => ({
					...current,
					uf: endereco.uf || current.uf,
					cidade: endereco.cidade || current.cidade,
					logradouro: endereco.logradouro || current.logradouro,
					bairro: endereco.bairro || current.bairro,
					ibge: endereco.ibge || current.ibge,
					cep: endereco.cep || current.cep,
				}));
			});
	}
}
