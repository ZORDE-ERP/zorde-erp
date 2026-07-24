import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatCpf, onlyDigits } from './mask.utils';

@Directive({
	selector: 'input[appCpfMask]',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AppCpfMaskDirective),
			multi: true,
		},
	],
	host: {
		'(input)': 'onInput($event)',
		'(blur)': 'onBlur()',
	},
})
export class AppCpfMaskDirective implements ControlValueAccessor {
	private readonly elementRef = inject(ElementRef<HTMLInputElement>);
	private onChange: (value: string) => void = () => undefined;
	private onTouched: () => void = () => undefined;

	protected onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		const digits = onlyDigits(target.value).slice(0, 11);
		const formatted = formatCpf(digits);
		target.value = formatted;
		this.onChange(digits);
	}

	protected onBlur(): void {
		this.onTouched();
	}

	public writeValue(value: string | null): void {
		this.elementRef.nativeElement.value = formatCpf(value ?? '');
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
