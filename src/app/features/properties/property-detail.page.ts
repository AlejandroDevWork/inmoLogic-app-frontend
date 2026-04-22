import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { createCalculationEngine } from '../calc/calculation.model';
import type { AdPortal } from '../../core/models/inmo.interface';
import { FieldEditComponent, FieldReadComponent } from '../calc/calc.page';
import { LucideAngularModule, ArrowLeft, Calculator, Wrench, Landmark, FileText } from 'lucide-angular';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FieldEditComponent, FieldReadComponent],
  templateUrl: './property-detail.page.html',
})
export class PropertyDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  e = createCalculationEngine();

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    const p = id ? this.propertyService.getPropertyById(id) : undefined;
    if (p) {
      const surface = p.propertyData?.superficie || p.metrosCuadrados || 0;
      this.e.costs.update(prev => ({ ...prev, superficie: surface, precioInmueble: p.precioPedido }));
    }
  }
  activeTab = signal<string>('info');
  calcSection = signal<string>('inversion');
  financingTab = signal<string>('hipoteca');
  reformaTier = signal<'low' | 'media' | 'lujo' | null>(null);
  openDropdown = signal<string | null>(null);

  orientacionOptions = [
    { value: '', label: '—' },
    { value: 'Norte', label: 'Norte' },
    { value: 'Noreste', label: 'Noreste' },
    { value: 'Este', label: 'Este' },
    { value: 'Sureste', label: 'Sureste' },
    { value: 'Sur', label: 'Sur' },
    { value: 'Suroeste', label: 'Suroeste' },
    { value: 'Oeste', label: 'Oeste' },
    { value: 'Noroeste', label: 'Noroeste' },
  ];

  portalOptions = [
    { value: '', label: 'Sin portal' },
    { value: 'idealista', label: 'Idealista' },
    { value: 'fotocasa', label: 'Fotocasa' },
    { value: 'pisos', label: 'Pisos.com' },
    { value: 'habitaclia', label: 'Habitaclia' },
    { value: 'otros', label: 'Otros' },
  ];

  iconArrowLeft = ArrowLeft;
  iconCalculator = Calculator;
  iconWrench = Wrench;
  iconLandmark = Landmark;
  iconFileText = FileText;

  property = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return undefined;
    return this.propertyService.getPropertyById(id);
  });

  reformaTierLabel = computed(() => {
    const tier = this.reformaTier();
    if (!tier) return '—';
    const labels: Record<string, string> = { low: 'Low', media: 'Media', lujo: 'Lujo' };
    const cost = tier === 'low' ? this.e.reformaLow() : tier === 'media' ? this.e.reformaMedia() : this.e.reformaLujo();
    return (labels[tier] || '') + ' ' + this.fmtCurrency(cost);
  });

  calcTabs = [
    { key: 'inversion', label: 'Inversión' },
    { key: 'cra', label: 'CRA' },
    { key: 'crv', label: 'CRV' },
    { key: 'corto-plazo', label: 'Alquiler Corta Duración' },
    { key: 'espacios', label: 'Alquiler por Espacios' },
    { key: 'comparativa', label: 'Comparativa' },
  ];

  statusLabel = computed(() => {
    const estado = this.property()?.estado;
    const labels: Record<string, string> = {
      analisis: 'Análisis', visita: 'Visita', oferta: 'Oferta', arras: 'Arras', alquilado: 'Alquilado'
    };
    return labels[estado || ''] || estado || '';
  });

  statusColor = computed(() => {
    const estado = this.property()?.estado;
    const colors: Record<string, string> = {
      analisis: 'text-amber-600', visita: 'text-earth', oferta: 'text-purple-600', arras: 'text-orange-600', alquilado: 'text-emerald-600'
    };
    return colors[estado || ''] || 'text-stone';
  });

  statusBadgeClass = computed(() => {
    const estado = this.property()?.estado;
    const base = 'px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide';
    const colors: Record<string, string> = {
      analisis: `${base} bg-amber-100 text-amber-700`,
      visita: `${base} bg-petrol-50 text-earth-dark`,
      oferta: `${base} bg-purple-100 text-purple-700`,
      arras: `${base} bg-orange-100 text-orange-700`,
      alquilado: `${base} bg-emerald-100 text-emerald-700`,
    };
    return colors[estado || ''] || `${base} bg-cream text-stone`;
  });

  targetYieldPct = computed(() => this.e.targetYield() * 100);

  portalLabel = computed(() => {
    const p = this.property()?.adData?.portal;
    const labels: Record<string, string> = {
      idealista: 'Idealista', fotocasa: 'Fotocasa', pisos: 'Pisos.com', habitaclia: 'Habitaclia', otros: 'Otros'
    };
    return labels[p || ''] || '—';
  });

  gastosTable = computed(() => {
    const c = this.e.costs();
    const tg = this.e.totalGastosCompra();
    const inv = this.e.inversionTotal();
    const ga = this.e.gastosAnuales();
    return [
      { label: 'Precio de Compra', amount: this.e.precioCompra(), totalBase: inv, isTotal: false },
      { label: 'Notaría/Registro', amount: c.notarioRegistro, totalBase: tg, isTotal: false },
      { label: 'IVA/ITP', amount: this.e.itp(), totalBase: tg, isTotal: false },
      { label: 'Comisión Compra', amount: c.comisionCompra, totalBase: tg, isTotal: false },
      { label: 'Gastos Financiación', amount: c.gastosFinanciacion, totalBase: tg, isTotal: false },
      { label: 'Equipo Captación', amount: c.equipoInternoCaptacion, totalBase: tg, isTotal: false },
      { label: 'Otros Gastos', amount: c.otrosGastosCompra, totalBase: tg, isTotal: false },
      { label: 'Total Gastos Compra', amount: tg, totalBase: tg, isTotal: true },
      { label: 'Mobiliario', amount: c.mobiliario, totalBase: inv, isTotal: false },
      { label: 'Coste Reforma', amount: c.costeReforma, totalBase: inv, isTotal: false },
      { label: 'Total Posesión + Obras', amount: c.mobiliario + c.costeReforma, totalBase: inv, isTotal: true },
      { label: 'IBI + Tasas', amount: c.ibi, totalBase: ga, isTotal: false },
      { label: 'Seguro', amount: c.seguro, totalBase: ga, isTotal: false },
      { label: 'Seguro Impago', amount: c.seguroImpago, totalBase: ga, isTotal: false },
      { label: 'Comunidad', amount: c.comunidad, totalBase: ga, isTotal: false },
      { label: 'Total Anual', amount: ga, totalBase: ga, isTotal: true },
    ];
  });

  goBack(): void {
    this.router.navigate(['/properties']);
  }

  toggleDropdown(name: string): void {
    this.openDropdown.update(v => v === name ? null : name);
  }

  selectOrientacion(value: string): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, orientacion: value } });
    this.openDropdown.set(null);
  }

  selectPortal(value: string): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const ad = this.property()?.adData || {};
    this.propertyService.updateProperty(id, { adData: { ...ad, portal: (value || undefined) as AdPortal | undefined } });
    this.openDropdown.set(null);
  }

  orientacionLabel(): string {
    const val = this.property()?.propertyData?.orientacion;
    if (!val) return '—';
    return val;
  }

  portalDropdownLabel(): string {
    const val = this.property()?.adData?.portal;
    if (!val) return 'Sin portal';
    const labels: Record<string, string> = {
      idealista: 'Idealista', fotocasa: 'Fotocasa', pisos: 'Pisos.com', habitaclia: 'Habitaclia', otros: 'Otros'
    };
    return labels[val] || val;
  }

  updatePropertyStr(field: string, value: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.propertyService.updateProperty(id, { [field]: String(value) });
  }

  updatePropertyText(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.propertyService.updateProperty(id, { [field]: input.value });
  }

  updatePrecioPedido(value: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.propertyService.updateProperty(id, { precioPedido: value });
    this.e.costs.update(prev => ({ ...prev, precioInmueble: value }));
  }

  updatePropertyDataField(field: string, value: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, [field]: value } });
    if (field === 'superficie') {
      this.e.costs.update(prev => ({ ...prev, superficie: value }));
    }
  }

  updatePropertyDataNum(field: string, value: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, [field]: String(value) } });
  }

  updateSurface(value: number): void {
    this.updatePropertyDataField('superficie', value);
  }

  updatePropertyDataStr(field: string, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, [field]: input.value } });
  }

  updatePropertyDataStrValue(field: string, value: string): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, [field]: value } });
  }

  updatePropertyDataBool(field: string, value: boolean): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const pd = this.property()?.propertyData || {};
    this.propertyService.updateProperty(id, { propertyData: { ...pd, [field]: value } });
  }

  updateAdDataField(field: string, value: number): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const ad = this.property()?.adData || {};
    this.propertyService.updateProperty(id, { adData: { ...ad, [field]: value } });
  }

  updateAdDataStrField(field: string, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const ad = this.property()?.adData || {};
    this.propertyService.updateProperty(id, { adData: { ...ad, [field]: input.value } });
  }

  updateAdDataStrValue(field: string, value: string): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const ad = this.property()?.adData || {};
    this.propertyService.updateProperty(id, { adData: { ...ad, [field]: value } });
  }

  updateAdDataBool(field: string, value: boolean): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const ad = this.property()?.adData || {};
    this.propertyService.updateProperty(id, { adData: { ...ad, [field]: value } });
  }

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

  updateFinancing2(field: string, value: number): void {
    this.e.financing2.update(prev => ({ ...prev, [field]: value }));
  }

  updateFinancing3(field: string, value: number): void {
    this.e.financing3.update(prev => ({ ...prev, [field]: value }));
  }

  updateReformaTier(key: 'lowM2' | 'mediaM2' | 'lujoM2', event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value) || 0;
    this.e.reformaTiers.update(prev => ({ ...prev, [key]: val }));
  }

  applyReformaTier(tier: 'low' | 'media' | 'lujo'): void {
    const cost = tier === 'low' ? this.e.reformaLow() : tier === 'media' ? this.e.reformaMedia() : this.e.reformaLujo();
    this.e.costs.update(prev => ({ ...prev, costeReforma: cost }));
    this.reformaTier.set(tier);
  }

  updateTargetYield(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = parseFloat(input.value) || 8;
    this.e.targetYield.set(val / 100);
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

  updateReforma(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.e.reforma.update(prev => ({ ...prev, [field]: value }));
  }

  getReformaValue(key: string): number {
    const reforma = this.e.reforma() as unknown as Record<string, number>;
    return reforma[key] ?? 0;
  }

  updateMortgageBonus(field: string, value: number): void {
    this.e.mortgageBonus.update(prev => ({ ...prev, [field]: value }));
  }

  updateMortgageBonusPct(field: string, value: number): void {
    this.e.mortgageBonus.update(prev => ({ ...prev, [field]: value / 100 }));
  }

  getBonItem(key: string): { ahorroPct: number; ahorroEuros: number; costeOtro: number } {
    const bon = this.e.bonificaciones() as Record<string, { ahorroPct: number; ahorroEuros: number; costeOtro: number }>;
    return bon[key] || { ahorroPct: 0, ahorroEuros: 0, costeOtro: 0 };
  }

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

  priceClass(maxPrice: number): string {
    const asking = this.property()?.precioPedido || 0;
    if (!maxPrice || maxPrice <= 0) return 'text-red-600';
    if (asking <= 0) return 'text-petrol';
    const ratio = maxPrice / asking;
    if (ratio >= 1.0) return 'text-emerald-700';
    if (ratio >= 0.9) return 'text-amber-600';
    return 'text-red-600';
  }

  fmtPrice(value: number): string {
    if (!value || value <= 0) return 'N/V';
    return this.fmtCurrency(value);
  }

  fmtPerM2(amount: number): string {
    const surface = this.e.costs().superficie;
    if (!surface) return '—';
    return this.fmtCurrency(amount / surface) + '/m²';
  }

  fmtPctOf(part: number, total: number): string {
    if (!total) return '—';
    return (part / total * 100).toFixed(1) + '%';
  }
}