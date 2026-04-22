import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface TableColumn {
  label: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './app-data-table.component.html',
  host: { style: 'display: block' }
})
export class AppDataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() hasData = true;
  @Input() emptyIcon: any = null;
  @Input() emptyTitle = '';
  @Input() emptySubtitle = '';

  headerClass(col: TableColumn, index: number): string {
    const alignMap: Record<string, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };
    const align = alignMap[col.align ?? 'left'] ?? 'text-left';
    const px = index === 0 ? 'px-4' : 'px-3';
    return `${align} ${px} py-3 text-[11px] text-stone font-semibold uppercase tracking-wide`;
  }
}