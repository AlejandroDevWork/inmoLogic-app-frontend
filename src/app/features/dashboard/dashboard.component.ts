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
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-petrol">Dashboard</h1>
          <p class="text-sm text-stone mt-1">Resumen de tu cartera inmobiliaria</p>
        </div>
        <app-button
          label="Nueva Propiedad"
          icon="plus"
          routerLink="/analysis"
        />
      </div>

      <!-- Métricas de Cartera -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Oportunidades -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-petrol/10 rounded-lg">
              <svg class="w-5 h-5 text-petrol" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6L4 4z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-stone uppercase tracking-wide">Oportunidades</p>
              <p class="text-xl font-bold text-petrol">{{ totalProperties() }}</p>
            </div>
          </div>
        </app-card>

        <!-- ROI Medio -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-lg" [class]="getRoiColor()">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-stone uppercase tracking-wide">ROI Medio</p>
              <p class="text-xl font-bold" [class]="getRoiTextColor()">{{ averageYield() }}%</p>
            </div>
          </div>
        </app-card>

        <!-- Cashflow Total -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-lg" [class]="getCashflowCardColor()">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-stone uppercase tracking-wide">Cashflow Total</p>
              <p class="text-xl font-bold" [class]="getCashflowTextColor()">{{ formatCurrency(totalCashflow()) }}/mes</p>
            </div>
          </div>
        </app-card>

        <!-- Agencias en Contacto -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-cream rounded-lg">
              <svg class="w-5 h-5 text-petrol-light" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-stone uppercase tracking-wide">Agencias</p>
              <p class="text-xl font-bold text-petrol">{{ totalAgencies() }}</p>
            </div>
          </div>
        </app-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Alertas CRM: Agencias que necesitan contacto -->
        <app-card title="Alertas CRM" subtitle="Agencias que necesitan un toque" padding="none">
          @if (agenciasRequierenContacto().length === 0) {
            <div class="p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-sm text-stone">¡Todo al día! No hay agencias pendientes de contacto.</p>
            </div>
          } @else {
            <div class="divide-y divide-warm-border">
              @for (status of agenciasRequierenContacto(); track status.agency.id) {
                <div class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <!-- Semáforo de estado -->
                    <div
                      class="w-3 h-3 rounded-full"
                      [class]="getStatusColor(status.estado)"
                    ></div>
                    <div>
                      <p class="font-medium text-petrol">{{ status.agency.nombre }}</p>
                      <p class="text-xs text-stone">
                        {{ status.diasSinContacto === 999 ? 'Nunca contactado' : (status.diasSinContacto + ' días sin contacto') }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      class="p-2 text-stone/60 hover:text-petrol hover:bg-petrol-50 rounded-lg transition-colors"
                      title="Llamar"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </button>
                    <button
                      class="p-2 text-stone/60 hover:text-petrol hover:bg-petrol-50 rounded-lg transition-colors"
                      title="Enviar email"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </button>
                    <app-button
                      label="Contactar"
                      size="sm"
                      variant="primary"
                    />
                  </div>
                </div>
              }
            </div>
          }
        </app-card>

        <!-- Próximas Visitas -->
        <app-card title="Próximas Visitas" subtitle="Propiedades programadas para visitar" padding="none">
          @if (propiedadesEnVisita().length === 0) {
            <div class="p-6 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cream mb-3">
                <svg class="w-6 h-6 text-stone/60" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
              </div>
              <p class="text-sm text-stone">No hay visitas programadas.</p>
              <app-button
                label="Programar Visita"
                size="sm"
                variant="secondary"
                class="mt-3"
                routerLink="/analysis"
              />
            </div>
          } @else {
            <div class="divide-y divide-warm-border">
              @for (propiedad of propiedadesEnVisita(); track propiedad.id) {
                <div class="p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="font-medium text-petrol">{{ propiedad.direccion }}</p>
                      <p class="text-sm text-stone mt-0.5">{{ propiedad.zona }}</p>
                      @if (propiedad.agencyId) {
                        <p class="text-xs text-stone/60 mt-1">
                          Agencia: {{ getAgencyName(propiedad.agencyId) }}
                        </p>
                      }
                    </div>
                    <div class="text-right">
                      @if (propiedad.fechaVisita) {
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-petrol-50 rounded-lg">
                          <svg class="w-3.5 h-3.5 text-petrol" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                          </svg>
                          <span class="text-xs font-medium text-petrol">
                            {{ formatDate(propiedad.fechaVisita) }}
                          </span>
                        </div>
                      }
                      <p class="text-sm font-semibold text-petrol mt-2">
                        {{ formatCurrency(propiedad.precioPedido) }}
                      </p>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </app-card>
      </div>

      <!-- Estado del Pipeline -->
      <app-card title="Pipeline de Inversión" padding="md">
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
          @for (estado of pipelineEstados; track estado.key) {
            <div class="text-center">
              <div
                class="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2"
                [class]="getEstadoColor(estado.key)"
              >
                <span class="text-sm font-bold">{{ getCountByEstado(estado.key) }}</span>
              </div>
              <p class="text-xs font-medium text-stone">{{ estado.nombre }}</p>
            </div>
          }
        </div>
      </app-card>
    </div>
  `
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
