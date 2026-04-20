import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../core/models/inmo.interface';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { LucideAngularModule, MapPin, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, LucideAngularModule],
  template: `
    <div
      class="bg-white rounded-[28px] border border-warm-border shadow-sm
             overflow-hidden cursor-pointer transition-all duration-300
             hover:shadow-md hover:border-earth/20 active:scale-[0.98]"
      (click)="cardClick.emit(property)"
    >
      <!-- Image placeholder -->
      <div class="relative h-36 bg-sand/40 overflow-hidden">
        @if (property.imagenUrl) {
          <img [src]="property.imagenUrl" [alt]="property.direccion"
               class="w-full h-full object-cover" />
        } @else {
          <div class="w-full h-full flex items-center justify-center">
            <lucide-icon [img]="iconMapPin" class="text-stone/20" [size]="36"></lucide-icon>
          </div>
        }
        <!-- Tags overlay -->
        <div class="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">
          @for (tag of property.tags; track tag) {
            <app-status-badge type="tag" [tag]="tag"></app-status-badge>
          }
        </div>
        <!-- Status badge -->
        <div class="absolute top-2.5 right-2.5">
          <app-status-badge type="estado" [estado]="property.estado"></app-status-badge>
        </div>
      </div>

      <!-- Info -->
      <div class="p-4">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h3 class="text-sm font-semibold text-petrol truncate">{{ property.direccion }}</h3>
          <lucide-icon [img]="iconArrowRight" class="text-stone/30 mt-0.5 flex-shrink-0" [size]="14"></lucide-icon>
        </div>
        <div class="flex items-center gap-1 mb-2.5">
          <lucide-icon [img]="iconMapPin" class="text-stone/40" [size]="11"></lucide-icon>
          <span class="text-[11px] text-stone">{{ property.zona }}</span>
        </div>

        <!-- Price + metrics -->
        <div class="flex items-baseline gap-2">
          <span class="text-lg font-bold text-petrol">
            {{ property.precioPedido | number }}€
          </span>
          @if (property.metrosCuadrados) {
            <span class="text-[10px] text-stone">
              {{ property.metrosCuadrados }}m² · {{ precioPorMetro | number:'1.0-0' }}€/m²
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Output() cardClick = new EventEmitter<Property>();

  iconMapPin = MapPin;
  iconArrowRight = ArrowRight;

  get precioPorMetro(): number {
    if (!this.property.metrosCuadrados || this.property.metrosCuadrados === 0) return 0;
    return this.property.precioPedido / this.property.metrosCuadrados;
  }
}