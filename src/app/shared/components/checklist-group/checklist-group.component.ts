import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChecklistSection, ChecklistItem, ChecklistEstado
} from '../../../core/models/inmo.interface';
import { LucideAngularModule, ChevronDown, ChevronRight, Pencil } from 'lucide-angular';

@Component({
  selector: 'app-checklist-group',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bg-warm-white rounded-[24px] shadow-sm overflow-hidden">
      <!-- Header (Accordion) -->
      <button
        class="w-full flex items-center gap-3 p-4 text-left
               transition-colors duration-200 hover:bg-sand/50 active:bg-sand"
        (click)="toggleOpen()"
      >
        <div class="w-10 h-10 rounded-[14px] bg-sand flex items-center justify-center text-petrol">
          <lucide-icon [img]="sectionIcon" [size]="20"></lucide-icon>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-petrol">{{ section.nombre }}</h3>
          <p class="text-xs text-stone mt-0.5">
            {{ completedCount }}/{{ section.items.length }} completados
          </p>
        </div>

        <!-- Progress ring -->
        <div class="relative w-9 h-9">
          <svg class="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#F0EBE3" stroke-width="3" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#D4A373" stroke-width="3"
                    [attr.stroke-dasharray]="circumference"
                    [attr.stroke-dashoffset]="dashOffset"
                    stroke-linecap="round"
                    class="transition-all duration-500" />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-petrol">
            {{ progressPercent }}
          </span>
        </div>

        <lucide-icon
          [img]="isOpen() ? iconChevronDown : iconChevronRight"
          class="text-stone"
          [size]="18">
        </lucide-icon>
      </button>

      <!-- Items (collapsible) -->
      @if (isOpen()) {
        <div class="px-4 pb-4 space-y-2.5">
          <div class="h-px bg-warm-border"></div>

          @for (item of section.items; track item.id) {
            <div class="flex items-start gap-3 py-2">
              <!-- Status selector -->
              <div class="flex gap-1 flex-shrink-0 pt-0.5">
                @for (opt of estadoOptions; track opt.value) {
                  <button
                    class="w-7 h-7 rounded-lg text-[10px] font-semibold
                           transition-all duration-200 border"
                    [class]="item.estado === opt.value ? opt.activeClass : 'bg-cream text-stone border-warm-border'"
                    (click)="onEstadoChange(item, opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                }
              </div>

              <!-- Item name & notes -->
              <div class="flex-1 min-w-0">
                <span class="text-sm text-petrol">{{ item.nombre }}</span>
                <div class="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    [value]="item.notas || ''"
                    (input)="onNotaChange(item, $event)"
                    placeholder="Nota rápida..."
                    class="w-full text-xs text-stone bg-cream/60 rounded-lg px-2.5 py-1
                           border border-transparent focus:border-earth
                           focus:outline-none transition-colors duration-200
                           placeholder:text-stone/50"
                  />
                </div>
              </div>
            </div>
          }
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
export class ChecklistGroupComponent {
  @Input() section!: ChecklistSection;
  @Input() sectionIcon: any = ChevronRight;
  @Output() itemChanged = new EventEmitter<ChecklistItem>();

  isOpen = signal(true);

  iconChevronDown = ChevronDown;
  iconChevronRight = ChevronRight;

  readonly circumference = 2 * Math.PI * 14;

  estadoOptions: { value: ChecklistEstado; label: string; activeClass: string }[] = [
    { value: 'bueno', label: 'B', activeClass: 'bg-emerald-500 text-white border-emerald-500' },
    { value: 'regular', label: 'R', activeClass: 'bg-amber-400 text-white border-amber-400' },
    { value: 'malo', label: 'M', activeClass: 'bg-red-400 text-white border-red-400' },
    { value: 'na', label: '—', activeClass: 'bg-stone/20 text-stone border-stone/30' },
  ];

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  get completedCount(): number {
    return this.section.items.filter(i => i.estado !== 'na' || i.notas).length;
  }

  get progressPercent(): number {
    if (this.section.items.length === 0) return 0;
    return Math.round((this.completedCount / this.section.items.length) * 100);
  }

  get dashOffset(): number {
    const progress = this.completedCount / (this.section.items.length || 1);
    return this.circumference * (1 - progress);
  }

  onEstadoChange(item: ChecklistItem, estado: ChecklistEstado): void {
    const updated = { ...item, estado };
    this.itemChanged.emit(updated);
  }

  onNotaChange(item: ChecklistItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const updated = { ...item, notas: input.value };
    this.itemChanged.emit(updated);
  }
}