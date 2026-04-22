import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-button.component.html',
  host: { style: 'display: inline-block' }
})
export class AppButtonComponent {
  @Input() label = '';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() icon: string | null = null;
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() buttonType: ButtonType = 'button';

  @Output() clicked = new EventEmitter<MouseEvent>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get buttonClasses(): string {
    const baseClasses = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantClasses: Record<ButtonVariant, string> = {
      primary: `
        bg-petrol text-white
        hover:bg-petrol-light
        focus:ring-petrol
        border border-transparent
      `,
      secondary: `
        bg-warm-white text-petrol
        hover:bg-sand
        focus:ring-petrol
        border border-warm-border
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-600
        border border-transparent
      `,
      ghost: `
        bg-transparent text-stone
        hover:bg-cream
        focus:ring-stone
        border border-transparent
      `
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return `
      ${baseClasses}
      ${variantClasses[this.variant]}
      ${sizeClasses[this.size]}
      ${this.fullWidth ? 'w-full' : ''}
    `;
  }

  get iconClasses(): string {
    const colorClasses: Record<ButtonVariant, string> = {
      primary: 'text-white',
      secondary: 'text-petrol',
      danger: 'text-white',
      ghost: 'text-stone'
    };
    return colorClasses[this.variant];
  }
}
