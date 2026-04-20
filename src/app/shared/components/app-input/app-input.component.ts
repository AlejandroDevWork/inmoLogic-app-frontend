import { Component, Input, Optional, Self, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  NgControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type InputType =
  | 'text'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'search'
  | 'date'
  | 'datetime-local';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <!-- Label -->
      <label [for]="inputId" class="block text-sm font-medium text-petrol mb-1.5">
        {{ label }}
        @if (required) {
          <span class="text-red-500">*</span>
        }
      </label>

      <!-- Input Field -->
      <input
        [id]="inputId"
        [type]="type"
        [formControl]="internalControl!"
        [value]="value"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (input)="onInput($event)"
        class="
          w-full
          px-4
          py-2.5
          text-petrol
          bg-white
          border
          rounded-xl
          outline-none
          transition-all
          duration-200
          disabled:bg-cream
          disabled:text-stone
          disabled:cursor-not-allowed
          placeholder:text-stone/50
        "
        [class.border-warm-border]="!isFocused && !hasError"
        [class.border-petrol]="isFocused && !hasError"
        [class.border-red-500]="hasError"
        [class.ring-2]="isFocused || hasError"
        [class.ring-petrol/10]="isFocused && !hasError"
        [class.ring-red-500/10]="hasError"
        [class.bg-sand]="disabled"
        [disabled]="disabled"
        [readonly]="readonly"
        [min]="min"
        [max]="max"
        [step]="step"
        [minlength]="minlength"
        [maxlength]="maxlength"
        [pattern]="pattern!"
        [placeholder]="placeholder"
      />

      <!-- Mensaje de Error -->
      @if (hasError && errorMessage) {
        <p class="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ errorMessage }}
        </p>
      }

      <!-- Helper Text -->
      @if (helperText && !hasError) {
        <p class="mt-1.5 text-xs text-stone">{{ helperText }}</p>
      }
    </div>
  `,
  styles: []
})
export class AppInputComponent implements OnInit, OnDestroy {
  @Input() label = '';
  @Input() type: InputType = 'text';
  @Input() value: string | number = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() helperText = '';
  @Input() errorState: boolean | null = null;
  @Input() customErrorMessage = '';

  // Atributos HTML nativos
  @Input() min: string | number | null = null;
  @Input() max: string | number | null = null;
  @Input() step: string | number | null = null;
  @Input() minlength: number | null = null;
  @Input() maxlength: number | null = null;
  @Input() pattern: string | null = null;

  isFocused = false;
  internalControl: FormControl | null = null;
  private destroy$ = new Subject<void>();

  constructor(@Optional() @Self() public ngControl?: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // Si tiene FormControl externo, suscribirse a sus cambios
    if (this.ngControl?.control) {
      this.internalControl = this.ngControl.control as FormControl;

      if (this.required) {
        this.internalControl.setValidators([Validators.required]);
      }

      this.internalControl.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          // Trigger change detection si es necesario
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get inputId(): string {
    return `app-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  get hasValue(): boolean {
    const value = this.ngControl?.value ?? this.value;
    return value !== null && value !== undefined && value !== '';
  }

  get hasError(): boolean {
    if (this.errorState !== null) {
      return this.errorState;
    }
    return (this.ngControl?.invalid && this.ngControl?.touched) ?? false;
  }

  get errorMessage(): string {
    if (this.customErrorMessage) {
      return this.customErrorMessage;
    }

    if (!this.ngControl?.errors || !this.ngControl?.touched) {
      return '';
    }

    const errors = this.ngControl.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min'])
      return `Valor mínimo: ${errors['min'].min}`;
    if (errors['max'])
      return `Valor máximo: ${errors['max'].max}`;
    if (errors['pattern']) return 'Formato inválido';

    return 'Campo inválido';
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.ngControl?.control?.markAsTouched();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const formattedValue = this.type === 'number' ? parseFloat(value) : value;

    if (this.ngControl?.valueAccessor) {
      (this.ngControl.valueAccessor as any).writeValue(formattedValue);
      (this.ngControl.valueAccessor as any).onChange?.(formattedValue);
    } else {
      this.value = formattedValue;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChange: any = () => {};
  onTouched: any = () => {};
}
