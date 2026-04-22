import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCalculationEngine } from './calculation.model';
import { LucideAngularModule, Calculator, TrendingUp } from 'lucide-angular';

// Reusable inline components — declared BEFORE CalcPage so they're available for import

@Component({
  selector: 'field-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-edit.component.html',
})
export class FieldEditComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() suffix = '';
  @Output() valueChange = new EventEmitter<number>();

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(parseFloat(input.value) || 0);
  }
}

@Component({
  selector: 'field-read',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-read.component.html',
})
export class FieldReadComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() highlight = false;
  @Input() highlightClass = '';
  @Input() small = false;
}

@Component({
  selector: 'app-calc',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FieldEditComponent, FieldReadComponent],
  templateUrl: './calc.page.html',
})
export class CalcPage {
  e = createCalculationEngine();
  activeTab = signal<string>('inversion');

  iconCalculator = Calculator;
  iconTrendingUp = TrendingUp;

  tabs = [
    { key: 'inversion', label: 'Inversión' },
    { key: 'cra', label: 'CRA' },
    { key: 'crv', label: 'CRV' },
    { key: 'corto-plazo', label: 'Corto Plazo' },
    { key: 'reforma', label: 'Reforma' },
    { key: 'comparativa', label: 'Comparativa' },
  ];

  reformItems: { key: string; label: string }[] = [
    { key: 'cocina', label: 'Cocina' },
    { key: 'banio', label: 'Baño' },
    { key: 'grifos', label: 'Grifos' },
    { key: 'pintar', label: 'Pintar' },
    { key: 'alisarParedes', label: 'Alisar paredes' },
    { key: 'tarimaSuelo', label: 'Tarima suelo' },
    { key: 'luces', label: 'Luces' },
    { key: 'ventanas', label: 'Ventanas' },
    { key: 'revisionVentanas', label: 'Revisión ventanas' },
    { key: 'puertas', label: 'Puertas' },
    { key: 'persianas', label: 'Persianas' },
    { key: 'electricidad', label: 'Electricidad' },
    { key: 'altaSuministros', label: 'Alta suministros' },
    { key: 'mueblesSalon', label: 'Muebles salón' },
    { key: 'mueblesHabitacion', label: 'Muebles habitación' },
    { key: 'electrodomesticos', label: 'Electrodomésticos' },
    { key: 'imprevistos', label: 'Imprevistos' },
    { key: 'otros', label: 'Otros' },
  ];

  bonificacionItems: { key: string; label: string }[] = [
    { key: 'seguroVida', label: 'Seguro Vida' },
    { key: 'seguroHogar', label: 'Seguro Hogar' },
    { key: 'nomina', label: 'Nómina' },
    { key: 'tarjeta', label: 'Tarjeta' },
  ];

  updateCosts(field: string, value: number): void {
    this.e.costs.update(prev => ({ ...prev, [field]: value }));
  }

  updateFinancing1(field: string, value: number): void {
    this.e.financing1.update(prev => ({ ...prev, [field]: value }));
  }

  updateCra(field: string, value: number): void {
    this.e.craEstimates.update(prev => ({ ...prev, [field]: value }));
  }

  updateCraPct(field: string, value: number): void {
    this.e.craEstimates.update(prev => ({ ...prev, [field]: value / 100 }));
  }

  updateCrv(field: string, value: number): void {
    this.e.crvEstimates.update(prev => ({ ...prev, [field]: value }));
  }

  updateShortRental(field: string, value: number): void {
    this.e.shortRental.update(prev => ({ ...prev, [field]: value }));
  }

  updateShortRentalPct(field: string, value: number): void {
    this.e.shortRental.update(prev => ({ ...prev, [field]: value / 100 }));
  }

  updateSpacesRental(field: string, value: number): void {
    this.e.spacesRental.update(prev => ({ ...prev, [field]: value }));
  }

  updateMortgageBonus(field: string, value: number): void {
    this.e.mortgageBonus.update(prev => ({ ...prev, [field]: value }));
  }

  updateMortgageBonusPct(field: string, value: number): void {
    this.e.mortgageBonus.update(prev => ({ ...prev, [field]: value / 100 }));
  }

  updateReforma(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.e.reforma.update(prev => ({ ...prev, [field]: value }));
  }

  getReformaValue(key: string): number {
    const reforma = this.e.reforma() as unknown as Record<string, number>;
    return reforma[key] ?? 0;
  }

  fmtCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }

  fmtPct(value: number): string {
    return (value * 100).toFixed(2) + '%';
  }

  yieldClass(pct: number): string {
    if (pct >= 0.08) return 'text-emerald-700';
    if (pct >= 0.05) return 'text-amber-600';
    return 'text-red-600';
  }

  getBonItem(key: string): { ahorroPct: number; ahorroEuros: number; costeOtro: number } {
    const bon = this.e.bonificaciones() as Record<string, { ahorroPct: number; ahorroEuros: number; costeOtro: number }>;
    return bon[key] || { ahorroPct: 0, ahorroEuros: 0, costeOtro: 0 };
  }
}