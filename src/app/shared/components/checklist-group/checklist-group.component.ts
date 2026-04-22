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
  templateUrl: './checklist-group.component.html',
  host: { style: 'display: block' }
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