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
  template: `
    <div class="p-4 lg:p-6 space-y-5 bg-cream min-h-full overflow-y-auto">

      <!-- Back button + Header with Estado badge -->
      <div class="flex items-center gap-3">
        <button (click)="goBack()" class="w-9 h-9 rounded-[12px] bg-white border border-warm-border flex items-center justify-center transition-colors hover:bg-white">
          <lucide-icon [img]="iconArrowLeft" class="text-petrol" [size]="18"></lucide-icon>
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold text-petrol truncate">{{ property()?.direccion || 'Propiedad' }}</h1>
            <span class="shrink-0 px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide"
                  [class]="statusBadgeClass()">{{ statusLabel() }}</span>
          </div>
          <p class="text-xs text-stone">{{ property()?.zona || '' }}</p>
        </div>
      </div>

      <!-- Tab Pills -->
      <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button (click)="activeTab.set('info')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'info' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
          <lucide-icon [img]="iconFileText" [size]="14" class="inline mr-1"></lucide-icon>
          Info
        </button>
        <button (click)="activeTab.set('calculo')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'calculo' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
          <lucide-icon [img]="iconCalculator" [size]="14" class="inline mr-1"></lucide-icon>
          Cálculo
        </button>
        <button (click)="activeTab.set('reforma')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'reforma' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
          <lucide-icon [img]="iconWrench" [size]="14" class="inline mr-1"></lucide-icon>
          Reforma
        </button>
        <button (click)="activeTab.set('financiacion')"
                class="px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200"
                [class]="activeTab() === 'financiacion' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
          <lucide-icon [img]="iconLandmark" [size]="14" class="inline mr-1"></lucide-icon>
          Financiación
        </button>
      </div>

      <!-- INFO TAB -->
      @if (activeTab() === 'info') {
        <div class="space-y-4">
          <!-- Datos del Inmueble -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4 overflow-visible">
            <h3 class="text-sm font-semibold text-petrol">Datos del Inmueble</h3>
            @if (property()) {
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Dirección</label>
                  <input type="text" [value]="property()!.direccion"
                         (input)="updatePropertyText('direccion', $event)"
                         class="w-full bg-sand/30 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none" />
                </div>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Zona</label>
                  <input type="text" [value]="property()!.zona"
                         (input)="updatePropertyText('zona', $event)"
                         class="w-full bg-sand/30 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none" />
                </div>
                <field-edit label="Código Postal" [value]="0" suffix="" (valueChange)="updatePropertyDataField('codigoPostal', $event)"></field-edit>
                <field-edit label="Superficie (m²)" [value]="property()!.propertyData?.superficie || property()!.metrosCuadrados || 0" suffix="m²" (valueChange)="updateSurface($event)"></field-edit>
                <field-edit label="Habitaciones" [value]="property()!.propertyData?.habitaciones ?? 0" suffix="" (valueChange)="updatePropertyDataField('habitaciones', $event)"></field-edit>
                <field-edit label="Baños" [value]="property()!.propertyData?.banos ?? 0" suffix="" (valueChange)="updatePropertyDataField('banos', $event)"></field-edit>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Ascensor</label>
                  <button (click)="updatePropertyDataBool('ascensor', !property()!.propertyData?.ascensor)"
                          class="w-full rounded-[14px] px-3 py-2 text-sm font-medium transition-colors text-left"
                          [class]="property()!.propertyData?.ascensor ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-50 text-stone border border-stone-200'">
                    {{ property()!.propertyData?.ascensor ? 'Sí' : 'No' }}
                  </button>
                </div>
                <field-edit label="Planta" [value]="0" suffix="" (valueChange)="updatePropertyDataNum('planta', $event)"></field-edit>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Orientación</label>
                  <div class="relative z-50" (click)="toggleDropdown('orientacion')">
                    <button type="button"
                            class="w-full flex items-center justify-between bg-sand/30 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none cursor-pointer">
                      <span>{{ orientacionLabel() }}</span>
                      <svg class="w-4 h-4 text-stone ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    @if (openDropdown() === 'orientacion') {
                      <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-[14px] border border-warm-border shadow-lg overflow-hidden">
                        @for (opt of orientacionOptions; track opt.value) {
                          <button type="button" (click)="selectOrientacion(opt.value); $event.stopPropagation()"
                                  class="w-full px-3 py-2 text-sm text-left hover:bg-earth/10 transition-colors"
                                  [class]="property()!.propertyData?.orientacion === opt.value ? 'bg-earth/10 text-earth font-medium' : 'text-petrol'">
                            {{ opt.label }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
                <field-edit label="Año Construcción" [value]="property()!.propertyData?.anoConstruccion ?? 0" suffix="" (valueChange)="updatePropertyDataField('anoConstruccion', $event)"></field-edit>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Terraza/Balcón</label>
                  <button (click)="updatePropertyDataBool('terrazaBalcon', !property()!.propertyData?.terrazaBalcon)"
                          class="w-full rounded-[14px] px-3 py-2 text-sm font-medium transition-colors text-left"
                          [class]="property()!.propertyData?.terrazaBalcon ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-50 text-stone border border-stone-200'">
                    {{ property()!.propertyData?.terrazaBalcon ? 'Sí' : 'No' }}
                  </button>
                </div>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Parking/Trastero</label>
                  <button (click)="updatePropertyDataBool('parkingTrastero', !property()!.propertyData?.parkingTrastero)"
                          class="w-full rounded-[14px] px-3 py-2 text-sm font-medium transition-colors text-left"
                          [class]="property()!.propertyData?.parkingTrastero ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-50 text-stone border border-stone-200'">
                    {{ property()!.propertyData?.parkingTrastero ? 'Sí' : 'No' }}
                  </button>
                </div>
              </div>
            } @else {
              <p class="text-sm text-stone">Propiedad no encontrada</p>
            }
          </div>

          <!-- Datos del Anuncio -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4 overflow-visible">
            <h3 class="text-sm font-semibold text-petrol">Datos del Anuncio</h3>
            @if (property()) {
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-edit label="Precio del Anuncio" [value]="property()!.precioPedido" suffix="€" (valueChange)="updatePrecioPedido($event)"></field-edit>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Portal</label>
                  <div class="relative" (click)="toggleDropdown('portal')">
                    <button type="button"
                            class="w-full flex items-center justify-between bg-sand/30 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none cursor-pointer">
                      <span>{{ portalDropdownLabel() }}</span>
                      <svg class="w-4 h-4 text-stone ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    @if (openDropdown() === 'portal') {
                      <div class="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-[14px] border border-warm-border shadow-lg overflow-hidden">
                        @for (opt of portalOptions; track opt.value) {
                          <button type="button" (click)="selectPortal(opt.value); $event.stopPropagation()"
                                  class="w-full px-3 py-2 text-sm text-left hover:bg-earth/10 transition-colors"
                                  [class]="property()!.adData?.portal === opt.value ? 'bg-earth/10 text-earth font-medium' : 'text-petrol'">
                            {{ opt.label }}
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Enlace</label>
                  <input type="text" [value]="property()!.adData?.enlace || ''"
                         (input)="updateAdDataStrField('enlace', $event)"
                         class="w-full bg-sand/30 rounded-[14px] px-3 py-2 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none" />
                </div>
                <div>
                  <label class="block text-[10px] text-stone font-medium uppercase tracking-wide mb-1">Precio Rebajado</label>
                  <button (click)="updateAdDataBool('precioRebajado', !property()!.adData?.precioRebajado)"
                          class="w-full rounded-[14px] px-3 py-2 text-sm font-medium transition-colors text-left"
                          [class]="property()!.adData?.precioRebajado ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-50 text-stone border border-stone-200'">
                    {{ property()!.adData?.precioRebajado ? 'Sí' : 'No' }}
                  </button>
                </div>
                <field-edit label="Tiempo Publicado (días)" [value]="property()!.adData?.tiempoPublicado ?? 0" suffix="días" (valueChange)="updateAdDataField('tiempoPublicado', $event)"></field-edit>
              </div>
            }
          </div>

          <!-- Precio Máximo de Compra -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-petrol">Precio Máximo de Compra</h3>
              <div class="flex items-center gap-2">
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Objetivo</label>
                <input type="number" [value]="targetYieldPct()"
                       (input)="updateTargetYield($event)"
                       class="w-14 bg-sand/30 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-center"
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
        <!-- Section Tabs -->
        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          @for (tab of calcTabs; track tab.key) {
            <button (click)="calcSection.set(tab.key)"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                    [class]="calcSection() === tab.key ? 'bg-earth text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- INVERSIÓN -->
        @if (calcSection() === 'inversion') {
          <!-- Precio de Compra -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Precio de Compra</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <field-edit label="Precio Inmueble" [value]="e.costs().precioInmueble" suffix="€" (valueChange)="updateCosts('precioInmueble', $event)"></field-edit>
              <div class="flex flex-col gap-1">
                <field-edit label="Descuento" [value]="e.costs().descuento" suffix="%" (valueChange)="updateCosts('descuento', $event)"></field-edit>
                <span class="text-[10px] text-stone text-right">{{ fmtCurrency(e.descuento()) }}</span>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <field-read label="Precio de Compra" [value]="fmtCurrency(e.precioCompra())" [highlight]="true"></field-read>
              <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
            </div>
          </div>

          <!-- Gastos del Inmueble -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Gastos del Inmueble</h3>

            <!-- Gastos Compra inputs -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-edit label="Mobiliario" [value]="e.costs().mobiliario" suffix="€" (valueChange)="updateCosts('mobiliario', $event)"></field-edit>
                <field-edit label="Coste Reforma" [value]="e.costs().costeReforma" suffix="€" (valueChange)="updateCosts('costeReforma', $event)"></field-edit>
              </div>
            </div>

            <!-- Gastos Anuales -->
            <div class="pt-3 border-t border-warm-border/50">
              <h4 class="text-xs font-semibold text-petrol mb-2">Gastos Anuales</h4>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-edit label="IBI + Tasas" [value]="e.costs().ibi" suffix="€/año" (valueChange)="updateCosts('ibi', $event)"></field-edit>
                <field-edit label="Seguro" [value]="e.costs().seguro" suffix="€/año" (valueChange)="updateCosts('seguro', $event)"></field-edit>
                <field-edit label="Seguro Impago" [value]="e.costs().seguroImpago" suffix="€/año" (valueChange)="updateCosts('seguroImpago', $event)"></field-edit>
                <field-edit label="Comunidad" [value]="e.costs().comunidad" suffix="€/año" (valueChange)="updateCosts('comunidad', $event)"></field-edit>
              </div>
            </div>

            <!-- Summary table -->
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
        }

        <!-- CRA -->
        @if (calcSection() === 'cra') {
          <!-- Key Metrics -->
          <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Neta</p>
              <p class="text-base font-bold" [class]="yieldClass(e.craRentabilidadNeta().med)">{{ fmtPct(e.craRentabilidadNeta().med) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Neto</p>
              <p class="text-base font-bold" [class]="e.craBeneficioBruto().med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.craBeneficioBruto().med) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">ROE</p>
              <p class="text-base font-bold" [class]="yieldClass(e.craROE().med)">{{ fmtPct(e.craROE().med) }}</p>
            </div>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Estimación Alquiler</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Mín" [value]="e.craEstimates().alquilerMensualMin" suffix="€" (valueChange)="updateCra('alquilerMensualMin', $event)"></field-edit>
              <field-edit label="Medio" [value]="e.craEstimates().alquilerMensualMed" suffix="€" (valueChange)="updateCra('alquilerMensualMed', $event)"></field-edit>
              <field-edit label="Máx" [value]="e.craEstimates().alquilerMensualMax" suffix="€" (valueChange)="updateCra('alquilerMensualMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Ocupación" [value]="e.craEstimates().porcentajeOcupacion * 100" suffix="%" (valueChange)="updateCraPct('porcentajeOcupacion', $event)"></field-edit>
              <field-edit label="Reparaciones" [value]="e.craEstimates().reparacionesAnuales" suffix="€" (valueChange)="updateCra('reparacionesAnuales', $event)"></field-edit>
              <field-edit label="Seg. Impago" [value]="e.craEstimates().seguroImpago" suffix="€" (valueChange)="updateCra('seguroImpago', $event)"></field-edit>
            </div>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Rentabilidad Alquiler</h3>
            <div class="bg-sand/40 rounded-[14px] p-4">
              <!-- Column headers -->
              <div class="grid grid-cols-4 gap-2 text-[10px] text-stone font-medium uppercase tracking-wide mb-2">
                <span></span>
                <span class="text-center">Mín</span>
                <span class="text-center">Medio</span>
                <span class="text-center">Máx</span>
              </div>

              <!-- Rent. Bruta Tradicional -->
              <div class="grid grid-cols-4 gap-2 items-center py-1.5 border-b border-warm-border/50">
                <span class="text-xs text-petrol font-medium">Rent. Bruta Tradicional</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBrutaTradicional().min)">{{ fmtPct(e.craRentabilidadBrutaTradicional().min) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBrutaTradicional().med)">{{ fmtPct(e.craRentabilidadBrutaTradicional().med) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBrutaTradicional().max)">{{ fmtPct(e.craRentabilidadBrutaTradicional().max) }}</span>
              </div>

              <!-- Rent. Bruta Real -->
              <div class="grid grid-cols-4 gap-2 items-center py-1.5 border-b border-warm-border/50">
                <span class="text-xs text-petrol font-medium">Rent. Bruta Real</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBruta().min)">{{ fmtPct(e.craRentabilidadBruta().min) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBruta().med)">{{ fmtPct(e.craRentabilidadBruta().med) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadBruta().max)">{{ fmtPct(e.craRentabilidadBruta().max) }}</span>
              </div>

              <!-- Rent. Neta Anual Alquiler -->
              <div class="grid grid-cols-4 gap-2 items-center py-1.5 border-b border-warm-border/50">
                <span class="text-xs text-petrol font-medium">Rent. Neta Anual</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadNeta().min)">{{ fmtPct(e.craRentabilidadNeta().min) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadNeta().med)">{{ fmtPct(e.craRentabilidadNeta().med) }}</span>
                <span class="text-xs text-center font-bold" [class]="yieldClass(e.craRentabilidadNeta().max)">{{ fmtPct(e.craRentabilidadNeta().max) }}</span>
              </div>

              <!-- Rent. Mínima Exigida -->
              <div class="grid grid-cols-4 gap-2 items-center py-1.5 border-b border-warm-border/50">
                <span class="text-xs text-petrol font-medium">Rent. Mínima Exigida</span>
                <span class="text-xs text-center font-bold text-earth col-span-3">{{ fmtPct(e.targetYield()) }}</span>
              </div>

              <!-- Precio Máximo a Pasar Oferta -->
              <div class="grid grid-cols-4 gap-2 items-center py-1.5">
                <span class="text-xs text-petrol font-semibold">Precio Máx. Oferta</span>
                <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().min)">{{ fmtPrice(e.craPrecioMaximoCompra().min) }}</span>
                <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().med)">{{ fmtPrice(e.craPrecioMaximoCompra().med) }}</span>
                <span class="text-xs text-center font-bold" [class]="priceClass(e.craPrecioMaximoCompra().max)">{{ fmtPrice(e.craPrecioMaximoCompra().max) }}</span>
              </div>
            </div>
          </div>

          <!-- Resultados detalle -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Detalle CRA</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
              <field-read label="Gastos Totales" [value]="fmtCurrency(e.craGastosTotales())" [highlight]="true"></field-read>
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
                @for (val of [e.craBeneficioBruto().min, e.craBeneficioBruto().med, e.craBeneficioBruto().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio Bruto' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
                @for (val of [e.craBeneficioDespuesFinanciacion().min, e.craBeneficioDespuesFinanciacion().med, e.craBeneficioDespuesFinanciacion().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Después Financiación' : '' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
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
          <!-- Key Metrics -->
          <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Bruto</p>
              <p class="text-base font-bold" [class]="e.crvBeneficioBruto().med > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.crvBeneficioBruto().med) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rentabilidad</p>
              <p class="text-base font-bold" [class]="yieldClass(e.crvRentabilidad().med)">{{ fmtPct(e.crvRentabilidad().med) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Estimación Venta</p>
              <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.crvEstimates().estimacionVentaMed) }}</p>
            </div>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Estimación Venta</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Venta Mín" [value]="e.crvEstimates().estimacionVentaMin" suffix="€" (valueChange)="updateCrv('estimacionVentaMin', $event)"></field-edit>
              <field-edit label="Venta Med" [value]="e.crvEstimates().estimacionVentaMed" suffix="€" (valueChange)="updateCrv('estimacionVentaMed', $event)"></field-edit>
              <field-edit label="Venta Máx" [value]="e.crvEstimates().estimacionVentaMax" suffix="€" (valueChange)="updateCrv('estimacionVentaMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Comisión Mín" [value]="e.crvEstimates().comisionVentaMin" suffix="€" (valueChange)="updateCrv('comisionVentaMin', $event)"></field-edit>
              <field-edit label="Comisión Med" [value]="e.crvEstimates().comisionVentaMed" suffix="€" (valueChange)="updateCrv('comisionVentaMed', $event)"></field-edit>
              <field-edit label="Comisión Máx" [value]="e.crvEstimates().comisionVentaMax" suffix="€" (valueChange)="updateCrv('comisionVentaMax', $event)"></field-edit>
            </div>
            <field-edit label="Otros Gastos Venta" [value]="e.crvEstimates().otrosGastosVenta" suffix="€" (valueChange)="updateCrv('otrosGastosVenta', $event)"></field-edit>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resultados CRV</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
                @for (val of [e.crvBeneficioBruto().min, e.crvBeneficioBruto().med, e.crvBeneficioBruto().max]; track $index) {
                  <div class="bg-white/80 rounded-[12px] px-3 py-2 text-center">
                    <p class="text-[9px] text-stone font-medium uppercase tracking-wide">{{ $index === 0 ? 'Beneficio' : $index === 1 ? 'Medio' : 'Máximo' }}</p>
                    <p class="text-sm font-bold" [class]="val > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(val) }}</p>
                  </div>
                }
              </div>
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
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

        <!-- ALQUILER CORTA DURACIÓN -->
        @if (calcSection() === 'corto-plazo') {
          <!-- Key Metrics -->
          <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Ingreso Bruto</p>
              <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.srIngresoAnualBrutoMin()) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Neto</p>
              <p class="text-base font-bold" [class]="e.srBeneficioNetoMin() > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.srBeneficioNetoMin()) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rent. Neta</p>
              <p class="text-base font-bold" [class]="yieldClass(e.srRentabilidadNetaMin())">{{ fmtPct(e.srRentabilidadNetaMin()) }}</p>
            </div>
          </div>

          <!-- Temporada Alta -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Temporada Alta</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaAltaMin" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMin', $event)"></field-edit>
              <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaAltaMed" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMed', $event)"></field-edit>
              <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaAltaMax" suffix="€" (valueChange)="updateShortRental('precioDiaAltaMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosAlta" suffix="días" (valueChange)="updateShortRental('diasOcupadosAlta', $event)"></field-edit>
              <field-edit label="Meses" [value]="e.shortRental().mesesAlta" suffix="meses" (valueChange)="updateShortRental('mesesAlta', $event)"></field-edit>
              <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoAltaMin()) + ' – ' + fmtCurrency(e.srIngresoAltaMax())"></field-read>
            </div>
          </div>

          <!-- Temporada Media -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Temporada Media</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaMediaMin" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMin', $event)"></field-edit>
              <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaMediaMed" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMed', $event)"></field-edit>
              <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaMediaMax" suffix="€" (valueChange)="updateShortRental('precioDiaMediaMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosMedia" suffix="días" (valueChange)="updateShortRental('diasOcupadosMedia', $event)"></field-edit>
              <field-edit label="Meses" [value]="e.shortRental().mesesMedia" suffix="meses" (valueChange)="updateShortRental('mesesMedia', $event)"></field-edit>
              <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoMediaMin()) + ' – ' + fmtCurrency(e.srIngresoMediaMax())"></field-read>
            </div>
          </div>

          <!-- Temporada Baja -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Temporada Baja</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Precio/día Mín" [value]="e.shortRental().precioDiaBajaMin" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMin', $event)"></field-edit>
              <field-edit label="Precio/día Med" [value]="e.shortRental().precioDiaBajaMed" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMed', $event)"></field-edit>
              <field-edit label="Precio/día Máx" [value]="e.shortRental().precioDiaBajaMax" suffix="€" (valueChange)="updateShortRental('precioDiaBajaMax', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Días Ocupados" [value]="e.shortRental().diasOcupadosBaja" suffix="días" (valueChange)="updateShortRental('diasOcupadosBaja', $event)"></field-edit>
              <field-edit label="Meses" [value]="e.shortRental().mesesBaja" suffix="meses" (valueChange)="updateShortRental('mesesBaja', $event)"></field-edit>
              <field-read label="Ingreso Total" [value]="fmtCurrency(e.srIngresoBajaMin()) + ' – ' + fmtCurrency(e.srIngresoBajaMax())"></field-read>
            </div>
          </div>

          <!-- Gastos Corto Plazo -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Gastos</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <field-edit label="Reparaciones/año" [value]="e.shortRental().reparacionesAnuales" suffix="€" (valueChange)="updateShortRental('reparacionesAnuales', $event)"></field-edit>
              <field-edit label="Otros/año" [value]="e.shortRental().otrosAnual" suffix="€" (valueChange)="updateShortRental('otrosAnual', $event)"></field-edit>
              <field-edit label="Limpieza/estancia" [value]="e.shortRental().limpiezaEstancia" suffix="€" (valueChange)="updateShortRental('limpiezaEstancia', $event)"></field-edit>
              <field-edit label="Suministros/mes" [value]="e.shortRental().suministrosMensuales" suffix="€" (valueChange)="updateShortRental('suministrosMensuales', $event)"></field-edit>
              <field-edit label="Comisión Plataformas" [value]="e.shortRental().comisionPlataformas * 100" suffix="%" (valueChange)="updateShortRentalPct('comisionPlataformas', $event)"></field-edit>
              <field-edit label="Comisión Gestión" [value]="e.shortRental().comisionGestion * 100" suffix="%" (valueChange)="updateShortRentalPct('comisionGestion', $event)"></field-edit>
            </div>
          </div>

          <!-- Resultados Corto Plazo -->
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resultados Alquiler Corto Plazo</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-3">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-read label="Ingreso Bruto Anual" [value]="fmtCurrency(e.srIngresoAnualBrutoMin()) + ' – ' + fmtCurrency(e.srIngresoAnualBrutoMax())" [highlight]="true"></field-read>
                <field-read label="Gastos Totales" [value]="fmtCurrency(e.srGastosAnuales())" [highlight]="true"></field-read>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-read label="Beneficio Neto" [value]="fmtCurrency(e.srBeneficioNetoMin()) + ' – ' + fmtCurrency(e.srBeneficioNetoMax())"
                           [highlight]="true" [highlightClass]="e.srBeneficioNetoMin() > 0 ? 'text-emerald-700' : 'text-red-600'"></field-read>
                <field-read label="Rent. Neta" [value]="fmtPct(e.srRentabilidadNetaMin()) + ' – ' + fmtPct(e.srRentabilidadNetaMax())"
                           [highlight]="true" [highlightClass]="yieldClass(e.srRentabilidadNetaMin())"></field-read>
              </div>
            </div>
          </div>
        }

        <!-- ALQUILER POR ESPACIOS -->
        @if (calcSection() === 'espacios') {
          <!-- Key Metrics -->
          <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Ingreso Mensual</p>
              <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.spIngresoMensual()) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Beneficio Anual</p>
              <p class="text-base font-bold" [class]="e.spBeneficioAnual() > 0 ? 'text-emerald-700' : 'text-red-600'">{{ fmtCurrency(e.spBeneficioAnual()) }}</p>
            </div>
            <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
              <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Rentabilidad</p>
              <p class="text-base font-bold" [class]="yieldClass(e.spRentabilidad())">{{ fmtPct(e.spRentabilidad()) }}</p>
            </div>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Alquiler por Espacios</h3>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Precio Espacio Mín" [value]="e.spacesRental().precioEspacio1Min" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Min', $event)"></field-edit>
              <field-edit label="Precio Espacio Med" [value]="e.spacesRental().precioEspacio1Med" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Med', $event)"></field-edit>
              <field-edit label="Precio Espacio Máx" [value]="e.spacesRental().precioEspacio1Max" suffix="€" (valueChange)="updateSpacesRental('precioEspacio1Max', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
              <field-edit label="Nº Espacios" [value]="e.spacesRental().numEspacios1" suffix="" (valueChange)="updateSpacesRental('numEspacios1', $event)"></field-edit>
              <field-edit label="Ocupación" [value]="e.spacesRental().porcentajeOcupacion" suffix="%" (valueChange)="updateSpacesRental('porcentajeOcupacion', $event)"></field-edit>
              <field-edit label="Inversión Ade." [value]="e.spacesRental().inversionAdecuacion" suffix="€" (valueChange)="updateSpacesRental('inversionAdecuacion', $event)"></field-edit>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <field-edit label="Reparaciones/año" [value]="e.spacesRental().reparacionesAnuales" suffix="€" (valueChange)="updateSpacesRental('reparacionesAnuales', $event)"></field-edit>
              <field-edit label="Gestión" [value]="e.spacesRental().gestionPorcentaje" suffix="%" (valueChange)="updateSpacesRental('gestionPorcentaje', $event)"></field-edit>
              <field-edit label="Otros/año" [value]="e.spacesRental().otrosAnual" suffix="€" (valueChange)="updateSpacesRental('otrosAnual', $event)"></field-edit>
              <field-edit label="Suministros/mes" [value]="e.spacesRental().suministrosMensuales" suffix="€" (valueChange)="updateSpacesRental('suministrosMensuales', $event)"></field-edit>
            </div>
          </div>

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resultados Alquiler por Espacios</h3>
            <div class="bg-sand/40 rounded-[14px] p-4 space-y-2">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-read label="Ingreso Mensual" [value]="fmtCurrency(e.spIngresoMensual())" [highlight]="true"></field-read>
                <field-read label="Ingreso Anual" [value]="fmtCurrency(e.spIngresoAnual())" [highlight]="true"></field-read>
                <field-read label="Beneficio Anual" [value]="fmtCurrency(e.spBeneficioAnual())"
                           [highlight]="true" [highlightClass]="e.spBeneficioAnual() > 0 ? 'text-emerald-700' : 'text-red-600'"></field-read>
                <field-read label="Rentabilidad" [value]="fmtPct(e.spRentabilidad())"
                           [highlight]="true" [highlightClass]="yieldClass(e.spRentabilidad())"></field-read>
              </div>
            </div>
          </div>
        }

        <!-- COMPARATIVA -->
        @if (calcSection() === 'comparativa') {
          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
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

          <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
            <h3 class="text-sm font-semibold text-petrol">Resumen Global</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <field-read label="Inversión Total" [value]="fmtCurrency(e.inversionTotal())" [highlight]="true"></field-read>
              <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropio())" [highlight]="true"></field-read>
              <field-read label="Cuota Mensual" [value]="fmtCurrency(e.cuotaMensual())" [highlight]="true"></field-read>
              <field-read label="Cuota Anual" [value]="fmtCurrency(e.cuotaAnual())" [highlight]="true"></field-read>
            </div>
          </div>
        }
      }

      <!-- REFORMA TAB -->
      @if (activeTab() === 'reforma') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Presupuesto Reforma</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.reformaTotal()) }}</p>
          </div>
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Inversión Total</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.inversionTotal()) }}</p>
          </div>
        </div>

        <!-- Reform Tiers -->
        <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Estimación por Nivel</h3>
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
                   class="w-full bg-sand/30 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
                   step="1" min="0" />
            <span class="text-xs text-right font-medium text-petrol">{{ fmtCurrency(e.reformaLow()) }}</span>
          </div>
          <!-- Media tier -->
          <div class="grid grid-cols-3 gap-2 items-center py-1.5">
            <span class="text-xs text-petrol font-medium">Media</span>
            <input type="number" [value]="e.reformaTiers().mediaM2"
                   (input)="updateReformaTier('mediaM2', $event)"
                   class="w-full bg-sand/30 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
                   step="1" min="0" />
            <span class="text-xs text-right font-medium text-petrol">{{ fmtCurrency(e.reformaMedia()) }}</span>
          </div>
          <!-- Lujo tier -->
          <div class="grid grid-cols-3 gap-2 items-center py-1.5">
            <span class="text-xs text-petrol font-medium">Lujo</span>
            <input type="number" [value]="e.reformaTiers().lujoM2"
                   (input)="updateReformaTier('lujoM2', $event)"
                   class="w-full bg-sand/30 rounded-[10px] px-2 py-1 text-xs text-petrol border border-warm-border focus:border-earth focus:outline-none text-right"
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

        <!-- Partidas Reforma -->
        <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-3">
          <h3 class="text-sm font-semibold text-petrol">Partidas de Reforma</h3>
          @for (item of reformItems; track item.key) {
            <div class="flex items-center justify-between py-1.5 border-b border-warm-border/50 last:border-b-0">
              <span class="text-sm text-petrol">{{ item.label }}</span>
              <div class="w-28">
                <input type="number" [value]="getReformaValue(item.key)"
                       (input)="updateReforma(item.key, $event)"
                       class="w-full text-right bg-sand/30 rounded-[10px] px-2 py-1 text-sm text-petrol border border-warm-border focus:border-earth focus:outline-none" />
              </div>
            </div>
          }
          <div class="flex items-center justify-between pt-2 border-t-2 border-petrol/20">
            <span class="text-sm font-bold text-petrol">Total Reforma</span>
            <span class="text-sm font-bold text-petrol">{{ fmtCurrency(e.reformaTotal()) }}</span>
          </div>
        </div>

      }

      <!-- FINANCIACIÓN TAB -->
      @if (activeTab() === 'financiacion') {
        <!-- Key Metrics -->
        <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Inversión Total</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.inversionTotal()) }}</p>
          </div>
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Capital Propio</p>
            <p class="text-base font-bold text-petrol">{{ fmtCurrency(e.capitalPropio()) }}</p>
          </div>
          <div class="bg-white rounded-[20px] border border-warm-border shadow-sm p-3 text-center">
            <p class="text-[10px] text-stone font-medium uppercase tracking-wide">Cuota/mes</p>
            <p class="text-base font-bold" [class]="e.cuotaMensual() > 0 ? 'text-petrol' : 'text-stone'">{{ fmtCurrency(e.cuotaMensual()) }}</p>
          </div>
        </div>

        <!-- Financiación -->
        <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Financiación</h3>
          <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button (click)="financingTab.set('hipoteca')"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                    [class]="financingTab() === 'hipoteca' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
              Hipoteca
            </button>
            <button (click)="financingTab.set('gestion')"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                    [class]="financingTab() === 'gestion' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
              Gestión
            </button>
            <button (click)="financingTab.set('interes')"
                    class="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200"
                    [class]="financingTab() === 'interes' ? 'bg-petrol text-white shadow-sm' : 'bg-white text-stone border border-warm-border'">
              Interés Fijo/Variable
            </button>
          </div>

          <!-- Hipoteca -->
          @if (financingTab() === 'hipoteca') {
            <div class="space-y-3">
              <div class="grid grid-cols-3 lg:grid-cols-4 gap-3">
                <field-edit label="Interés %" [value]="e.financing1().interesAnual" suffix="%" (valueChange)="updateFinancing1('interesAnual', $event)"></field-edit>
                <field-edit label="Años" [value]="e.financing1().anosAmortizacion" suffix="" (valueChange)="updateFinancing1('anosAmortizacion', $event)"></field-edit>
                <field-edit label="% Financiado" [value]="e.financing1().porcentajeFinanciado" suffix="%" (valueChange)="updateFinancing1('porcentajeFinanciado', $event)"></field-edit>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-edit label="Reparto Inversor %" [value]="e.financing2().rentabilidadInversor" suffix="%" (valueChange)="updateFinancing2('rentabilidadInversor', $event)"></field-edit>
                <field-edit label="Capital Inversor" [value]="e.financing2().capitalInversor" suffix="€" (valueChange)="updateFinancing2('capitalInversor', $event)"></field-edit>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropioGestion())" [highlight]="true"></field-read>
              </div>
            </div>
          }

          <!-- Interés Fijo/Variable -->
          @if (financingTab() === 'interes') {
            <div class="space-y-3">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-edit label="Interés Anual %" [value]="e.financing3().interesAnual" suffix="%" (valueChange)="updateFinancing3('interesAnual', $event)"></field-edit>
                <field-edit label="Capital Inversor" [value]="e.financing3().capitalInversor" suffix="€" (valueChange)="updateFinancing3('capitalInversor', $event)"></field-edit>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <field-read label="Intereses Anuales" [value]="fmtCurrency(e.interesesAnualesOpcion3())" [highlight]="true"></field-read>
                <field-read label="Capital Propio" [value]="fmtCurrency(e.capitalPropioOpcion3())" [highlight]="true"></field-read>
              </div>
            </div>
          }
        </div>

        <!-- Bonificación Hipoteca -->
        <div class="bg-white rounded-[24px] border border-warm-border shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-semibold text-petrol">Bonificación Hipoteca</h3>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <field-edit label="Seguro Vida" [value]="e.mortgageBonus().seguroVida" suffix="€" (valueChange)="updateMortgageBonus('seguroVida', $event)"></field-edit>
            <field-edit label="Seguro Hogar" [value]="e.mortgageBonus().seguroHogar" suffix="€" (valueChange)="updateMortgageBonus('seguroHogar', $event)"></field-edit>
            <field-edit label="Nómina" [value]="e.mortgageBonus().nomina" suffix="€" (valueChange)="updateMortgageBonus('nomina', $event)"></field-edit>
            <field-edit label="Tarjeta Crédito" [value]="e.mortgageBonus().tarjetaCredito" suffix="€" (valueChange)="updateMortgageBonus('tarjetaCredito', $event)"></field-edit>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      analisis: 'text-amber-600', visita: 'text-blue-600', oferta: 'text-purple-600', arras: 'text-orange-600', alquilado: 'text-emerald-600'
    };
    return colors[estado || ''] || 'text-stone';
  });

  statusBadgeClass = computed(() => {
    const estado = this.property()?.estado;
    const base = 'px-2 py-0.5 rounded-[10px] text-[10px] font-semibold uppercase tracking-wide';
    const colors: Record<string, string> = {
      analisis: `${base} bg-amber-100 text-amber-700`,
      visita: `${base} bg-blue-100 text-blue-700`,
      oferta: `${base} bg-purple-100 text-purple-700`,
      arras: `${base} bg-orange-100 text-orange-700`,
      alquilado: `${base} bg-emerald-100 text-emerald-700`,
    };
    return colors[estado || ''] || `${base} bg-stone-100 text-stone`;
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