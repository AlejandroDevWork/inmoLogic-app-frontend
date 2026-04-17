import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCalculationEngine } from './calculation.model';
import { LucideAngularModule, Calculator, TrendingUp } from 'lucide-angular';

// Reusable inline components — declared BEFORE CalcPage so they're available for import

@Component({
  selector: 'field-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">{{ label }}</label>
      <div class="relative">
        <input type="number" [value]="value"
               (input)="onInput($event)"
               class="w-full bg-cream/50 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none focus:ring-1 focus:ring-earth/30 pr-12" />
        @if (suffix) {
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone font-medium">{{ suffix }}</span>
        }
      </div>
    </div>
  `,
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
  template: `
    <div>
      <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">{{ label }}</label>
      <div class="rounded-[12px] px-3 py-2 text-sm font-semibold"
           [class]="highlight ? 'bg-petrol/10 text-petrol' : 'bg-sand/40 text-petrol'">
        <span [class]="highlightClass || ''">{{ value }}</span>
      </div>
    </div>
  `,
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
  template: `
    <div class="px-5 pt-6 pb-32 space-y-5 bg-cream min-h-full max-w-2xl mx-auto overflow-y-auto">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-[14px] bg-petrol/10 flex items-center justify-center">
          <lucide-icon [img]="iconCalculator" class="text-petrol" [size]="20"></lucide-icon>
        </div>
        <div>
          <h1 class="text-lg font-bold text-petrol">Cálculo de Inversión</h1>
          <p class="text-[11px] text-stone">Simulador financiero inmobiliario</p>
        </div>
      </div>

      <!-- Tab Pills -->
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab.set(tab.key)"
                  class="px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                  [class]="activeTab() === tab.key ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- INVERSIÓN TAB -->
      @if (activeTab() === 'inversion') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Inversión Total</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.inversionTotal()) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Capital Propio</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.capitalPropio()) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Cuota/mes</p>
            <p class="text-base font-bold" [class]="e.cuotaMensual() > 0 ? 'text-petrol' : 'text-stone'">{{ fmtCurrency(e.cuotaMensual()) }}</p>
          </div>
        </div>

        <!-- Datos de Compra -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Datos de Compra</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Precio Inmueble" [value]="e.costs().precioInmueble" suffix="€" (valueChange)="updateCosts('precioInmueble', $event)"></field-edit>
            <field-edit label="Descuento" [value]="e.costs().descuento" suffix="%" (valueChange)="updateCosts('descuento', $event)"></field-edit>
            <field-edit label="Superficie" [value]="e.costs().superficie" suffix="m²" (valueChange)="updateCosts('superficie', $event)"></field-edit>
            <field-read label="Precio Compra" [value]="fmtCurrency(e.precioCompra())"></field-read>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Notaría/Registro" [value]="e.costs().notarioRegistro" suffix="€" (valueChange)="updateCosts('notarioRegistro', $event)"></field-edit>
            <field-edit label="ITP" [value]="e.costs().itpPorcentaje" suffix="%" (valueChange)="updateCosts('itpPorcentaje', $event)"></field-edit>
            <field-edit label="Comisión Compra" [value]="e.costs().comisionCompra" suffix="€" (valueChange)="updateCosts('comisionCompra', $event)"></field-edit>
            <field-edit label="Gastos Financiación" [value]="e.costs().gastosFinanciacion" suffix="€" (valueChange)="updateCosts('gastosFinanciacion', $event)"></field-edit>
            <field-edit label="Equipo Captación" [value]="e.costs().equipoInternoCaptacion" suffix="€" (valueChange)="updateCosts('equipoInternoCaptacion', $event)"></field-edit>
            <field-edit label="Otros Gastos" [value]="e.costs().otrosGastosCompra" suffix="€" (valueChange)="updateCosts('otrosGastosCompra', $event)"></field-edit>
          </div>
          <field-read label="Total Gastos Compra" [value]="fmtCurrency(e.totalGastosCompra())" [highlight]="true"></field-read>
          @if (e.costs().superficie > 0) {
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Precio/m²" [value]="fmtCurrency(e.precioM2()) + '/m²'"></field-read>
              <field-read label="Gastos/m²" [value]="fmtCurrency(e.gastosCompraM2()) + '/m²'"></field-read>
            </div>
          }
        </div>

        <!-- Inversión Total -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Inversión Total</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Mobiliario" [value]="e.costs().mobiliario" suffix="€" (valueChange)="updateCosts('mobiliario', $event)"></field-edit>
            <field-edit label="Coste Reforma" [value]="e.costs().costeReforma" suffix="€" (valueChange)="updateCosts('costeReforma', $event)"></field-edit>
          </div>
          <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
        </div>

        <!-- Financiación -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Financiación</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Interés Anual" [value]="e.financing1().interesAnual" suffix="%" (valueChange)="updateFinancing1('interesAnual', $event)"></field-edit>
            <field-edit label="Años" [value]="e.financing1().anosAmortizacion" suffix="años" (valueChange)="updateFinancing1('anosAmortizacion', $event)"></field-edit>
            <field-edit label="% Financiado" [value]="e.financing1().porcentajeFinanciado" suffix="%" (valueChange)="updateFinancing1('porcentajeFinanciado', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <field-read label="Préstamo Hipotecario" [value]="fmtCurrency(e.prestamoHipotecario())"></field-read>
            <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropio())"></field-read>
          </div>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Cuota Mensual" [value]="fmtCurrency(e.cuotaMensual())" [highlight]="true"></field-read>
              <field-read label="Cuota Anual" [value]="fmtCurrency(e.cuotaAnual())" [highlight]="true"></field-read>
              <field-read label="Intereses Año 1" [value]="fmtCurrency(e.interesesAnio1())"></field-read>
              <field-read label="Amortización Año 1" [value]="fmtCurrency(e.amortizacionAnio1())"></field-read>
            </div>
          </div>
        </div>

        <!-- Gastos Anuales -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Gastos Anuales (Posesión)</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="IBI" [value]="e.costs().ibi" suffix="€/año" (valueChange)="updateCosts('ibi', $event)"></field-edit>
            <field-edit label="Seguro Hogar" [value]="e.costs().seguro" suffix="€/año" (valueChange)="updateCosts('seguro', $event)"></field-edit>
            <field-edit label="Seguro Impago" [value]="e.costs().seguroImpago" suffix="€/año" (valueChange)="updateCosts('seguroImpago', $event)"></field-edit>
            <field-edit label="Comunidad" [value]="e.costs().comunidad" suffix="€/año" (valueChange)="updateCosts('comunidad', $event)"></field-edit>
          </div>
          <field-read label="Gastos Anuales Totales" [value]="fmtCurrency(e.gastosAnuales())" [highlight]="true"></field-read>
        </div>
      }

      <!-- CRA TAB -->
      @if (activeTab() === 'cra') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Neta</p>
            <p class="text-base font-bold" [class]="yieldClass(e.craRentabilidadNeta().med)">{{ fmtPct(e.craRentabilidadNeta().med) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Neto</p>
            <p class="text-base font-bold" [class]="e.craBeneficioBruto().med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.craBeneficioBruto().med) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">ROE</p>
            <p class="text-base font-bold" [class]="yieldClass(e.craROE().med)">{{ fmtPct(e.craROE().med) }}</p>
          </div>
        </div>

        <!-- Estimación Alquiler -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Estimación Alquiler Mensual</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Mín" [value]="e.craEstimates().alquilerMensualMin" suffix="€" (valueChange)="updateCra('alquilerMensualMin', $event)"></field-edit>
            <field-edit label="Medio" [value]="e.craEstimates().alquilerMensualMed" suffix="€" (valueChange)="updateCra('alquilerMensualMed', $event)"></field-edit>
            <field-edit label="Máx" [value]="e.craEstimates().alquilerMensualMax" suffix="€" (valueChange)="updateCra('alquilerMensualMax', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Ocupación" [value]="e.craEstimates().porcentajeOcupacion * 100" suffix="%" (valueChange)="updateCraPct('porcentajeOcupacion', $event)"></field-edit>
            <field-edit label="Reparaciones" [value]="e.craEstimates().reparacionesAnuales" suffix="€/año" (valueChange)="updateCra('reparacionesAnuales', $event)"></field-edit>
            <field-edit label="Seg. Impago" [value]="e.craEstimates().seguroImpago" suffix="€/año" (valueChange)="updateCra('seguroImpago', $event)"></field-edit>
          </div>
        </div>

        <!-- Resultados CRA -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Resultados CRA</h3>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <field-read label="Alquiler Anual" [value]="fmtCurrency(e.craAlquilerAnual().min)" [small]="true"></field-read>
              <field-read label="" [value]="fmtCurrency(e.craAlquilerAnual().med)" [small]="true"></field-read>
              <field-read label="" [value]="fmtCurrency(e.craAlquilerAnual().max)" [small]="true"></field-read>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <field-read label="Ingresos Anuales" [value]="fmtCurrency(e.craIngresosAnuales().min)" [small]="true"></field-read>
              <field-read label="" [value]="fmtCurrency(e.craIngresosAnuales().med)" [small]="true"></field-read>
              <field-read label="" [value]="fmtCurrency(e.craIngresosAnuales().max)" [small]="true"></field-read>
            </div>
            <field-read label="Gastos Totales" [value]="fmtCurrency(e.craGastosTotales())" [highlight]="true"></field-read>
            <div class="border-t border-warm-border pt-3 space-y-3">
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craBeneficioBruto().min, e.craBeneficioBruto().med, e.craBeneficioBruto().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio Bruto' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craRentabilidadBruta().min, e.craRentabilidadBruta().med, e.craRentabilidadBruta().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Rent. Bruta' : '' }}</p>
                    <p class="text-sm font-bold" [class]="yieldClass(val)">{{ fmtPct(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craRentabilidadNeta().min, e.craRentabilidadNeta().med, e.craRentabilidadNeta().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Rent. Neta' : '' }}</p>
                    <p class="text-sm font-bold" [class]="yieldClass(val)">{{ fmtPct(val) }}</p>
                  </div>
                }
              </div>
            </div>
            <div class="border-t border-warm-border pt-3">
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craBeneficioDespuesFinanciacion().min, e.craBeneficioDespuesFinanciacion().med, e.craBeneficioDespuesFinanciacion().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Después Financiación' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 gap-3 mt-3">
                @for (val of [e.craROE().min, e.craROE().med, e.craROE().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'ROE' : '' }}</p>
                    <p class="text-sm font-bold" [class]="yieldClass(val)">{{ fmtPct(val) }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- CRV TAB -->
      @if (activeTab() === 'crv') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Bruto</p>
            <p class="text-base font-bold" [class]="e.crvBeneficioBruto().med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.crvBeneficioBruto().med) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rentabilidad</p>
            <p class="text-base font-bold" [class]="yieldClass(e.crvRentabilidad().med)">{{ fmtPct(e.crvRentabilidad().med) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Estimación Venta</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.crvEstimates().estimacionVentaMed) }}</p>
          </div>
        </div>

        <!-- Estimación Venta -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Estimación Venta</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Venta Mín" [value]="e.crvEstimates().estimacionVentaMin" suffix="€" (valueChange)="updateCrv('estimacionVentaMin', $event)"></field-edit>
            <field-edit label="Venta Med" [value]="e.crvEstimates().estimacionVentaMed" suffix="€" (valueChange)="updateCrv('estimacionVentaMed', $event)"></field-edit>
            <field-edit label="Venta Máx" [value]="e.crvEstimates().estimacionVentaMax" suffix="€" (valueChange)="updateCrv('estimacionVentaMax', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Comisión Mín" [value]="e.crvEstimates().comisionVentaMin" suffix="€" (valueChange)="updateCrv('comisionVentaMin', $event)"></field-edit>
            <field-edit label="Comisión Med" [value]="e.crvEstimates().comisionVentaMed" suffix="€" (valueChange)="updateCrv('comisionVentaMed', $event)"></field-edit>
            <field-edit label="Comisión Máx" [value]="e.crvEstimates().comisionVentaMax" suffix="€" (valueChange)="updateCrv('comisionVentaMax', $event)"></field-edit>
          </div>
          <field-edit label="Otros Gastos Venta" [value]="e.crvEstimates().otrosGastosVenta" suffix="€" (valueChange)="updateCrv('otrosGastosVenta', $event)"></field-edit>
        </div>

        <!-- Resultados CRV -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Resultados CRV</h3>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
            <div class="grid grid-cols-3 gap-3">
              @for (val of [e.crvBeneficioBruto().min, e.crvBeneficioBruto().med, e.crvBeneficioBruto().max]; track $index) {
                <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                  <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio Bruto' : $index === 1 ? 'Medio' : 'Máximo' }}</p>
                  <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                </div>
              }
            </div>
            <div class="grid grid-cols-3 gap-3">
              @for (val of [e.crvRentabilidad().min, e.crvRentabilidad().med, e.crvRentabilidad().max]; track $index) {
                <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                  <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Rentabilidad' : $index === 1 ? 'Medio' : 'Máximo' }}</p>
                  <p class="text-sm font-bold" [class]="yieldClass(val)">{{ fmtPct(val) }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- CORTO PLAZO TAB -->
      @if (activeTab() === 'corto-plazo') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Ingreso Bruto</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.srIngresoAnualBrutoMin()) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Neto</p>
            <p class="text-base font-bold" [class]="e.srBeneficioNetoMin() > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.srBeneficioNetoMin()) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Neta</p>
            <p class="text-base font-bold" [class]="yieldClass(e.srRentabilidadNetaMin())">{{ fmtPct(e.srRentabilidadNetaMin()) }}</p>
          </div>
        </div>

        <!-- Temporada Alta -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Temporada Alta</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaAltaMin" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMin', $event)"></field-edit>
            <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaAltaMed" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMed', $event)"></field-edit>
            <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaAltaMax" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMax', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosAlta" suffix="días" (valueChange)="updateShortRental('diasOcupadosAlta', $event)"></field-edit>
            <field-edit label="Meses" [value]="e.shortRental().mesesAlta" suffix="meses" (valueChange)="updateShortRental('mesesAlta', $event)"></field-edit>
            <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoAltaMin()) + ' – ' + fmtCurrency(e.srIngresoAltaMax())" [small]="true"></field-read>
          </div>
        </div>

        <!-- Temporada Media -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Temporada Media</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaMediaMin" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMin', $event)"></field-edit>
            <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaMediaMed" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMed', $event)"></field-edit>
            <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaMediaMax" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMax', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosMedia" suffix="días" (valueChange)="updateShortRental('diasOcupadosMedia', $event)"></field-edit>
            <field-edit label="Meses" [value]="e.shortRental().mesesMedia" suffix="meses" (valueChange)="updateShortRental('mesesMedia', $event)"></field-edit>
            <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoMediaMin()) + ' – ' + fmtCurrency(e.srIngresoMediaMax())" [small]="true"></field-read>
          </div>
        </div>

        <!-- Temporada Baja -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Temporada Baja</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaBajaMin" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMin', $event)"></field-edit>
            <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaBajaMed" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMed', $event)"></field-edit>
            <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaBajaMax" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMax', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosBaja" suffix="días" (valueChange)="updateShortRental('diasOcupadosBaja', $event)"></field-edit>
            <field-edit label="Meses" [value]="e.shortRental().mesesBaja" suffix="meses" (valueChange)="updateShortRental('mesesBaja', $event)"></field-edit>
            <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoBajaMin()) + ' – ' + fmtCurrency(e.srIngresoBajaMax())" [small]="true"></field-read>
          </div>
        </div>

        <!-- Gastos Corto Plazo -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Gastos</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Reparaciones/año" [value]="e.shortRental().reparacionesAnuales" suffix="€" (valueChange)="updateShortRental('reparacionesAnuales', $event)"></field-edit>
            <field-edit label="Otros/año" [value]="e.shortRental().otrosAnual" suffix="€" (valueChange)="updateShortRental('otrosAnual', $event)"></field-edit>
            <field-edit label="Limpieza/estancia" [value]="e.shortRental().limpiezaEstancia" suffix="€" (valueChange)="updateShortRental('limpiezaEstancia', $event)"></field-edit>
            <field-edit label="Suministros/mes" [value]="e.shortRental().suministrosMensuales" suffix="€" (valueChange)="updateShortRental('suministrosMensuales', $event)"></field-edit>
            <field-edit label="Comisión Plataformas" [value]="e.shortRental().comisionPlataformas * 100" suffix="%" (valueChange)="updateShortRentalPct('comisionPlataformas', $event)"></field-edit>
            <field-edit label="Comisión Gestión" [value]="e.shortRental().comisionGestion * 100" suffix="%" (valueChange)="updateShortRentalPct('comisionGestion', $event)"></field-edit>
          </div>
        </div>

        <!-- Resultados Corto Plazo -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Resultados Alquiler Corto Plazo</h3>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Ingreso Bruto Anual" [value]="fmtCurrency(e.srIngresoAnualBrutoMin()) + ' – ' + fmtCurrency(e.srIngresoAnualBrutoMax())" [highlight]="true"></field-read>
              <field-read label="Gastos Totales" [value]="fmtCurrency(e.srGastosAnuales())" [highlight]="true"></field-read>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Beneficio Neto" [value]="fmtCurrency(e.srBeneficioNetoMin()) + ' – ' + fmtCurrency(e.srBeneficioNetoMax())"
                         [highlight]="true" [highlightClass]="e.srBeneficioNetoMin() > 0 ? 'text-emerald-700' : 'text-red-600'"></field-read>
              <field-read label="Rent. Neta" [value]="fmtPct(e.srRentabilidadNetaMin()) + ' – ' + fmtPct(e.srRentabilidadNetaMax())"
                         [highlight]="true" [highlightClass]="yieldClass(e.srRentabilidadNetaMin())"></field-read>
            </div>
          </div>
        </div>

        <!-- Alquiler por Espacios -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Alquiler por Espacios</h3>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Precio Espacio Mín" [value]="e.spacesRental().precioEspacio1Min" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Min', $event)"></field-edit>
            <field-edit label="Precio Espacio Med" [value]="e.spacesRental().precioEspacio1Med" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Med', $event)"></field-edit>
            <field-edit label="Precio Espacio Máx" [value]="e.spacesRental().precioEspacio1Max" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Max', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <field-edit label="Nº Espacios" [value]="e.spacesRental().numEspacios1" suffix="" (valueChange)="updateSpacesRental('numEspacios1', $event)"></field-edit>
            <field-edit label="Ocupación" [value]="e.spacesRental().porcentajeOcupacion" suffix="%" (valueChange)="updateSpacesRental('porcentajeOcupacion', $event)"></field-edit>
            <field-edit label="Inversión Ade." [value]="e.spacesRental().inversionAdecuacion" suffix="€" (valueChange)="updateSpacesRental('inversionAdecuacion', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Reparaciones/año" [value]="e.spacesRental().reparacionesAnuales" suffix="€" (valueChange)="updateSpacesRental('reparacionesAnuales', $event)"></field-edit>
            <field-edit label="Gestión" [value]="e.spacesRental().gestionPorcentaje" suffix="%" (valueChange)="updateSpacesRental('gestionPorcentaje', $event)"></field-edit>
          </div>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-2">
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Ingreso Mensual" [value]="fmtCurrency(e.spIngresoMensual())" [highlight]="true"></field-read>
              <field-read label="Ingreso Anual" [value]="fmtCurrency(e.spIngresoAnual())" [highlight]="true"></field-read>
              <field-read label="Beneficio Anual" [value]="fmtCurrency(e.spBeneficioAnual())"
                         [highlightClass]="e.spBeneficioAnual() > 0 ? 'text-emerald-700' : 'text-red-600'"></field-read>
              <field-read label="Rentabilidad" [value]="fmtPct(e.spRentabilidad())"
                         [highlightClass]="yieldClass(e.spRentabilidad())"></field-read>
            </div>
          </div>
        </div>
      }

      <!-- REFORMA TAB -->
      @if (activeTab() === 'reforma') {
        <!-- Reform Total -->
        <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-4 text-center">
          <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Presupuesto Reforma Total</p>
          <p class="text-2xl font-bold text-petrol">{{ fmtCurrency(e.reformaTotal()) }}</p>
        </div>

        <!-- Partidas Reforma -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-3">
          <h3 class="text-sm font-semibold text-petrol">Partidas de Reforma</h3>
          @for (item of reformItems; track item.key) {
            <div class="flex items-center justify-between py-1.5 border-b border-warm-border/50 last:border-b-0">
              <span class="text-sm text-petrol">{{ item.label }}</span>
              <div class="w-28">
                <input type="number" [value]="getReformaValue(item.key)"
                       (input)="updateReforma(item.key, $event)"
                       class="w-full text-right bg-cream/50 rounded-[10px] px-2 py-1 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none" />
              </div>
            </div>
          }
          <div class="flex items-center justify-between pt-2 border-t-2 border-petrol/20">
            <span class="text-sm font-bold text-petrol">Total Reforma</span>
            <span class="text-sm font-bold text-petrol">{{ fmtCurrency(e.reformaTotal()) }}</span>
          </div>
        </div>

        <!-- Bonificación Hipoteca -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Bonificación Hipoteca</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Seguro Vida" [value]="e.mortgageBonus().seguroVida" suffix="€" (valueChange)="updateMortgageBonus('seguroVida', $event)"></field-edit>
            <field-edit label="Seguro Hogar" [value]="e.mortgageBonus().seguroHogar" suffix="€" (valueChange)="updateMortgageBonus('seguroHogar', $event)"></field-edit>
            <field-edit label="Nómina" [value]="e.mortgageBonus().nomina" suffix="€" (valueChange)="updateMortgageBonus('nomina', $event)"></field-edit>
            <field-edit label="Tarjeta Crédito" [value]="e.mortgageBonus().tarjetaCredito" suffix="€" (valueChange)="updateMortgageBonus('tarjetaCredito', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <field-edit label="Ahorro Vida %" [value]="e.mortgageBonus().seguroVidaAhorroPct * 100" suffix="%" (valueChange)="updateMortgageBonusPct('seguroVidaAhorroPct', $event)"></field-edit>
            <field-edit label="Ahorro Hogar %" [value]="e.mortgageBonus().seguroHogarAhorroPct * 100" suffix="%" (valueChange)="updateMortgageBonusPct('seguroHogarAhorroPct', $event)"></field-edit>
            <field-edit label="Ahorro Nómina %" [value]="e.mortgageBonus().nominaAhorroPct * 100" suffix="%" (valueChange)="updateMortgageBonusPct('nominaAhorroPct', $event)"></field-edit>
            <field-edit label="Ahorro Tarjeta %" [value]="e.mortgageBonus().tarjetaAhorroPct * 100" suffix="%" (valueChange)="updateMortgageBonusPct('tarjetaAhorroPct', $event)"></field-edit>
          </div>
          <div class="bg-sand/40 rounded-[14px] p-4 space-y-2">
            <div class="grid grid-cols-3 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide">
              <span>Producto</span>
              <span class="text-right">Ahorro</span>
              <span class="text-right">Coste Otro</span>
            </div>
            @for (item of bonificacionItems; track item.key) {
              <div class="grid grid-cols-3 gap-2 items-center py-1 border-b border-warm-border/30 last:border-b-0">
                <span class="text-xs text-petrol font-medium">{{ item.label }}</span>
                <span class="text-xs text-right font-semibold" [class]="getBonItem(item.key).ahorroEuros > 0 ? 'text-emerald-700' : 'text-stone'">{{ fmtCurrency(getBonItem(item.key).ahorroEuros) }}</span>
                <span class="text-xs text-right text-stone">{{ fmtCurrency(getBonItem(item.key).costeOtro) }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- COMPARATIVA TAB -->
      @if (activeTab() === 'comparativa') {
        <!-- Comparativa Rentabilidad -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Comparativa de Escenarios</h3>
          <div class="bg-sand/40 rounded-[14px] p-4">
            <div class="grid grid-cols-3 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide mb-3">
              <span></span>
              <span class="text-center">CRA</span>
              <span class="text-center">CRV</span>
            </div>

            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-2 items-center">
                <span class="text-xs text-petrol font-medium">Inversión Total</span>
                <span class="text-xs text-center font-semibold text-petrol col-span-2">{{ fmtCurrency(e.inversionTotal()) }}</span>
              </div>

              <div class="border-t border-warm-border/50 pt-3">
                <p class="text-[10px] text-stone font-medium uppercase tracking-wide mb-2">Rentabilidad Anual</p>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Mín</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.cra.min)">{{ fmtPct(e.comparativa().rentabilidadAnual.cra.min) }}</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.crv.min)">{{ fmtPct(e.comparativa().rentabilidadAnual.crv.min) }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Medio</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.cra.med)">{{ fmtPct(e.comparativa().rentabilidadAnual.cra.med) }}</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.crv.med)">{{ fmtPct(e.comparativa().rentabilidadAnual.crv.med) }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Máx</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.cra.max)">{{ fmtPct(e.comparativa().rentabilidadAnual.cra.max) }}</span>
                  <span class="text-xs text-center font-bold" [class]="yieldClass(e.comparativa().rentabilidadAnual.crv.max)">{{ fmtPct(e.comparativa().rentabilidadAnual.crv.max) }}</span>
                </div>
              </div>

              <div class="border-t border-warm-border/50 pt-3">
                <p class="text-[10px] text-stone font-medium uppercase tracking-wide mb-2">Beneficio después de Financiación</p>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Mín</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.cra.min > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.cra.min) }}</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.crv.min > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.crv.min) }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Medio</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.cra.med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.cra.med) }}</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.crv.med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.crv.med) }}</span>
                </div>
                <div class="grid grid-cols-3 gap-2 items-center">
                  <span class="text-xs text-petrol">Máx</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.cra.max > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.cra.max) }}</span>
                  <span class="text-xs text-center font-bold" [class]="e.comparativa().beneficiosDespuesFinanciacion.crv.max > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.comparativa().beneficiosDespuesFinanciacion.crv.max) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen Global -->
        <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Resumen Global</h3>
          <div class="grid grid-cols-2 gap-3">
            <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
            <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropio())" [highlight]="true"></field-read>
            <field-read label="Cuota Mensual" [value]="fmtCurrency(e.cuotaMensual())" [highlight]="true"></field-read>
            <field-read label="Cuota Anual" [value]="fmtCurrency(e.cuotaAnual())" [highlight]="true"></field-read>
          </div>
          @if (e.costs().superficie > 0) {
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Precio/m²" [value]="fmtCurrency(e.precioM2()) + '/m²'"></field-read>
              <field-read label="% Gastos Compra" [value]="fmtPct(e.porcentajeGastosCompra())"></field-read>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: []
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