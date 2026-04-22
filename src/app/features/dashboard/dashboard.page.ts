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
  templateUrl: './dashboard.page.html',
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