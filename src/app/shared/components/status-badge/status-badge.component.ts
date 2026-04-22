import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyEstado, PropertyTag } from '../../../core/models/inmo.interface';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  host: { style: 'display: inline-block' }
})
export class StatusBadgeComponent {
  @Input() type: 'estado' | 'tag' | 'crm' = 'estado';
  @Input() estado: PropertyEstado = 'analisis';
  @Input() tag: PropertyTag = 'hot-deal';
  @Input() crmStatus: 'verde' | 'amarillo' | 'rojo' = 'verde';

  baseClasses = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-xs font-medium whitespace-nowrap';

  get estadoClasses(): string {
    const map: Record<PropertyEstado, string> = {
      'analisis': 'bg-petrol-50 text-petrol',
      'visita': 'bg-earth-light/40 text-earth-dark',
      'oferta': 'bg-petrol-50 text-petrol-light',
      'arras': 'bg-amber-100 text-amber-800',
      'alquilado': 'bg-emerald-100 text-emerald-800'
    };
    return map[this.estado];
  }

  get estadoLabel(): string {
    const map: Record<PropertyEstado, string> = {
      'analisis': 'Análisis',
      'visita': 'Visita',
      'oferta': 'Oferta',
      'arras': 'Arras',
      'alquilado': 'Alquilado'
    };
    return map[this.estado];
  }

  get tagClasses(): string {
    const map: Record<PropertyTag, string> = {
      'hot-deal': 'bg-red-100 text-red-700',
      'a-reformar': 'bg-amber-100 text-amber-700',
      'llave-en-mano': 'bg-emerald-100 text-emerald-700',
      'oportunidad': 'bg-purple-100 text-purple-700'
    };
    return map[this.tag];
  }

  get tagLabel(): string {
    const map: Record<PropertyTag, string> = {
      'hot-deal': 'Hot Deal',
      'a-reformar': 'A reformar',
      'llave-en-mano': 'Llave en mano',
      'oportunidad': 'Oportunidad'
    };
    return map[this.tag];
  }

  get crmClasses(): string {
    const map = {
      'verde': 'bg-emerald-50 text-emerald-700',
      'amarillo': 'bg-amber-50 text-amber-700',
      'rojo': 'bg-red-50 text-red-700'
    };
    return map[this.crmStatus];
  }

  get crmDotClass(): string {
    const map = {
      'verde': 'bg-emerald-500',
      'amarillo': 'bg-amber-500',
      'rojo': 'bg-red-500'
    };
    return map[this.crmStatus];
  }

  get crmLabel(): string {
    const map = {
      'verde': 'Al día',
      'amarillo': 'Contactar',
      'rojo': 'Urgente'
    };
    return map[this.crmStatus];
  }
}