import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppCardComponent } from '../../shared/components/app-card/app-card.component';
import { AppButtonComponent } from '../../shared/components/app-button/app-button.component';
import { PropertyService } from '../../core/services/property.service';
import { Property, AgencyCrmStatus } from '../../core/models/inmo.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AppCardComponent,
    AppButtonComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private propertyService = inject(PropertyService);

  // Signals del servicio
  readonly properties = this.propertyService.properties;
  readonly agencies = this.propertyService.agencies;
  readonly agenciasRequierenContacto = this.propertyService.agenciasRequierenContacto;
  readonly propiedadesEnVisita = this.propertyService.propiedadesEnVisita;

  pipelineEstados = [
    { key: 'busqueda', nombre: 'Búsqueda' },
    { key: 'visita', nombre: 'Visita' },
    { key: 'oferta', nombre: 'Oferta' },
    { key: 'arras', nombre: 'Arras' },
    { key: 'alquilado', nombre: 'Alquilado' }
  ];

  // === COMPUTED METRICS ===
  readonly totalProperties = computed(() => this.properties().length);

  readonly totalAgencies = computed(() => this.agencies().length);

  readonly averageYield = computed(() => {
    const properties = this.properties();
    if (properties.length === 0) return '0.00';

    // Calcular yield medio basado en financials
    const yields = properties.map(p => {
      const f = p.financials;
      const totalInvestment = f.precioCompra + (f.precioCompra * (f.itp / 100)) + f.notariaGestoria + f.reforma;
      const gastosAnuales = (f.comunidad + f.ibi + f.seguro) * 12;
      const ingresoAnual = f.alquilerEstimado * 12;
      if (totalInvestment === 0) return 0;
      return ((ingresoAnual - gastosAnuales) / totalInvestment) * 100;
    });

    const sum = yields.reduce((acc, y) => acc + y, 0);
    return (sum / yields.length).toFixed(2);
  });

  readonly totalCashflow = computed(() => {
    return this.properties().reduce((total, p) => {
      const f = p.financials;
      const gastosMensuales = f.comunidad + f.ibi + f.seguro;
      const alquiler = f.alquilerEstimado;
      return total + (alquiler - gastosMensuales);
    }, 0);
  });

  getCountByEstado(estado: string): number {
    return this.properties().filter(p => p.estado === estado).length;
  }

  getAgencyName(agencyId: string): string {
    const agency = this.propertyService.getAgencyById(agencyId);
    return agency?.nombre || 'Sin asignar';
  }

  getStatusColor(estado: 'verde' | 'amarillo' | 'rojo'): string {
    const colors = {
      verde: 'bg-green-500',
      amarillo: 'bg-amber-500',
      rojo: 'bg-red-500'
    };
    return colors[estado];
  }

  getEstadoColor(estado: string): string {
    const colors: Record<string, string> = {
      busqueda: 'bg-cream text-petrol-light',
      visita: 'bg-earth-light/40 text-earth-dark',
      oferta: 'bg-amber-100 text-amber-700',
      arras: 'bg-purple-100 text-purple-700',
      alquilado: 'bg-green-100 text-green-700'
    };
    return colors[estado];
  }

  getRoiColor(): string {
    const roi = parseFloat(this.averageYield()) || 0;
    if (roi >= 8) return 'bg-green-100';
    if (roi >= 5) return 'bg-amber-100';
    return 'bg-red-100';
  }

  getRoiTextColor(): string {
    return 'text-petrol';
  }

  getCashflowCardColor(): string {
    const cashflow = this.totalCashflow();
    if (cashflow > 0) return 'bg-green-100';
    if (cashflow > -200) return 'bg-amber-100';
    return 'bg-red-100';
  }

  getCashflowTextColor(): string {
    const cashflow = this.totalCashflow();
    if (cashflow > 0) return 'text-green-700';
    if (cashflow > -200) return 'text-amber-700';
    return 'text-red-700';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
