import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChecklistVisita, ChecklistItem, ChecklistEstado
} from '../../core/models/inmo.interface';
import { ChecklistGroupComponent } from '../../shared/components/checklist-group/checklist-group.component';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, ClipboardCheck, Save, RotateCcw, CheckCircle2, Heart, Star, Minus, Plus } from 'lucide-angular';

const DEFAULT_CHECKLIST: ChecklistVisita = {
  exterior: {
    id: 'exterior',
    nombre: 'Exterior',
    icono: 'building',
    items: [
      { id: 'ext-1', nombre: 'Fachada', estado: 'na' },
      { id: 'ext-2', nombre: 'Tejado / Cubierta', estado: 'na' },
      { id: 'ext-3', nombre: 'Portal y escaleras', estado: 'na' },
      { id: 'ext-4', nombre: 'Ascensor / Accesibilidad', estado: 'na' },
      { id: 'ext-5', nombre: 'Zona y orientación', estado: 'na' },
      { id: 'ext-6', nombre: 'Jardín / Terraza / Patio', estado: 'na' },
      { id: 'ext-7', nombre: 'Vallas / Cerramientos', estado: 'na' },
      { id: 'ext-8', nombre: 'Garaje / Trastero', estado: 'na' },
    ]
  },
  interior: {
    id: 'interior',
    nombre: 'Interior',
    icono: 'home',
    items: [
      { id: 'int-1', nombre: 'Distribución', estado: 'na' },
      { id: 'int-2', nombre: 'Luz natural', estado: 'na' },
      { id: 'int-3', nombre: 'Techos (altura, grietas)', estado: 'na' },
      { id: 'int-4', nombre: 'Suelos', estado: 'na' },
      { id: 'int-5', nombre: 'Cocina', estado: 'na' },
      { id: 'int-6', nombre: 'Baño(s)', estado: 'na' },
      { id: 'int-7', nombre: 'Tipo de calefacción', estado: 'na' },
      { id: 'int-8', nombre: 'Ventanas y persianas', estado: 'na' },
      { id: 'int-9', nombre: 'Puertas (interiores y entrada)', estado: 'na' },
      { id: 'int-10', nombre: 'Fontanería (grifos, tuberías visibles)', estado: 'na' },
      { id: 'int-11', nombre: 'Instalación eléctrica visible', estado: 'na' },
    ]
  },
  instalaciones: {
    id: 'instalaciones',
    nombre: 'Instalaciones',
    icono: 'wrench',
    items: [
      { id: 'ins-1', nombre: 'Caldera (ubicación, edad)', estado: 'na' },
      { id: 'ins-2', nombre: 'Cuadro eléctrico', estado: 'na' },
      { id: 'ins-3', nombre: 'Bajantes y tuberías', estado: 'na' },
      { id: 'ins-4', nombre: 'Aire acondicionado', estado: 'na' },
      { id: 'ins-5', nombre: 'Instalación de gas', estado: 'na' },
      { id: 'ins-6', nombre: 'Suministro de agua (presión)', estado: 'na' },
      { id: 'ins-7', nombre: 'Alumbrado comunitario', estado: 'na' },
      { id: 'ins-8', nombre: 'Antena / Fibra óptica', estado: 'na' },
    ]
  },
  entorno: {
    id: 'entorno',
    nombre: 'Entorno',
    icono: 'map-pin',
    items: [
      { id: 'ent-1', nombre: 'Ruidos', estado: 'na' },
      { id: 'ent-2', nombre: 'Vecinos', estado: 'na' },
      { id: 'ent-3', nombre: 'Servicios cercanos', estado: 'na' },
      { id: 'ent-4', nombre: 'Transporte público', estado: 'na' },
      { id: 'ent-5', nombre: 'Aparcamiento', estado: 'na' },
      { id: 'ent-6', nombre: 'Colegios / Centros educativos', estado: 'na' },
      { id: 'ent-7', nombre: 'Centros médicos', estado: 'na' },
      { id: 'ent-8', nombre: 'Comercios y mercados', estado: 'na' },
      { id: 'ent-9', nombre: 'Zonas verdes', estado: 'na' },
    ]
  }
};

@Component({
  selector: 'app-visitas',
  standalone: true,
  imports: [
    CommonModule,
    ChecklistGroupComponent,
    AppDropdownComponent,
    LucideAngularModule
  ],
  templateUrl: './visitas.page.html',
})
export class VisitasPage {
  checklist = signal<ChecklistVisita>(structuredClone(DEFAULT_CHECKLIST));
  feeling = signal(0);
  habitaciones = signal(0);
  banos = signal(0);
  calefaccion = signal<string | null>(null);
  ascensor = signal<string | null>(null);

  sectionKeys: (keyof ChecklistVisita)[] = ['exterior', 'interior', 'instalaciones', 'entorno'];
  feelingLabels = ['Paso', 'Dudoso', 'Neutral', 'Bueno', 'Top'];

  calefaccionOptions = ['Gas central', 'Individual gas', 'Eléctrica', 'Sin calefacción'];
  ascensorOptions = ['Sí', 'No', 'Con obra'];

  iconClipboard = ClipboardCheck;
  iconSave = Save;
  iconReset = RotateCcw;
  iconCheck = CheckCircle2;
  iconHeart = Heart;
  iconStar = Star;
  iconMinus = Minus;
  iconPlus = Plus;

  readonly globalCircumference = 2 * Math.PI * 20;

  totalItems = computed(() => {
    const c = this.checklist();
    return c.exterior.items.length + c.interior.items.length +
           c.instalaciones.items.length + c.entorno.items.length;
  });

  completedItems = computed(() => {
    const c = this.checklist();
    const all = [...c.exterior.items, ...c.interior.items,
                 ...c.instalaciones.items, ...c.entorno.items];
    return all.filter(i => i.estado !== 'na').length;
  });

  globalProgress = computed(() => {
    const total = this.totalItems();
    if (total === 0) return 0;
    return Math.round((this.completedItems() / total) * 100);
  });

  globalDashOffset = computed(() => {
    const progress = this.completedItems() / (this.totalItems() || 1);
    return this.globalCircumference * (1 - progress);
  });

  countByEstado(estado: ChecklistEstado): number {
    const c = this.checklist();
    const all = [...c.exterior.items, ...c.interior.items,
                 ...c.instalaciones.items, ...c.entorno.items];
    return all.filter(i => i.estado === estado).length;
  }

  onItemChanged(sectionKey: keyof ChecklistVisita, updatedItem: ChecklistItem): void {
    this.checklist.update(current => {
      const section = { ...current[sectionKey] };
      section.items = section.items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      return { ...current, [sectionKey]: section };
    });
  }

  getSectionIcon(key: string): any {
    return ClipboardCheck;
  }

  incrementHabitaciones(): void { this.habitaciones.update(v => v + 1); }
  decrementHabitaciones(): void { this.habitaciones.update(v => Math.max(0, v - 1)); }
  incrementBanos(): void { this.banos.update(v => v + 1); }
  decrementBanos(): void { this.banos.update(v => Math.max(0, v - 1)); }

  resetChecklist(): void {
    this.checklist.set(structuredClone(DEFAULT_CHECKLIST));
    this.feeling.set(0);
  }

  saveChecklist(): void {
    console.log('Checklist saved:', this.checklist(), 'Feeling:', this.feeling());
  }
}