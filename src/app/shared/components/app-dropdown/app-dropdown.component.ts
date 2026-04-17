import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative" #triggerEl>
      <button
        type="button"
        (click)="toggle()"
        class="w-full flex items-center justify-between px-3 py-2.5 bg-cream/50 rounded-[14px]
               text-sm text-petrol border border-warm-border focus:border-earth
               focus:outline-none transition-colors">
        <span [class]="selectedOption() ? 'text-petrol' : 'text-stone/30'">
          {{ selectedOption() || placeholder }}
        </span>
        <lucide-icon [img]="iconChevron" [size]="14"
          class="text-stone/40 transition-transform duration-200"
          [class.rotate-180]="isOpen()">
        </lucide-icon>
      </button>
    </div>

    @if (isOpen()) {
      <div class="fixed bg-white rounded-[14px] border border-warm-border shadow-xl overflow-hidden"
           [style.top.px]="panelTop()"
           [style.left.px]="panelLeft()"
           [style.width.px]="panelWidth()"
           [style.zIndex]="9999">
        @for (option of options; track option) {
          <button
            type="button"
            (click)="select(option)"
            class="w-full px-3 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-cream/80"
            [class.bg-sand/50]="selectedOption() === option"
            [class.text-petrol]="selectedOption() === option"
            [class.text-stone]="selectedOption() !== option">
            {{ option }}
          </button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppDropdownComponent implements AfterViewInit {
  private el = inject(ElementRef);

  @Input() options: string[] = [];
  @Input() placeholder = 'Seleccionar...';
  @Output() selectedChange = new EventEmitter<string>();

  selectedOption = signal<string | null>(null);
  isOpen = signal(false);

  panelTop = signal(0);
  panelLeft = signal(0);
  panelWidth = signal(0);

  iconChevron = ChevronDown;

  ngAfterViewInit(): void {
    // Panel position will be calculated on toggle
  }

  private updatePosition(): void {
    const trigger = this.el.nativeElement.querySelector('#triggerEl') || this.el.nativeElement.firstElementChild;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      this.panelTop.set(rect.bottom + 4);
      this.panelLeft.set(rect.left);
      this.panelWidth.set(rect.width);
    }
  }

  toggle(): void {
    if (!this.isOpen()) {
      this.updatePosition();
    }
    this.isOpen.update(v => !v);
  }

  select(option: string): void {
    this.selectedOption.set(option);
    this.selectedChange.emit(option);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      // Also check if click is on the fixed panel
      const panel = document.querySelector('.fixed[style*="z-index: 9999"]');
      if (panel && panel.contains(event.target as Node)) {
        return; // Don't close - let the option click handler do it
      }
      this.isOpen.set(false);
    }
  }
}