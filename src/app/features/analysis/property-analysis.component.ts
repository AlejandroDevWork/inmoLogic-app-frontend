import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray
} from '@angular/forms';
import { AppCardComponent } from '../../shared/components/app-card/app-card.component';
import { AppInputComponent } from '../../shared/components/app-input/app-input.component';
import { AppButtonComponent } from '../../shared/components/app-button/app-button.component';
import {
  Financials,
  ChecklistTecnico,
  AnalisisItem,
  AnalisisEstado,
  PropertyEstado
} from '../../core/models/inmo.interface';
import { PropertyService } from '../../core/services/property.service';

// Checklist items por categoría
const CHECKLIST_ITEMS: Record<string, string[]> = {
  estructura: [
    'Cimientos',
    'Muros de carga',
    'Forjados',
    'Cubierta/Tejado',
    'Escaleras'
  ],
  electricidad: [
    'Cuadro eléctrico',
    'Cableado',
    'Tomas de corriente',
    'Iluminación',
    'Portero automático'
  ],
  humedades: [
    'Paredes',
    'Techos',
    'Suelos',
    'Ventanas',
    'Baños'
  ],
  zonaComun: [
    'Portal',
    'Ascensor',
    'Escaleras',
    'Fachada',
    'Cubierta'
  ]
};

@Component({
  selector: 'app-property-analysis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppCardComponent,
    AppInputComponent,
    AppButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Análisis de Inversión</h1>
          <p class="text-sm text-slate-500 mt-1">Calculadora financiera y checklist técnico</p>
        </div>
        <app-button
          label="Guardar Análisis"
          icon="document"
          (clicked)="saveProperty()"
        />
      </div>

      <!-- Métricas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Inversión Total -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-950/10 rounded-lg">
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
            <div class="p-2.5 rounded-lg" [class]="getYieldColor()">
              <svg class="w-5 h-5" [class]="getTextColor()" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Rentabilidad Neta</p>
              <p class="text-xl font-bold" [class]="getTextColor()">{{ netYield().toFixed(2) }}%</p>
            </div>
          </div>
        </app-card>

        <!-- Cashflow Mensual -->
        <app-card padding="md" shadow="sm">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-lg" [class]="getCashflowColor()">
              <svg class="w-5 h-5" [class]="getTextColor()" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Cashflow Mensual</p>
              <p class="text-xl font-bold" [class]="getCashflowColor()">{{ formatCurrency(cashflow()) }}</p>
            </div>
          </div>
        </app-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Formulario Financiero -->
        <app-card title="Datos Financieros" subtitle="Introduce los datos de la inversión" padding="md">
          <form [formGroup]="financialForm" class="space-y-4">
            <!-- Precio de Compra -->
            <app-input
              label="Precio de Compra"
              type="number"
              formControlName="precioCompra"
              helperText="Precio base del inmueble"
            />

            <!-- Impuestos y Tasas -->
            <div class="grid grid-cols-2 gap-4">
              <app-input
                label="ITP (%)"
                type="number"
                formControlName="itp"
                helperText="Impuesto Transmisiones"
              />
              <app-input
                label="Notaría/Gestoría"
                type="number"
                formControlName="notariaGestoria"
              />
            </div>

            <!-- Reforma -->
            <app-input
              label="Presupuesto de Reforma"
              type="number"
              formControlName="reforma"
              helperText="Coste estimado de renovación"
            />

            <!-- Ingresos Estimados -->
            <app-input
              label="Alquiler Mensual Estimado"
              type="number"
              formControlName="alquilerEstimado"
              helperText="Ingreso mensual por alquiler"
            />

            <!-- Gastos Fijos -->
            <div class="pt-4 border-t border-slate-100">
              <h4 class="text-sm font-semibold text-slate-700 mb-3">Gastos Fijos Mensuales</h4>
              <div class="grid grid-cols-3 gap-4">
                <app-input
                  label="Comunidad"
                  type="number"
                  formControlName="comunidad"
                />
                <app-input
                  label="IBI (mensual)"
                  type="number"
                  formControlName="ibi"
                  helperText="IBI anual / 12"
                />
                <app-input
                  label="Seguro Hogar"
                  type="number"
                  formControlName="seguro"
                />
              </div>
            </div>

            <!-- Hipoteca (opcional) -->
            <div class="pt-4 border-t border-slate-100">
              <h4 class="text-sm font-semibold text-slate-700 mb-3">Financiación (opcional)</h4>
              <div formGroupName="hipoteca" class="grid grid-cols-3 gap-4">
                <app-input
                  label="Entrada (%)"
                  type="number"
                  formControlName="porcentajeEntrada"
                />
                <app-input
                  label="Interés (%)"
                  type="number"
                  formControlName="tipoInteres"
                />
                <app-input
                  label="Plazo (años)"
                  type="number"
                  formControlName="plazoAnios"
                />
              </div>
            </div>
          </form>
        </app-card>

        <!-- Checklist Técnico -->
        <app-card title="Checklist Técnico" subtitle="Evalúa el estado del inmueble" padding="none">
          <div class="divide-y divide-slate-100">
            @for (categoria of categorias; track categoria.key) {
              <div class="p-4">
                <h4 class="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                  {{ categoria.nombre }}
                </h4>
                <div class="space-y-3">
                  @for (item of getChecklistItems(categoria.key); track item.id) {
                    <div class="flex items-start gap-3">
                      <span class="text-sm text-slate-600 flex-1">{{ item.nombre }}</span>
                      <div class="flex items-center gap-1">
                        <!-- Radio: Bien -->
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            [name]="item.id"
                            value="bien"
                            (change)="updateChecklistItem(categoria.key, item.id, 'bien')"
                            [checked]="item.estado === 'bien'"
                            class="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span class="text-xs text-green-700 font-medium">Bien</span>
                        </label>
                        <!-- Radio: Mal -->
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            [name]="item.id"
                            value="mal"
                            (change)="updateChecklistItem(categoria.key, item.id, 'mal')"
                            [checked]="item.estado === 'mal'"
                            class="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span class="text-xs text-red-700 font-medium">Mal</span>
                        </label>
                        <!-- Radio: Reparar -->
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            [name]="item.id"
                            value="reparar"
                            (change)="updateChecklistItem(categoria.key, item.id, 'reparar')"
                            [checked]="item.estado === 'reparar'"
                            class="w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <span class="text-xs text-amber-700 font-medium">Reparar</span>
                        </label>
                      </div>
                    </div>
                    <!-- Notas del item -->
                    @if (item.estado === 'mal' || item.estado === 'reparar') {
                      <input
                        type="text"
                        [placeholder]="'Notas para ' + item.nombre"
                        (input)="updateChecklistNotas(categoria.key, item.id, $event)"
                        [value]="item.notas || ''"
                        class="ml-8 mt-1.5 w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
                      />
                    }
                  }
                </div>
              </div>
            }
          </div>
        </app-card>
      </div>

      <!-- Resumen de Métricas Detalladas -->
      <app-card title="Desglose de Métricas" padding="md">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-slate-700">Inversión Detallada</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Precio de compra</span>
                <span class="font-medium text-slate-900">{{ formatCurrency(financialForm.get('precioCompra')?.value || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">ITP ({{ financialForm.get('itp')?.value || 0 }}%)</span>
                <span class="font-medium text-slate-900">{{ formatCurrency(calculateITP()) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Notaría/Gestoría</span>
                <span class="font-medium text-slate-900">{{ formatCurrency(financialForm.get('notariaGestoria')?.value || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Reforma</span>
                <span class="font-medium text-slate-900">{{ formatCurrency(financialForm.get('reforma')?.value || 0) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                <span class="text-slate-900">Total Inversión</span>
                <span class="text-blue-950">{{ formatCurrency(totalInvestment()) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-slate-700">Proyección Anual</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Ingresos por alquiler (12 meses)</span>
                <span class="font-medium text-green-700">+{{ formatCurrency((financialForm.get('alquilerEstimado')?.value || 0) * 12) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">Gastos fijos anuales</span>
                <span class="font-medium text-red-700">-{{ formatCurrency(gastosAnuales()) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-slate-200 font-semibold">
                <span class="text-slate-900">Beneficio Neto Anual</span>
                <span [class]="getBeneficioColor()">{{ formatCurrency(beneficioNetoAnual()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `
})
export class PropertyAnalysisComponent implements OnInit {
  financialForm: FormGroup;
  checklistSignal = signal<ChecklistTecnico>(this.createEmptyChecklist());
  categorias = [
    { key: 'estructura', nombre: 'Estructura' },
    { key: 'electricidad', nombre: 'Electricidad' },
    { key: 'humedades', nombre: 'Humedades' },
    { key: 'zonaComun', nombre: 'Zona Común' }
  ];

  // === SIGNALS COMPUTED PARA MÉTRICAS ===
  readonly totalInvestment = computed(() => {
    const form = this.financialForm.value;
    const precioCompra = form.precioCompra || 0;
    const itp = form.itp || 0;
    const notariaGestoria = form.notariaGestoria || 0;
    const reforma = form.reforma || 0;

    return precioCompra + (precioCompra * (itp / 100)) + notariaGestoria + reforma;
  });

  readonly gastosMensuales = computed(() => {
    const form = this.financialForm.value;
    return (form.comunidad || 0) + (form.ibi || 0) + (form.seguro || 0);
  });

  readonly gastosAnuales = computed(() => {
    return this.gastosMensuales() * 12;
  });

  readonly ingresoAlquilerAnual = computed(() => {
    return (this.financialForm.get('alquilerEstimado')?.value || 0) * 12;
  });

  readonly beneficioNetoAnual = computed(() => {
    return this.ingresoAlquilerAnual() - this.gastosAnuales();
  });

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

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService
  ) {
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

  ngOnInit(): void {
    // Suscribirse a cambios del formulario para recalcular
    this.financialForm.valueChanges.subscribe(() => {
      // Los signals computed se actualizan automáticamente
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
    const items = CHECKLIST_ITEMS[categoria] || [];
    return items.map(nombre => ({
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
    const updatedItems = items.map((item: AnalisisItem) =>
      item.id === itemId ? { ...item, estado } : item
    );

    this.checklistSignal.set({
      ...checklist,
      [categoria]: updatedItems
    });
  }

  updateChecklistNotas(categoria: string, itemId: string, event: Event): void {
    const notas = (event.target as HTMLInputElement).value;
    const checklist = this.checklistSignal();
    const items = checklist[categoria as keyof ChecklistTecnico];
    const updatedItems = items.map((item: AnalisisItem) =>
      item.id === itemId ? { ...item, notas } : item
    );

    this.checklistSignal.set({
      ...checklist,
      [categoria]: updatedItems
    });
  }

  calculateITP(): number {
    const precioCompra = this.financialForm.get('precioCompra')?.value || 0;
    const itpPorcentaje = this.financialForm.get('itp')?.value || 0;
    return precioCompra * (itpPorcentaje / 100);
  }

  getYieldColor(): string {
    const yieldValue = this.netYield();
    if (yieldValue >= 8) return 'bg-green-100';
    if (yieldValue >= 5) return 'bg-amber-100';
    return 'bg-red-100';
  }

  getCashflowColor(): string {
    const cashflowValue = this.cashflow();
    if (cashflowValue > 0) return 'bg-green-100';
    if (cashflowValue > -200) return 'bg-amber-100';
    return 'bg-red-100';
  }

  getBeneficioColor(): string {
    const beneficio = this.beneficioNetoAnual();
    if (beneficio > 0) return 'text-green-700';
    if (beneficio > -5000) return 'text-amber-700';
    return 'text-red-700';
  }

  getTextColor(): string {
    return 'text-slate-900';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  saveProperty(): void {
    if (this.financialForm.invalid) {
      this.financialForm.markAllAsTouched();
      return;
    }

    const formValue = this.financialForm.value;
    const financials: Financials = {
      precioCompra: formValue.precioCompra,
      itp: formValue.itp,
      notariaGestoria: formValue.notariaGestoria,
      reforma: formValue.reforma,
      alquilerEstimado: formValue.alquilerEstimado,
      comunidad: formValue.comunidad,
      ibi: formValue.ibi,
      seguro: formValue.seguro,
      hipoteca: formValue.hipoteca
    };

    // Crear propiedad (en un caso real, se pedirían más datos)
    this.propertyService.addProperty({
      direccion: 'Nueva Propiedad',
      zona: 'Sin asignar',
      precioPedido: formValue.precioCompra,
      estado: 'analisis',
      tags: [],
      checklist: this.checklistSignal(),
      financials
    });

    console.log('Propiedad guardada correctamente');
  }
}
