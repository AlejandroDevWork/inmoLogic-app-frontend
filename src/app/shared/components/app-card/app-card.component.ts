import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="
        bg-warm-white
        rounded-2xl
        border
        border-warm-border
        transition-all
        duration-200
      "
      [class.shadow-sm]="shadow === 'sm'"
      [class.shadow-md]="shadow === 'md'"
      [class.shadow-lg]="shadow === 'lg'"
      [class.cursor-pointer]="hoverable"
      [class.hover:shadow-md]="hoverable"
      [class.hover:border-earth/30]="hoverable"
      (mouseenter)="isHovered = true"
      (mouseleave)="isHovered = false"
    >
      <!-- Header Opcional -->
      @if (title || subtitle) {
        <div
          class="
            border-b
            border-warm-border
            px-4
            py-3
          "
          [class.rounded-t-xl]="!title && !subtitle"
        >
          @if (title) {
            <h3
              class="text-base font-semibold text-petrol"
              [class.text-earth]="accent"
            >
              {{ title }}
            </h3>
          }
          @if (subtitle) {
            <p class="mt-0.5 text-sm text-stone">{{ subtitle }}</p>
          }
        </div>
      }

      <!-- Contenido -->
      <div
        class="
          [paddingClass]
        "
      >
        <ng-content />
      </div>

      <!-- Footer Opcional (para acciones) -->
      @if (showFooter) {
        <div class="border-t border-warm-border px-4 py-3">
          <ng-content select="[card-footer]" />
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padding: CardPadding = 'md';
  @Input() shadow: CardShadow = 'sm';
  @Input() hoverable = false;
  @Input() accent = false;
  @Input() showFooter = false;

  isHovered = false;

  get paddingClass(): string {
    const paddingMap: Record<CardPadding, string> = {
      none: '',
      sm: 'px-3 py-2.5',
      md: 'px-4 py-4',
      lg: 'px-6 py-6'
    };
    return paddingMap[this.padding];
  }
}
