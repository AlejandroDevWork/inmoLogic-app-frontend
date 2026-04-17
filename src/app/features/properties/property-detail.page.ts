import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { createCalculationEngine } from '../calc/calculation.model';
import { FieldEditComponent, FieldReadComponent } from '../calc/calc.page';
import { LucideAngularModule, ArrowLeft, Calculator, TrendingUp, Home, FileText } from 'lucide-angular';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FieldEditComponent, FieldReadComponent],
  template: `
    <div class="px-5 pt-6 pb-8 space-y-5 bg-cream min-h-full max-w-2xl mx-auto overflow-y-auto">

      <!-- Back button + Header -->
      <div class="flex items-center gap-3">
        <button (click)="goBack()" class="w-9 h-9 rounded-[12px] bg-white/70 border border-warm-border flex items-center justify-center transition-colors hover:bg-white">
          <lucide-icon [img]="iconArrowLeft" class="text-petrol" [size]="18"></lucide-icon>
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-petrol truncate">{{ property()?.direccion || 'Propiedad' }}</h1>
          <p class="text-xs text-stone">{{ property()?.zona || '' }}</p>
        </div>
      </div>

      <!-- Property Key Metrics -->
      <div class="grid grid-cols-4 gap-2">
        <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
          <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Precio</p>
          <p class="text-sm font-bold text-petrol">{{ fmtCurrency(property()?.precioPedido || 0) }}</p>
        </div>
        <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
          <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Estado</p>
          <p class="text-sm font-bold" [class]="statusColor()">{{ statusLabel() }}</p>
        </div>
        <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
          <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Inversión</p>
          <p class="text-sm font-bold text-petrol">{{ fmtCurrency(e.inversionTotal()) }}</p>
        </div>
        <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
          <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Reforma</p>
          <p class="text-sm font-bold" [class]="reformaTier() ? 'text-earth' : 'text-stone'">{{ reformaTierLabel() }}</p>
        </div>
      </div>

      <!-- Tab Pills -->
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button (click)="activeTab.set('info')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'info' ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
          <lucide-icon [img]="iconFileText" [size]="14" class="inline mr-1"></lucide-icon>
          Info
        </button>
        <button (click)="activeTab.set('calculo')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'calculo' ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
          <lucide-icon [img]="iconCalculator" [size]="14" class="inline mr-1"></lucide-icon>
          Cálculo
        </button>
      </div>

      <!-- INFO TAB -->
      @if (activeTab() === 'info') {
        <div class="space-y-4">
          <!-- Datos del Inmueble -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Datos del Inmueble</h3>
            @if (property()) {
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Dirección</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.direccion }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Zona</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.zona }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Código Postal</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.codigoPostal || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Superficie</p>
                  <p class="text-sm text-petrol font-medium">{{ (property()!.propertyData?.superficie || property()!.metrosCuadrados || '—') }} {{ property()!.propertyData?.superficie || property()!.metrosCuadrados ? 'm²' : '' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Habitaciones</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.habitaciones ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Baños</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.banos ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Ascensor</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.ascensor ? 'Sí' : 'No' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Planta</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.planta || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Orientación</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.orientacion || '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Año Construcción</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.anoConstruccion ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Terraza/Balcón</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.terrazaBalcon ? 'Sí' : 'No' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Parking/Trastero</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.propertyData?.parkingTrastero ? 'Sí' : 'No' }}</p>
                </div>
              </div>
            } @else {
              <p class="text-sm text-stone">Propiedad no encontrada</p>
            }
          </div>

          <!-- Datos del Anuncio -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Datos del Anuncio</h3>
            @if (property()) {
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Precio del Anuncio</p>
                  <p class="text-sm text-petrol font-bold">{{ fmtCurrency(property()!.precioPedido) }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Portal</p>
                  <p class="text-sm text-petrol font-medium">{{ portalLabel() }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Enlace</p>
                  @if (property()!.adData?.enlace) {
                    <a [href]="property()!.adData!.enlace" target="_blank" rel="noopener noreferrer"
                       class="text-sm text-earth underline hover:text-petrol break-all">
                      {{ property()!.adData!.enlace }}
                    </a>
                  } @else {
                    <p class="text-sm text-stone">No disponible</p>
                  }
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Precio Rebajado</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.adData?.precioRebajado ? 'Sí' : 'No' }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Tiempo Publicado</p>
                  <p class="text-sm text-petrol font-medium">{{ property()!.adData?.tiempoPublicado ? property()!.adData!.tiempoPublicado! + ' días' : '—' }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Precio Máximo de Compra -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-petrol">Precio Máximo de Compra</h3>
              <div class="flex items-center gap-2">
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Objetivo</label>
                <input type="number" [value]="targetYieldPct()"
                       (input)="updateTargetYield($event)"
                       class="w-14 bg-cream/50 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-center"
                       step="0.5" min="0" max="100" />
                <span class="text-[10px] text-stone">%</span>
              </div>
            </div>

            <!-- Column headers -->
            <div class="grid grid-cols-4 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide">
              <span>Modelo</span>
              <span class="text-center">Min</span>
              <span class="text-center">Med</span>
              <span class="text-center">Máx</span>
            </div>

            <!-- CRA -->
            <div class="grid grid-cols-4 gap-2 items-center py-2 border-b border-warm-border/50">
              <span class="text-xs text-petrol font-medium">Alq. Largo Plazo</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().min)">{{ fmtPrice(e.craPrecioMaximoCompra().min) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().med)">{{ fmtPrice(e.craPrecioMaximoCompra().med) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().max)">{{ fmtPrice(e.craPrecioMaximoCompra().max) }}</span>
            </div>

            <!-- CRV -->
            <div class="grid grid-cols-4 gap-2 items-center py-2 border-b border-warm-border/50">
              <span class="text-xs text-petrol font-medium">Venta/Revalor.</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.crvPrecioMaximoCompra().min)">{{ fmtPrice(e.crvPrecioMaximoCompra().min) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.crvPrecioMaximoCompra().med)">{{ fmtPrice(e.crvPrecioMaximoCompra().med) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.crvPrecioMaximoCompra().max)">{{ fmtPrice(e.crvPrecioMaximoCompra().max) }}</span>
            </div>

            <!-- Short rental -->
            <div class="grid grid-cols-4 gap-2 items-center py-2 border-b border-warm-border/50">
              <span class="text-xs text-petrol font-medium">Alq. Corto Plazo</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.srPrecioMaximoCompra().min)">{{ fmtPrice(e.srPrecioMaximoCompra().min) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.srPrecioMaximoCompra().med)">{{ fmtPrice(e.srPrecioMaximoCompra().med) }}</span>
              <span class="text-xs text-center font-bold" [class]="priceClass(e.srPrecioMaximoCompra().max)">{{ fmtPrice(e.srPrecioMaximoCompra().max) }}</span>
            </div>

            <!-- Space rental -->
            <div class="grid grid-cols-4 gap-2 items-center py-2">
              <span class="text-xs text-petrol font-medium">Alq. Espacios</span>
              <span class="text-xs text-center font-bold col-span-3" [class]="priceClass(e.spPrecioMaximoCompra())">{{ fmtPrice(e.spPrecioMaximoCompra()) }}</span>
            </div>

            <p class="text-[10px] text-stone italic">Precio máximo para alcanzar la rentabilidad objetivo al precio de pedido {{ fmtCurrency(property()?.precioPedido || 0) }}</p>
          </div>
        </div>
      }

      <!-- CALCULO TAB -->
      @if (activeTab() === 'calculo') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Inversión</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.inversionTotal()) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Neta CRA</p>
            <p class="text-base font-bold" [class]="yieldClass(e.craRentabilidadNeta().med)">{{ fmtPct(e.craRentabilidadNeta().med) }}</p>
          </div>
          <div class="bg-white/70 backdrop-blur-md rounded-[20px] border border-white/40 shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. CRV</p>
            <p class="text-base font-bold" [class]="yieldClass(e.crvRentabilidad().med)">{{ fmtPct(e.crvRentabilidad().med) }}</p>
          </div>
        </div>

        <!-- Section Tabs -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          @for (tab of calcTabs; track tab.key) {
            <button (click)="calcSection.set(tab.key)"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                    [class]="calcSection() === tab.key ? 'bg-earth text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- INVERSIÓN -->
        @if (calcSection() === 'inversion') {
          <!-- Precio de Compra -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Precio de Compra</h3>
            <div class="grid grid-cols-2 gap-3">
              <field-edit label="Precio Inmueble" [value]="e.costs().precioInmueble" suffix="€" (valueChange)="updateCosts('precioInmueble', $event)"></field-edit>
              <div class="flex flex-col gap-1">
                <field-edit label="Descuento" [value]="e.costs().descuento" suffix="%" (valueChange)="updateCosts('descuento', $event)"></field-edit>
                <span class="text-[10px] text-stone text-right">{{ fmtCurrency(e.descuento()) }}</span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Precio de Compra" [value]="fmtCurrency(e.precioCompra())" [highlight]="true"></field-read>
              <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
            </div>
          </div>

          <!-- Gastos del Inmueble -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Gastos del Inmueble</h3>

            <!-- Gastos Compra inputs -->
            <div class="grid grid-cols-2 gap-3">
              <field-edit label="Ref. Catastral" [value]="e.costs().valorReferenciaCatastral" suffix="€" (valueChange)="updateCosts('valorReferenciaCatastral', $event)"></field-edit>
              <field-edit label="Notaría/Registro" [value]="e.costs().notarioRegistro" suffix="€" (valueChange)="updateCosts('notarioRegistro', $event)"></field-edit>
              <field-edit label="IVA/ITP %" [value]="e.costs().itpPorcentaje" suffix="%" (valueChange)="updateCosts('itpPorcentaje', $event)"></field-edit>
              <field-read label="IVA/ITP" [value]="fmtCurrency(e.itp())"></field-read>
              <field-edit label="Comisión Compra" [value]="e.costs().comisionCompra" suffix="€" (valueChange)="updateCosts('comisionCompra', $event)"></field-edit>
              <field-edit label="Gastos Financiación" [value]="e.costs().gastosFinanciacion" suffix="€" (valueChange)="updateCosts('gastosFinanciacion', $event)"></field-edit>
              <field-edit label="Equipo Captación" [value]="e.costs().equipoInternoCaptacion" suffix="€" (valueChange)="updateCosts('equipoInternoCaptacion', $event)"></field-edit>
              <field-edit label="Otros Gastos" [value]="e.costs().otrosGastosCompra" suffix="€" (valueChange)="updateCosts('otrosGastosCompra', $event)"></field-edit>
            </div>

            <!-- Toma Posesión y Obras -->
            <div class="pt-3 border-t border-warm-border/50">
              <h4 class="text-xs font-semibold text-petrol mb-2">Toma Posesión y Obras</h4>
              <div class="grid grid-cols-2 gap-3">
                <field-edit label="Mobiliario" [value]="e.costs().mobiliario" suffix="€" (valueChange)="updateCosts('mobiliario', $event)"></field-edit>
                <field-edit label="Coste Reforma" [value]="e.costs().costeReforma" suffix="€" (valueChange)="updateCosts('costeReforma', $event)"></field-edit>
              </div>
            </div>

            <!-- Gastos Anuales -->
            <div class="pt-3 border-t border-warm-border/50">
              <h4 class="text-xs font-semibold text-petrol mb-2">Gastos Anuales</h4>
              <div class="grid grid-cols-2 gap-3">
                <field-edit label="IBI + Tasas" [value]="e.costs().ibi" suffix="€/año" (valueChange)="updateCosts('ibi', $event)"></field-edit>
                <field-edit label="Seguro" [value]="e.costs().seguro" suffix="€/año" (valueChange)="updateCosts('seguro', $event)"></field-edit>
                <field-edit label="Seguro Impago" [value]="e.costs().seguroImpago" suffix="€/año" (valueChange)="updateCosts('seguroImpago', $event)"></field-edit>
                <field-edit label="Comunidad" [value]="e.costs().comunidad" suffix="€/año" (valueChange)="updateCosts('comunidad', $event)"></field-edit>
              </div>
            </div>

            <!-- Summary table (below all inputs) -->
            <div class="bg-sand/30 rounded-[14px] p-3">
              <div class="grid grid-cols-4 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide mb-2">
                <span>Concepto</span>
                <span class="text-right">Importe</span>
                <span class="text-right">€/m²</span>
                <span class="text-right">% Gastos</span>
              </div>
              @for (row of gastosTable(); track row.label) {
                <div class="grid grid-cols-4 gap-2 items-center py-1" [class]="row.isTotal ? 'bg-white/50 rounded-[8px] px-2 -mx-2' : ''">
                  <span class="text-xs text-petrol" [class.font-semibold]="row.isTotal">{{ row.label }}</span>
                  <span class="text-xs text-right" [class.font-bold]="row.isTotal" [class.text-petrol]="row.isTotal">{{ fmtCurrency(row.amount) }}</span>
                  <span class="text-xs text-right text-stone">{{ fmtPerM2(row.amount) }}</span>
                  <span class="text-xs text-right text-stone">{{ fmtPctOf(row.amount, row.totalBase) }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Reformas -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Reformas</h3>
            <div class="grid grid-cols-3 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide">
              <span>Nivel</span>
              <span class="text-right">€/m²</span>
              <span class="text-right">Total</span>
            </div>
            <!-- Low tier -->
            <div class="grid grid-cols-3 gap-2 items-center py-1.5">
              <span class="text-xs text-petrol font-medium">Low</span>
              <input type="number" [value]="e.reformaTiers().lowM2"
                     (input)="updateReformaTier('lowM2', $event)"
                     class="w-full bg-cream/50 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
                     step="1" min="0" />
              <span class="text-xs text-right font-medium text-petrol">{{ fmtCurrency(e.reformaLow()) }}</span>
            </div>
            <!-- Media tier -->
            <div class="grid grid-cols-3 gap-2 items-center py-1.5">
              <span class="text-xs text-petrol font-medium">Media</span>
              <input type="number" [value]="e.reformaTiers().mediaM2"
                     (input)="updateReformaTier('mediaM2', $event)"
                     class="w-full bg-cream/50 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
                     step="1" min="0" />
              <span class="text-xs text-right font-medium text-petrol">{{ fmtCurrency(e.reformaMedia()) }}</span>
            </div>
            <!-- Lujo tier -->
            <div class="grid grid-cols-3 gap-2 items-center py-1.5">
              <span class="text-xs text-petrol font-medium">Lujo</span>
              <input type="number" [value]="e.reformaTiers().lujoM2"
                     (input)="updateReformaTier('lujoM2', $event)"
                     class="w-full bg-cream/50 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
                     step="1" min="0" />
              <span class="text-xs text-right font-medium text-petrol">{{ fmtCurrency(e.reformaLujo()) }}</span>
            </div>
            <div class="flex gap-2">
              <button (click)="applyReformaTier('low')" class="flex-1 px-3 py-2 rounded-[12px] text-xs font-medium transition-colors"
                      [class]="reformaTier() === 'low' ? 'bg-earth text-white shadow-sm' : 'bg-earth/10 text-earth border border-earth/30 hover:bg-earth/20'">Low</button>
              <button (click)="applyReformaTier('media')" class="flex-1 px-3 py-2 rounded-[12px] text-xs font-medium transition-colors"
                      [class]="reformaTier() === 'media' ? 'bg-earth text-white shadow-sm' : 'bg-earth/10 text-earth border border-earth/30 hover:bg-earth/20'">Media</button>
              <button (click)="applyReformaTier('lujo')" class="flex-1 px-3 py-2 rounded-[12px] text-xs font-medium transition-colors"
                      [class]="reformaTier() === 'lujo' ? 'bg-earth text-white shadow-sm' : 'bg-earth/10 text-earth border border-earth/30 hover:bg-earth/20'">Lujo</button>
            </div>
          </div>

          <!-- Financiación -->
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Financiación</h3>
            <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              <button (click)="financingTab.set('hipoteca')"
                      class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                      [class]="financingTab() === 'hipoteca' ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
                Hipoteca
              </button>
              <button (click)="financingTab.set('gestion')"
                      class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                      [class]="financingTab() === 'gestion' ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
                Gestión
              </button>
              <button (click)="financingTab.set('interes')"
                      class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                      [class]="financingTab() === 'interes' ? 'bg-petrol text-white shadow-sm' : 'bg-white/70 text-stone border border-warm-border'">
                Interés Fijo/Variable
              </button>
            </div>

            <!-- Hipoteca -->
            @if (financingTab() === 'hipoteca') {
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-3">
                  <field-edit label="Interés %" [value]="e.financing1().interesAnual" suffix="%" (valueChange)="updateFinancing1('interesAnual', $event)"></field-edit>
                  <field-edit label="Años" [value]="e.financing1().anosAmortizacion" suffix="" (valueChange)="updateFinancing1('anosAmortizacion', $event)"></field-edit>
                  <field-edit label="% Financiado" [value]="e.financing1().porcentajeFinanciado" suffix="%" (valueChange)="updateFinancing1('porcentajeFinanciado', $event)"></field-edit>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <field-read label="Préstamo Hipotecario" [value]="fmtCurrency(e.prestamoHipotecario())"></field-read>
                  <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropio())"></field-read>
                  <field-read label="Cuota Mensual" [value]="fmtCurrency(e.cuotaMensual())" [highlight]="true"></field-read>
                  <field-read label="Cuota Anual" [value]="fmtCurrency(e.cuotaAnual())" [highlight]="true"></field-read>
                </div>
              </div>
            }

            <!-- Gestión -->
            @if (financingTab() === 'gestion') {
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <field-edit label="Reparto Inversor %" [value]="e.financing2().rentabilidadInversor" suffix="%" (valueChange)="updateFinancing2('rentabilidadInversor', $event)"></field-edit>
                  <field-edit label="Capital Inversor" [value]="e.financing2().capitalInversor" suffix="€" (valueChange)="updateFinancing2('capitalInversor', $event)"></field-edit>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropioGestion())" [highlight]="true"></field-read>
                </div>
              </div>
            }

            <!-- Interés Fijo/Variable -->
            @if (financingTab() === 'interes') {
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <field-edit label="Interés Anual %" [value]="e.financing3().interesAnual" suffix="%" (valueChange)="updateFinancing3('interesAnual', $event)"></field-edit>
                  <field-edit label="Capital Inversor" [value]="e.financing3().capitalInversor" suffix="€" (valueChange)="updateFinancing3('capitalInversor', $event)"></field-edit>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <field-read label="Intereses Anuales" [value]="fmtCurrency(e.interesesAnualesOpcion3())" [highlight]="true"></field-read>
                  <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropioOpcion3())" [highlight]="true"></field-read>
                </div>
              </div>
            }
          </div>
        }

        <!-- CRA -->
        @if (calcSection() === 'cra') {
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Estimación Alquiler</h3>
            <div class="grid grid-cols-3 gap-3">
              <field-edit label="Mín" [value]="e.craEstimates().alquilerMensualMin" suffix="€" (valueChange)="updateCra('alquilerMensualMin', $event)"></field-edit>
              <field-edit label="Medio" [value]="e.craEstimates().alquilerMensualMed" suffix="€" (valueChange)="updateCra('alquilerMensualMed', $event)"></field-edit>
              <field-edit label="Máx" [value]="e.craEstimates().alquilerMensualMax" suffix="€" (valueChange)="updateCra('alquilerMensualMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <field-edit label="Ocupación" [value]="e.craEstimates().porcentajeOcupacion * 100" suffix="%" (valueChange)="updateCraPct('porcentajeOcupacion', $event)"></field-edit>
              <field-edit label="Reparaciones" [value]="e.craEstimates().reparacionesAnuales" suffix="€" (valueChange)="updateCra('reparacionesAnuales', $event)"></field-edit>
              <field-edit label="Seg. Impago" [value]="e.craEstimates().seguroImpago" suffix="€" (valueChange)="updateCra('seguroImpago', $event)"></field-edit>
            </div>
          </div>

          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resultados CRA</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
              <field-read label="Gastos Totales" [value]="fmtCurrency(e.craGastosTotales())" [highlight]="true"></field-read>
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craBeneficioBruto().min, e.craBeneficioBruto().med, e.craBeneficioBruto().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio Bruto' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
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
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craBeneficioDespuesFinanciacion().min, e.craBeneficioDespuesFinanciacion().med, e.craBeneficioDespuesFinanciacion().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Después Financiación' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.craROE().min, e.craROE().med, e.craROE().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'ROE' : '' }}</p>
                    <p class="text-sm font-bold" [class]="yieldClass(val)">{{ fmtPct(val) }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- CRV -->
        @if (calcSection() === 'crv') {
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

          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resultados CRV</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
              <div class="grid grid-cols-3 gap-3">
                @for (val of [e.crvBeneficioBruto().min, e.crvBeneficioBruto().med, e.crvBeneficioBruto().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio' : $index === 1 ? 'Medio' : 'Máximo' }}</p>
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

        <!-- COMPARATIVA -->
        @if (calcSection() === 'comparativa') {
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Comparativa CRA vs CRV</h3>
            <div class="bg-sand/40 rounded-[14px] p-4">
              <div class="grid grid-cols-3 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide mb-3">
                <span></span>
                <span class="text-center">CRA</span>
                <span class="text-center">CRV</span>
              </div>

              <div class="grid grid-cols-3 gap-2 items-center mb-2">
                <span class="text-xs text-petrol font-medium">Inversión Total</span>
                <span class="text-xs text-center font-semibold text-petrol col-span-2">{{ fmtCurrency(e.inversionTotal()) }}</span>
              </div>

              <div class="border-t border-warm-border/50 pt-3">
                <p class="text-[10px] text-stone font-medium uppercase tracking-wide mb-2">Rentabilidad Anual</p>
                @for (label of ['Mín', 'Medio', 'Máx']; track label; let i = $index) {
                  <div class="grid grid-cols-3 gap-2 items-center py-1">
                    <span class="text-xs text-petrol">{{ label }}</span>
                    <span class="text-xs text-center font-bold" [class]="yieldClass(i === 0 ? e.comparativa().rentabilidadAnual.cra.min : i === 1 ? e.comparativa().rentabilidadAnual.cra.med : e.comparativa().rentabilidadAnual.cra.max)">{{ fmtPct(i === 0 ? e.comparativa().rentabilidadAnual.cra.min : i === 1 ? e.comparativa().rentabilidadAnual.cra.med : e.comparativa().rentabilidadAnual.cra.max) }}</span>
                    <span class="text-xs text-center font-bold" [class]="yieldClass(i === 0 ? e.comparativa().rentabilidadAnual.crv.min : i === 1 ? e.comparativa().rentabilidadAnual.crv.med : e.comparativa().rentabilidadAnual.crv.max)">{{ fmtPct(i === 0 ? e.comparativa().rentabilidadAnual.crv.min : i === 1 ? e.comparativa().rentabilidadAnual.crv.med : e.comparativa().rentabilidadAnual.crv.max) }}</span>
                  </div>
                }
              </div>

              <div class="border-t border-warm-border/50 pt-3">
                <p class="text-[10px] text-stone font-medium uppercase tracking-wide mb-2">Beneficio después de Financiación</p>
                @for (label of ['Mín', 'Medio', 'Máx']; track label; let i = $index) {
                  <div class="grid grid-cols-3 gap-2 items-center py-1">
                    <span class="text-xs text-petrol">{{ label }}</span>
                    <span class="text-xs text-center font-bold" [class]="(i === 0 ? e.comparativa().beneficiosDespuesFinanciacion.cra.min : i === 1 ? e.comparativa().beneficiosDespuesFinanciacion.cra.med : e.comparativa().beneficiosDespuesFinanciacion.cra.max) > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(i === 0 ? e.comparativa().beneficiosDespuesFinanciacion.cra.min : i === 1 ? e.comparativa().beneficiosDespuesFinanciacion.cra.med : e.comparativa().beneficiosDespuesFinanciacion.cra.max) }}</span>
                    <span class="text-xs text-center font-bold" [class]="(i === 0 ? e.comparativa().beneficiosDespuesFinanciacion.crv.min : i === 1 ? e.comparativa().beneficiosDespuesFinanciacion.crv.med : e.comparativa().beneficiosDespuesFinanciacion.crv.max) > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(i === 0 ? e.comparativa().beneficiosDespuesFinanciacion.crv.min : i === 1 ? e.comparativa().beneficiosDespuesFinanciacion.crv.med : e.comparativa().beneficiosDespuesFinanciacion.crv.max) }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resumen Global</h3>
            <div class="grid grid-cols-2 gap-3">
              <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
              <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropio())" [highlight]="true"></field-read>
              <field-read label="Cuota Mensual" [value]="fmtCurrency(e.cuotaMensual())" [highlight]="true"></field-read>
              <field-read label="Cuota Anual" [value]="fmtCurrency(e.cuotaAnual())" [highlight]="true"></field-read>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: []
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

  iconArrowLeft = ArrowLeft;
  iconCalculator = Calculator;
  iconTrendingUp = TrendingUp;
  iconHome = Home;
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
      analisis: 'text-amber-600', visita: 'text-blue-600', oferta: 'text-purple-600', arras: 'text-orange-600', alquilado: 'text-emerald-600'
    };
    return colors[estado || ''] || 'text-stone';
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
      // Gastos compra
      { label: 'Precio de Compra', amount: this.e.precioCompra(), totalBase: inv, isTotal: false },
      { label: 'Notaría/Registro', amount: c.notarioRegistro, totalBase: tg, isTotal: false },
      { label: 'IVA/ITP', amount: this.e.itp(), totalBase: tg, isTotal: false },
      { label: 'Comisión Compra', amount: c.comisionCompra, totalBase: tg, isTotal: false },
      { label: 'Gastos Financiación', amount: c.gastosFinanciacion, totalBase: tg, isTotal: false },
      { label: 'Equipo Captación', amount: c.equipoInternoCaptacion, totalBase: tg, isTotal: false },
      { label: 'Otros Gastos', amount: c.otrosGastosCompra, totalBase: tg, isTotal: false },
      { label: 'Total Gastos Compra', amount: tg, totalBase: tg, isTotal: true },
      // Toma posesión y obras
      { label: 'Mobiliario', amount: c.mobiliario, totalBase: inv, isTotal: false },
      { label: 'Coste Reforma', amount: c.costeReforma, totalBase: inv, isTotal: false },
      { label: 'Total Posesión + Obras', amount: c.mobiliario + c.costeReforma, totalBase: inv, isTotal: true },
      // Gastos anuales
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