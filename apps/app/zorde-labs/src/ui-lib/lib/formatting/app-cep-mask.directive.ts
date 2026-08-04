import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatCep, onlyDigits } from './mask.utils';

@Directive({
	selector: 'input[appCepMask]',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AppCepMaskDirective),
			multi: true,
		},
	],
	host: {
		'(input)': 'onInput($event)',
		'(blur)': 'onBlur()',
	},
})
export class AppCepMaskDirective implements ControlValueAccessor {
	private readonly elementRef = inject(ElementRef<HTMLInputElement>);
	private onChange: (value: string) => void = () => undefined;
	private onTouched: () => void = () => undefined;

	protected onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		const digits = onlyDigits(target.value).slice(0, 8);
		const formatted = formatCep(digits);
		target.value = formatted;
		this.onChange(digits);
	}

	protected onBlur(): void {
		this.onTouched();
	}

	public writeValue(value: string | null): void {
		this.elementRef.nativeElement.value = formatCep(value ?? '');
	}

	public registerOnChange(fn: (value: string) => void): void {
		this.onChange = fn;
	}

	public registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	public setDisabledState(isDisabled: boolean): void {
		this.elementRef.nativeElement.disabled = isDisabled;
	}
}
