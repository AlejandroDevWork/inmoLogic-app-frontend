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
  templateUrl: './property-analysis.component.html',
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
    return 'text-petrol';
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
