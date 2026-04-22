import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-card.component.html',
  host: { style: 'display: block' }
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
