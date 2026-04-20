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
  template: `
    <div class="p-4 lg:p-6 space-y-6 bg-cream min-h-full max-w-2xl lg:max-w-5xl mx-auto overflow-y-auto">

          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <lucide-icon [img]="iconClipboard" class="text-earth" [size]="20"></lucide-icon>
                <h1 class="text-xl font-bold text-petrol">Visita Pro</h1>
              </div>
              <p class="text-xs text-stone">Checklist profesional de evaluación</p>
            </div>

            <!-- Global progress ring -->
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-lg font-bold text-petrol">{{ globalProgress() }}%</p>
                <p class="text-[10px] text-stone">{{ completedItems() }}/{{ totalItems() }}</p>
              </div>
              <div class="relative w-12 h-12">
                <svg class="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#F0EBE3" stroke-width="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#D4A373" stroke-width="4"
                          [attr.stroke-dasharray]="globalCircumference"
                          [attr.stroke-dashoffset]="globalDashOffset()"
                          stroke-linecap="round"
                          class="transition-all duration-700" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <lucide-icon [img]="iconCheck"
                    [class]="globalProgress() === 100 ? 'text-emerald-500' : 'text-stone/40'"
                    [size]="18"></lucide-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Action bar -->
          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-2 px-5 py-2.5 bg-petrol text-white rounded-[16px]
                     text-sm font-medium shadow-sm transition-all duration-200 active:scale-95"
              (click)="saveChecklist()"
            >
              <lucide-icon [img]="iconSave" [size]="16"></lucide-icon>
              Guardar
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 bg-cream text-stone rounded-[16px]
                     text-sm font-medium border border-warm-border
                     transition-all duration-200 active:scale-95"
              (click)="resetChecklist()"
            >
              <lucide-icon [img]="iconReset" [size]="16"></lucide-icon>
              Limpiar
            </button>
          </div>

          <!-- Summary bar -->
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3.5">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3 text-[11px]">
                <div class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-md bg-emerald-500"></span>
                  <span class="text-stone">{{ countByEstado('bueno') }} Bueno</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-md bg-amber-400"></span>
                  <span class="text-stone">{{ countByEstado('regular') }} Regular</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-md bg-red-400"></span>
                  <span class="text-stone">{{ countByEstado('malo') }} Malo</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="w-2.5 h-2.5 rounded-md bg-stone/15"></span>
                  <span class="text-stone">{{ countByEstado('na') }} N/A</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Checklist Accordion Sections -->
          <div class="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            @for (sectionKey of sectionKeys; track sectionKey) {
              <app-checklist-group
                [section]="checklist()[sectionKey]"
                [sectionIcon]="getSectionIcon(sectionKey)"
                (itemChanged)="onItemChanged(sectionKey, $event)"
              />
            }
          </div>

          <!-- Interior visual inputs -->
          <div class="bg-white rounded-[28px] border border-warm-border shadow-sm p-5">
            <h3 class="text-sm font-semibold text-petrol mb-4">Datos del inmueble</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">m²</label>
                <input type="number" placeholder="75"
                  class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                         text-sm text-petrol placeholder:text-stone/30
                         border border-warm-border focus:border-earth
                         focus:outline-none transition-colors" />
              </div>
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Habitaciones</label>
                <div class="flex items-center mt-1 gap-2">
                  <button (click)="decrementHabitaciones()"
                    class="w-9 h-9 rounded-[12px] bg-sand/60 flex items-center justify-center text-petrol
                           transition-all duration-200 active:scale-90 hover:bg-sand">
                    <lucide-icon [img]="iconMinus" [size]="14"></lucide-icon>
                  </button>
                  <span class="w-8 text-center text-sm font-semibold text-petrol">{{ habitaciones() }}</span>
                  <button (click)="incrementHabitaciones()"
                    class="w-9 h-9 rounded-[12px] bg-sand/60 flex items-center justify-center text-petrol
                           transition-all duration-200 active:scale-90 hover:bg-sand">
                    <lucide-icon [img]="iconPlus" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Baños</label>
                <div class="flex items-center mt-1 gap-2">
                  <button (click)="decrementBanos()"
                    class="w-9 h-9 rounded-[12px] bg-sand/60 flex items-center justify-center text-petrol
                           transition-all duration-200 active:scale-90 hover:bg-sand">
                    <lucide-icon [img]="iconMinus" [size]="14"></lucide-icon>
                  </button>
                  <span class="w-8 text-center text-sm font-semibold text-petrol">{{ banos() }}</span>
                  <button (click)="incrementBanos()"
                    class="w-9 h-9 rounded-[12px] bg-sand/60 flex items-center justify-center text-petrol
                           transition-all duration-200 active:scale-90 hover:bg-sand">
                    <lucide-icon [img]="iconPlus" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Calefacción</label>
                <div class="mt-1">
                  <app-dropdown [options]="calefaccionOptions" placeholder="Seleccionar..."
                    (selectedChange)="calefaccion.set($event)"></app-dropdown>
                </div>
              </div>
              <div class="col-span-2">
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Ascensor</label>
                <div class="mt-1">
                  <app-dropdown [options]="ascensorOptions" placeholder="Seleccionar..."
                    (selectedChange)="ascensor.set($event)"></app-dropdown>
                </div>
              </div>
            </div>
          </div>

          <!-- Feeling Scale -->
          <div class="bg-white rounded-[28px] border border-warm-border shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <lucide-icon [img]="iconHeart" class="text-earth" [size]="16"></lucide-icon>
              <h3 class="text-sm font-semibold text-petrol">Feeling del vendedor</h3>
            </div>
            <p class="text-[11px] text-stone mb-4">¿Qué percepción transmite el vendedor o propietario?</p>

            <div class="flex items-center gap-2">
              @for (val of [1, 2, 3, 4, 5]; track val) {
                <button
                  class="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[16px]
                         transition-all duration-300 active:scale-95"
                  [class]="feeling() === val ? 'bg-earth/15 border-2 border-earth' : 'bg-cream/40 border-2 border-transparent'"
                  (click)="feeling.set(val)"
                >
                  <lucide-icon [img]="iconHeart" [size]="16"
                    [class]="feeling() === val ? 'text-earth' : 'text-stone/20'">
                  </lucide-icon>
                  <span class="text-[10px] font-medium leading-tight"
                        [class]="feeling() === val ? 'text-earth-dark' : 'text-stone/50'">
                    {{ feelingLabels[val - 1] }}
                  </span>
                </button>
              }
            </div>

            @if (feeling() > 0) {
              <div class="mt-4 pt-3 border-t border-cream text-center">
                <p class="text-xs text-stone">
                  @if (feeling() <= 2) {
                    El vendedor no está motivado, puede haber margen
                  } @else if (feeling() === 3) {
                    Postura neutral, negociable
                  } @else if (feeling() === 4) {
                    Buen feeling, parece que hay acuerdo
                  } @else {
                    Excelente sintonía, muévete rápido
                  }
                </p>
              </div>
            }
          </div>

    </div>
  `
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