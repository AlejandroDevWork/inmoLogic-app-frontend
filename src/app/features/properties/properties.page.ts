import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { LucideAngularModule, Building2, Search, SlidersHorizontal } from 'lucide-angular';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    PropertyCardComponent,
    LucideAngularModule
  ],
  template: `
    <div class="px-5 pt-8 pb-32 space-y-6 bg-cream min-h-full overflow-y-auto">

          <!-- Header -->
          <div>
            <h1 class="text-xl font-bold text-petrol">Propiedades</h1>
            <p class="text-xs text-stone mt-1">Tu cartera inmobiliaria</p>
          </div>

          <!-- Search bar -->
          <div class="relative">
            <lucide-icon [img]="iconSearch" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone/50" [size]="16"></lucide-icon>
            <input
              type="text"
              placeholder="Buscar por dirección o zona..."
              (input)="onSearch($event)"
              class="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-md rounded-[16px] border border-white/40 shadow-sm
                     text-sm text-petrol placeholder:text-stone/40
                     focus:border-earth focus:outline-none transition-colors duration-200"
            />
          </div>

          <!-- Filter chips -->
          <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            @for (estado of estados; track estado.key) {
              <button
                (click)="filtroActual = estado.key"
                class="px-3.5 py-2 rounded-[14px] text-xs font-medium whitespace-nowrap
                       transition-all duration-200"
                [class]="filtroActual === estado.key
                  ? 'bg-petrol text-white'
                  : 'bg-white/60 text-stone border border-white/40'"
              >
                {{ estado.nombre }}
                <span class="ml-1 opacity-60">({{ getCountByEstado(estado.key) }})</span>
              </button>
            }
          </div>

          <!-- Grid de propiedades -->
          @if (filteredProperties().length === 0) {
            <div class="bg-white/60 backdrop-blur-md rounded-[28px] border border-white/40 shadow-sm p-10 text-center">
              <div class="w-14 h-14 rounded-[18px] bg-sand/40 mx-auto mb-3 flex items-center justify-center">
                <lucide-icon [img]="iconBuilding2" class="text-stone/30" [size]="28"></lucide-icon>
              </div>
              <p class="text-sm text-petrol font-medium">Sin propiedades</p>
              <p class="text-xs text-stone mt-1">Añade tu primera oportunidad</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (propiedad of filteredProperties(); track propiedad.id) {
                <app-property-card [property]="propiedad"
                                   (cardClick)="onPropertyClick($event)">
                </app-property-card>
              }
            </div>
          }

    </div>
  `
})
export class PropertiesPage {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  readonly properties = this.propertyService.properties;
  filtroActual = 'todos';
  searchTerm = '';

  iconBuilding2 = Building2;
  iconSearch = Search;
  iconFilter = SlidersHorizontal;

  estados = [
    { key: 'todos', nombre: 'Todas' },
    { key: 'analisis', nombre: 'Analizando' },
    { key: 'visita', nombre: 'Visita' },
    { key: 'oferta', nombre: 'En negociación' },
    { key: 'arras', nombre: 'Arras' },
    { key: 'alquilado', nombre: 'Alquilado' }
  ];

  readonly filteredProperties = computed(() => {
    let props = this.properties();
    if (this.filtroActual !== 'todos') {
      props = props.filter(p => p.estado === this.filtroActual);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      props = props.filter(p =>
        p.direccion.toLowerCase().includes(term) ||
        p.zona.toLowerCase().includes(term)
      );
    }
    return props;
  });

  getCountByEstado(estado: string): number {
    if (estado === 'todos') return this.properties().length;
    return this.properties().filter(p => p.estado === estado).length;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onPropertyClick(property: any): void {
    this.router.navigate(['/properties', property.id]);
  }
}