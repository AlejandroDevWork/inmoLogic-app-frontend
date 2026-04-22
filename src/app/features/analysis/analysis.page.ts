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
  templateUrl: './analysis.page.html',
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
