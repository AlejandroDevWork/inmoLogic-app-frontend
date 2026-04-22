import { Component, Input, Output, EventEmitter, signal, ElementRef, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './app-dropdown.component.html',
  host: { style: 'display: block' }
})
export class AppDropdownComponent implements OnDestroy {
  private el = inject(ElementRef);

  @Input() options: string[] = [];
  @Input() placeholder = 'Seleccionar...';
  @Input() value: string | null = null;
  @Output() selectedChange = new EventEmitter<string>();

  selectedOption = signal<string | null>(null);
  isOpen = signal(false);

  // Capture-phase listener so stopPropagation in other components (e.g. modals) doesn't block us
  private handleDocumentClick = (event: Event): void => {
    this.onDocumentClick(event);
  };

  constructor() {
    document.addEventListener('click', this.handleDocumentClick, true);

    effect(() => {
      if (this.value !== undefined) {
        this.selectedOption.set(this.value);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleDocumentClick, true);
  }

  panelTop = signal<number | null>(null);
  panelBottom = signal<number | null>(null);
  panelLeft = signal(0);
  panelWidth = signal(0);

  iconChevron = ChevronDown;

  private updatePosition(): void {
    const trigger = this.el.nativeElement.querySelector('#triggerEl') || this.el.nativeElement.firstElementChild;
    if (trigger) {
      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 4;
      const estimatedPanelHeight = Math.min(this.options.length * 40, 240);

      this.panelLeft.set(rect.left);
      this.panelWidth.set(rect.width);

      if (spaceBelow >= estimatedPanelHeight || spaceBelow >= 120) {
        this.panelTop.set(rect.bottom + 4);
        this.panelBottom.set(null);
      } else {
        this.panelTop.set(null);
        this.panelBottom.set(viewportHeight - rect.top + 4);
      }
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

  onDocumentClick(event: Event): void {
    if (!this.isOpen()) return;
    if (this.el.nativeElement.contains(event.target)) return;
    // Also check if the click is inside our own fixed-position panel
    const panels = Array.from(document.querySelectorAll('.fixed[style*="z-index"]'));
    for (const panel of panels) {
      if (panel.contains(event.target as Node)) return;
    }
    this.isOpen.set(false);
  }
}