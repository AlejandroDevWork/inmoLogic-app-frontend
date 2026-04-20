import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LucideAngularModule, Home, TrendingUp, Wallet, Building2, Phone, Bell, Clock, Calendar, Users } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PropertyCardComponent,
    StatusBadgeComponent,
    LucideAngularModule
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-7 bg-cream min-h-full overflow-y-auto">

          <!-- Header: Avatar + Saludo -->
          <div class="flex items-center gap-3.5">
            <div>
              <h1 class="text-xl font-bold text-petrol">Dashboard</h1>
            </div>
          </div>

          <!-- Quick Stats — Glassmorphism cards -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-4 text-center">
              <div class="flex justify-center mb-2">
                <div class="w-9 h-9 rounded-[12px] bg-sand/60 flex items-center justify-center">
                  <lucide-icon [img]="iconHome" class="text-petrol" [size]="18"></lucide-icon>
                </div>
              </div>
              <p class="text-xl font-bold text-petrol">{{ totalProperties() }}</p>
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide mt-0.5">Operaciones</p>
            </div>

            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-4 text-center">
              <div class="flex justify-center mb-2">
                <div class="w-9 h-9 rounded-[12px] bg-earth-light/20 flex items-center justify-center">
                  <lucide-icon [img]="iconTrendingUp" class="text-earth-dark" [size]="18"></lucide-icon>
                </div>
              </div>
              <p class="text-xl font-bold text-petrol">{{ averageYield() }}%</p>
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide mt-0.5">ROI Medio</p>
            </div>

            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-4 text-center">
              <div class="flex justify-center mb-2">
                <div class="w-9 h-9 rounded-[12px] bg-emerald-100/60 flex items-center justify-center">
                  <lucide-icon [img]="iconWallet" class="text-emerald-700" [size]="18"></lucide-icon>
                </div>
              </div>
              <p class="text-lg font-bold" [class]="cashflowColor()">{{ formatCurrency(totalCashflow()) }}</p>
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide mt-0.5">Cashflow/mes</p>
            </div>
          </div>

          <!-- Visitas para hoy — Horizontal -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <lucide-icon [img]="iconCalendar" class="text-earth" [size]="16"></lucide-icon>
                <h2 class="text-sm font-semibold text-petrol">Visitas para hoy</h2>
              </div>
              <span class="text-[10px] text-stone">{{ propiedadesEnVisita().length }} programadas</span>
            </div>

            @if (propiedadesEnVisita().length === 0) {
              <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-5 text-center">
                <p class="text-xs text-stone">Sin visitas programadas hoy</p>
              </div>
            } @else {
              <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1 lg:flex-wrap lg:overflow-visible">
                @for (prop of propiedadesEnVisita(); track prop.id) {
                  <div class="bg-white rounded-[24px] border border-warm-border shadow-sm
                              min-w-[260px] max-w-[280px] lg:min-w-[300px] lg:max-w-none lg:flex-[1_1_300px] flex-shrink-0 overflow-hidden">
                    <div class="h-28 bg-sand/50 relative">
                      @if (prop.imagenUrl) {
                        <img [src]="prop.imagenUrl" class="w-full h-full object-cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center">
                          <lucide-icon [img]="iconHome" class="text-stone/30" [size]="32"></lucide-icon>
                        </div>
                      }
                      <div class="absolute bottom-2 right-2">
                        <app-status-badge type="estado" [estado]="prop.estado"></app-status-badge>
                      </div>
                    </div>
                    <div class="p-3.5">
                      <p class="text-sm font-semibold text-petrol truncate">{{ prop.direccion }}</p>
                      <p class="text-[11px] text-stone">{{ prop.zona }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <span class="text-sm font-bold text-petrol">{{ formatCurrency(prop.precioPedido) }}</span>
                        @if (prop.fechaVisita) {
                          <span class="text-[10px] font-medium text-earth-dark bg-earth-light/20 px-2 py-0.5 rounded-md">
                            {{ formatDate(prop.fechaVisita) }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Pipeline de Operaciones -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-petrol">Pipeline</h2>
              <span class="text-[10px] text-stone">{{ totalProperties() }} total</span>
            </div>

            @for (grupo of pipelineGroups; track grupo.estado) {
              @if (getCountByEstado(grupo.estado) > 0) {
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <app-status-badge type="estado" [estado]="grupo.estado"></app-status-badge>
                    <span class="text-[10px] text-stone">{{ getCountByEstado(grupo.estado) }}</span>
                  </div>
                  <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-1 px-1 lg:flex-wrap lg:overflow-visible">
                    @for (prop of getPropertiesByEstado(grupo.estado); track prop.id) {
                      <app-property-card [property]="prop"
                                         (cardClick)="onPropertyClick($event)">
                      </app-property-card>
                    }
                  </div>
                </div>
              }
            }

            @if (totalProperties() === 0) {
              <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-8 text-center">
                <div class="w-14 h-14 rounded-[18px] bg-sand/60 mx-auto mb-3 flex items-center justify-center">
                  <lucide-icon [img]="iconHome" class="text-stone/40" [size]="28"></lucide-icon>
                </div>
                <p class="text-sm text-petrol font-medium">Sin operaciones aún</p>
                <p class="text-xs text-stone mt-1">Añade tu primera propiedad</p>
              </div>
            }
          </div>

          <!-- Recordatorios -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <lucide-icon [img]="iconBell" class="text-earth" [size]="16"></lucide-icon>
              <h2 class="text-sm font-semibold text-petrol">Recordatorios</h2>
            </div>

            @if (agenciasRequierenContacto().length === 0 && contactosRequierenContacto().length === 0) {
              <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 text-center">
                <p class="text-xs text-stone">Todo tranquilo</p>
              </div>
            } @else {
              <!-- Agencias -->
              @if (agenciasRequierenContacto().length > 0) {
                <div class="mb-3">
                  <p class="text-[10px] font-medium text-stone uppercase tracking-wide mb-2">Agencias</p>
                  <div class="bg-white rounded-[20px] border border-warm-border shadow-sm overflow-hidden">
                    @for (status of agenciasRequierenContacto(); track status.agency.id) {
                      <div class="flex items-center gap-3 p-3 border-b border-cream last:border-b-0">
                        <div class="w-8 h-8 rounded-[10px] flex items-center justify-center"
                             [class]="status.estado === 'rojo' ? 'bg-red-50' : 'bg-amber-50'">
                          <lucide-icon [img]="iconBuilding2"
                            [class]="status.estado === 'rojo' ? 'text-red-500' : 'text-amber-500'"
                            [size]="14"></lucide-icon>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-petrol truncate">{{ status.agency.nombre }}</p>
                          <p class="text-[10px] text-stone">
                            {{ status.diasSinContacto === 999 ? 'Nunca contactado' : status.diasSinContacto + ' días' }}
                          </p>
                        </div>
                        <app-status-badge type="crm" [crmStatus]="status.estado"></app-status-badge>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Contactos -->
              @if (contactosRequierenContacto().length > 0) {
                <div>
                  <p class="text-[10px] font-medium text-stone uppercase tracking-wide mb-2">Contactos</p>
                  <div class="bg-white rounded-[20px] border border-warm-border shadow-sm overflow-hidden">
                    @for (status of contactosRequierenContacto(); track status.contact.id) {
                      <div class="flex items-center gap-3 p-3 border-b border-cream last:border-b-0">
                        <div class="w-8 h-8 rounded-[10px] flex items-center justify-center"
                             [class]="status.estado === 'rojo' ? 'bg-red-50' : 'bg-amber-50'">
                          <lucide-icon [img]="iconUsers"
                            [class]="status.estado === 'rojo' ? 'text-red-500' : 'text-amber-500'"
                            [size]="14"></lucide-icon>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-petrol truncate">{{ status.contact.nombre }}</p>
                          <p class="text-[10px] text-stone">
                            {{ status.diasSinContacto === 999 ? 'Nunca contactado' : status.diasSinContacto + ' días' }}
                          </p>
                        </div>
                        <app-status-badge type="crm" [crmStatus]="status.estado"></app-status-badge>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>

    </div>
  `
})
export class DashboardPage {
  private propertyService = inject(PropertyService);

  readonly properties = this.propertyService.properties;
  readonly agencies = this.propertyService.agencies;
  readonly agenciasRequierenContacto = this.propertyService.agenciasRequierenContacto;
  readonly contactosRequierenContacto = this.propertyService.contactosRequierenContacto;
  readonly propiedadesEnVisita = this.propertyService.propiedadesEnVisita;

  iconHome = Home;
  iconTrendingUp = TrendingUp;
  iconWallet = Wallet;
  iconBuilding2 = Building2;
  iconPhone = Phone;
  iconBell = Bell;
  iconClock = Clock;
  iconCalendar = Calendar;
  iconUsers = Users;

  pipelineGroups = [
    { estado: 'analisis' as const },
    { estado: 'visita' as const },
    { estado: 'oferta' as const },
    { estado: 'arras' as const },
    { estado: 'alquilado' as const }
  ];

  readonly totalProperties = computed(() => this.properties().length);
  readonly totalAgencies = computed(() => this.agencies().length);

  readonly averageYield = computed(() => {
    const properties = this.properties();
    if (properties.length === 0) return '0.0';
    const yields = properties.map(p => {
      const f = p.financials;
      const totalInvestment = f.precioCompra + (f.precioCompra * (f.itp / 100)) + f.notariaGestoria + f.reforma;
      const gastosAnuales = (f.comunidad + f.ibi + f.seguro) * 12;
      const ingresoAnual = f.alquilerEstimado * 12;
      if (totalInvestment === 0) return 0;
      return ((ingresoAnual - gastosAnuales) / totalInvestment) * 100;
    });
    const sum = yields.reduce((acc, y) => acc + y, 0);
    return (sum / yields.length).toFixed(1);
  });

  readonly totalCashflow = computed(() => {
    return this.properties().reduce((total, p) => {
      const f = p.financials;
      return total + (f.alquilerEstimado - f.comunidad - f.ibi - f.seguro);
    }, 0);
  });

  cashflowColor = computed(() => {
    const cf = this.totalCashflow();
    if (cf > 0) return 'text-emerald-700';
    if (cf > -200) return 'text-amber-700';
    return 'text-red-700';
  });

  getCountByEstado(estado: string): number {
    return this.properties().filter(p => p.estado === estado).length;
  }

  getPropertiesByEstado(estado: string) {
    return this.properties().filter(p => p.estado === estado);
  }

  onPropertyClick(property: any): void {}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);
  }
}