import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppCardComponent } from '../../shared/components/app-card/app-card.component';
import { AppInputComponent } from '../../shared/components/app-input/app-input.component';
import { AppButtonComponent } from '../../shared/components/app-button/app-button.component';
import { Financials, ChecklistTecnico, AnalisisItem, AnalisisEstado } from '../../core/models/inmo.interface';

const CHECKLIST_ITEMS: Record<string, string[]> = {
  estructura: ['Cimientos', 'Muros de carga', 'Forjados', 'Cubierta/Tejado', 'Escaleras'],
  electricidad: ['Cuadro eléctrico', 'Cableado', 'Tomas de corriente', 'Iluminación', 'Portero automático'],
  humedades: ['Paredes', 'Techos', 'Suelos', 'Ventanas', 'Baños'],
  zonaComun: ['Portal', 'Ascensor', 'Escaleras', 'Fachada', 'Cubierta']
};

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppCardComponent, AppInputComponent, AppButtonComponent],
  template: `
    <div class="bg-slate-50 min-h-full overflow-y-auto p-4">
      <div class="max-w-6xl mx-auto space-y-6 pb-24 lg:pb-6">

        <!-- Header -->
        <div class="flex items-center justify-between pt-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Análisis de Inversión</h1>
            <p class="text-sm text-slate-500 mt-0.5">Calculadora financiera y checklist técnico</p>
          </div>
        </div>

        <!-- Métricas Principales (Sticky en móvil) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Inversión Total -->
          <app-card padding="md" shadow="sm">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-blue-950/10 rounded-xl">
                <svg class="w-5 h-5 text-blue-950" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.312-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.312.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Inversión Total</p>
                <p class="text-xl font-bold text-slate-900">{{ formatCurrency(totalInvestment()) }}</p>
              </div>
            </div>
          </app-card>

          <!-- Rentabilidad Neta -->
          <app-card padding="md" shadow="sm">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl" [class]="getYieldColor()">
                <svg class="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Rentabilidad Neta</p>
                <p class="text-xl font-bold text-slate-900">{{ netYield().toFixed(2) }}%</p>
              </div>
            </div>
          </app-card>

          <!-- Cashflow Mensual -->
          <app-card padding="md" shadow="sm">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl" [class]="getCashflowColor()">
                <svg class="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Cashflow</p>
                <p class="text-xl font-bold" [class]="getCashflowTextColor()">{{ formatCurrency(cashflow()) }}</p>
                <p class="text-xs text-slate-400">/mes</p>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Formulario y Checklist -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

          <!-- Formulario Financiero -->
          <app-card title="Datos Financieros" padding="md">
            <form [formGroup]="financialForm" class="space-y-4">
              <app-input label="Precio de Compra" type="number" formControlName="precioCompra" />

              <div class="grid grid-cols-2 gap-4">
                <app-input label="ITP (%)" type="number" formControlName="itp" />
                <app-input label="Notaría/Gestoría" type="number" formControlName="notariaGestoria" />
              </div>

              <app-input label="Presupuesto de Reforma" type="number" formControlName="reforma" />

              <app-input label="Alquiler Mensual Estimado" type="number" formControlName="alquilerEstimado" />

              <div class="pt-4 border-t border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Gastos Fijos</h4>
                <div class="grid grid-cols-3 gap-4">
                  <app-input label="Comunidad" type="number" formControlName="comunidad" />
                  <app-input label="IBI (mensual)" type="number" formControlName="ibi" />
                  <app-input label="Seguro Hogar" type="number" formControlName="seguro" />
                </div>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <h4 class="text-sm font-semibold text-slate-700 mb-3">Financiación (opcional)</h4>
                <div formGroupName="hipoteca" class="grid grid-cols-3 gap-4">
                  <app-input label="Entrada (%)" type="number" formControlName="porcentajeEntrada" />
                  <app-input label="Interés (%)" type="number" formControlName="tipoInteres" />
                  <app-input label="Plazo (años)" type="number" formControlName="plazoAnios" />
                </div>
              </div>
            </form>
          </app-card>

          <!-- Checklist Técnico -->
          <app-card title="Checklist Técnico" padding="none">
            <div class="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              @for (categoria of categorias; track categoria.key) {
                <div class="p-4">
                  <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{{ categoria.nombre }}</h4>
                  <div class="space-y-3">
                    @for (item of getChecklistItems(categoria.key); track item.id) {
                      <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-700">{{ item.nombre }}</span>
                        <div class="flex items-center gap-2">
                          @for (estado of ['bien', 'mal', 'reparar']; track estado) {
                            <label class="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                [name]="item.id"
                                [value]="estado"
                                (change)="updateChecklistItem(categoria.key, item.id, $any(estado))"
                                [checked]="item.estado === estado"
                                class="w-3.5 h-3.5"
                                [class]="getRadioColor(estado)"
                              />
                              <span class="text-xs capitalize" [class]="getRadioLabelColor(estado)">{{ estado }}</span>
                            </label>
                          }
                        </div>
                      </div>
                      @if (item.estado === 'mal' || item.estado === 'reparar') {
                        <input
                          type="text"
                          [placeholder]="'Notas: ' + item.nombre"
                          (input)="updateChecklistNotas(categoria.key, item.id, $event)"
                          [value]="item.notas || ''"
                          class="ml-8 mt-1.5 w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                        />
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </app-card>
        </div>

        <!-- Botón Guardar -->
        <div class="flex justify-end pt-4">
          <app-button label="Guardar Propiedad" icon="document" variant="primary" size="lg" (clicked)="saveProperty()" />
        </div>

      </div>
    </div>
  `
})
export class AnalysisPage {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);

  financialForm: FormGroup;
  checklistSignal = signal<ChecklistTecnico>(this.createEmptyChecklist());

  categorias = [
    { key: 'estructura', nombre: 'Estructura' },
    { key: 'electricidad', nombre: 'Electricidad' },
    { key: 'humedades', nombre: 'Humedades' },
    { key: 'zonaComun', nombre: 'Zona Común' }
  ];

  readonly totalInvestment = computed(() => {
    const form = this.financialForm.value;
    const precioCompra = form.precioCompra || 0;
    const itp = form.itp || 0;
    return precioCompra + (precioCompra * (itp / 100)) + (form.notariaGestoria || 0) + (form.reforma || 0);
  });

  readonly gastosMensuales = computed(() => {
    const form = this.financialForm.value;
    return (form.comunidad || 0) + (form.ibi || 0) + (form.seguro || 0);
  });

  readonly gastosAnuales = computed(() => this.gastosMensuales() * 12);

  readonly ingresoAlquilerAnual = computed(() => (this.financialForm.get('alquilerEstimado')?.value || 0) * 12);

  readonly beneficioNetoAnual = computed(() => this.ingresoAlquilerAnual() - this.gastosAnuales());

  readonly netYield = computed(() => {
    const totalInv = this.totalInvestment();
    if (totalInv === 0) return 0;
    return (this.beneficioNetoAnual() / totalInv) * 100;
  });

  readonly hipotecaEstimada = computed(() => {
    const form = this.financialForm.value;
    const hipoteca = form.hipoteca;
    const precioCompra = form.precioCompra || 0;
    if (!hipoteca?.tipoInteres || !hipoteca?.plazoAnios) return 0;
    const entradaPorcentaje = hipoteca.porcentajeEntrada || 20;
    const importePrestamo = precioCompra * (1 - entradaPorcentaje / 100);
    const interesMensual = (hipoteca.tipoInteres / 100) / 12;
    const numPagos = hipoteca.plazoAnios * 12;
    if (interesMensual === 0) return importePrestamo / numPagos;
    return importePrestamo * (interesMensual * Math.pow(1 + interesMensual, numPagos)) / (Math.pow(1 + interesMensual, numPagos) - 1);
  });

  readonly cashflow = computed(() => {
    const alquiler = this.financialForm.get('alquilerEstimado')?.value || 0;
    return alquiler - this.gastosMensuales() - (this.hipotecaEstimada() || 0);
  });

  constructor() {
    this.financialForm = this.fb.group({
      precioCompra: [0, [Validators.min(0)]],
      itp: [10, [Validators.min(0), Validators.max(100)]],
      notariaGestoria: [0, [Validators.min(0)]],
      reforma: [0, [Validators.min(0)]],
      alquilerEstimado: [0, [Validators.min(0)]],
      comunidad: [0, [Validators.min(0)]],
      ibi: [0, [Validators.min(0)]],
      seguro: [0, [Validators.min(0)]],
      hipoteca: this.fb.group({
        porcentajeEntrada: [20],
        tipoInteres: [0],
        plazoAnios: [0]
      })
    });
  }

  createEmptyChecklist(): ChecklistTecnico {
    return {
      estructura: this.createChecklistItems('estructura'),
      electricidad: this.createChecklistItems('electricidad'),
      humedades: this.createChecklistItems('humedades'),
      zonaComun: this.createChecklistItems('zonaComun')
    };
  }

  createChecklistItems(categoria: string): AnalisisItem[] {
    return (CHECKLIST_ITEMS[categoria] || []).map(nombre => ({
      id: `${categoria}-${nombre.toLowerCase().replace(/\s+/g, '-')}`,
      nombre,
      estado: 'bien' as AnalisisEstado
    }));
  }

  getChecklistItems(categoria: string): AnalisisItem[] {
    return this.checklistSignal()[categoria as keyof ChecklistTecnico];
  }

  updateChecklistItem(categoria: string, itemId: string, estado: AnalisisEstado): void {
    const checklist = this.checklistSignal();
    const items = checklist[categoria as keyof ChecklistTecnico];
    this.checklistSignal.set({
      ...checklist,
      [categoria]: items.map((item: AnalisisItem) => item.id === itemId ? { ...item, estado } : item)
    });
  }

  updateChecklistNotas(categoria: string, itemId: string, event: Event): void {
    const notas = (event.target as HTMLInputElement).value;
    const checklist = this.checklistSignal();
    const items = checklist[categoria as keyof ChecklistTecnico];
    this.checklistSignal.set({
      ...checklist,
      [categoria]: items.map((item: AnalisisItem) => item.id === itemId ? { ...item, notas } : item)
    });
  }

  getYieldColor(): string {
    const yieldValue = this.netYield();
    return yieldValue >= 8 ? 'bg-green-100' : yieldValue >= 5 ? 'bg-amber-100' : 'bg-red-100';
  }

  getCashflowColor(): string {
    return this.cashflow() > 0 ? 'bg-green-100' : this.cashflow() > -200 ? 'bg-amber-100' : 'bg-red-100';
  }

  getCashflowTextColor(): string {
    return this.cashflow() > 0 ? 'text-green-700' : 'text-red-700';
  }

  getRadioColor(estado: string): string {
    const colors: Record<string, string> = {
      bien: 'text-green-600 focus:ring-green-500',
      mal: 'text-red-600 focus:ring-red-500',
      reparar: 'text-amber-600 focus:ring-amber-500'
    };
    return colors[estado];
  }

  getRadioLabelColor(estado: string): string {
    const colors: Record<string, string> = {
      bien: 'text-green-700',
      mal: 'text-red-700',
      reparar: 'text-amber-700'
    };
    return colors[estado];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount);
  }

  saveProperty(): void {
    if (this.financialForm.invalid) {
      this.financialForm.markAllAsTouched();
      return;
    }
    const formValue = this.financialForm.value;
    this.propertyService.addProperty({
      direccion: 'Nueva Propiedad',
      zona: 'Sin asignar',
      precioPedido: formValue.precioCompra,
      estado: 'analisis',
      tags: [],
      checklist: this.checklistSignal(),
      financials: formValue as Financials
    });
  }
}
