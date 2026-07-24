import { Directive, ElementRef, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatBrlFromDigits, onlyDigits, parseBrlDigitsToNumber } from './mask.utils';

@Directive({
	selector: 'input[appBrlCurrencyMask]',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => AppBrlCurrencyMaskDirective),
			multi: true,
		},
	],
	host: {
		'(input)': 'onInput($event)',
		'(blur)': 'onBlur()',
	},
})
export class AppBrlCurrencyMaskDirective implements ControlValueAccessor {
	private readonly elementRef = inject(ElementRef<HTMLInputElement>);
	private onChange: (value: number | null) => void = () => undefined;
	private onTouched: () => void = () => undefined;

	protected onInput(event: Event): void {
		const target = event.target as HTMLInputElement;
		const digits = onlyDigits(target.value).slice(0, 15);
		target.value = formatBrlFromDigits(digits);
		this.onChange(parseBrlDigitsToNumber(digits));
	}

	protected onBlur(): void {
		this.onTouched();
	}

	public writeValue(value: number | null): void {
		if (value === null || value === undefined) {
			this.elementRef.nativeElement.value = '';
			return;
		}
		const cents = Math.round(value * 100).toString();
		this.elementRef.nativeElement.value = formatBrlFromDigits(cents);
	}

	public registerOnChange(fn: (value: number | null) => void): void {
		this.onChange = fn;
	}

	public registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	public setDisabledState(isDisabled: boolean): void {
		this.elementRef.nativeElement.disabled = isDisabled;
	}
}
