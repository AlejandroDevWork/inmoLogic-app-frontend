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
  templateUrl: './app-input.component.html',
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
