import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, Building2, Search, Plus, X, Minus } from 'lucide-angular';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PropertyCardComponent,
    AppDropdownComponent,
    LucideAngularModule
  ],
  templateUrl: './properties.page.html',
  styleUrls: ['./properties.page.scss']
})
export class PropertiesPage {
  private propertyService = inject(PropertyService);
  private router = inject(Router);

  readonly properties = this.propertyService.properties;
  readonly agencies = this.propertyService.agencies;
  filtroActual = 'todos';
  searchTerm = '';

  // Add modal
  showAddModal = signal(false);
  newDireccion = '';
  newZona = '';
  newPrecioPedido: number | null = null;
  newCodigoPostal = '';
  newSuperficie: number | null = null;
  newHabitaciones: number | null = null;
  newBanos: number | null = null;
  newPlanta = '';
  newAnoConstruccion: number | null = null;
  newAscensor = signal(false);
  newTerrazaBalcon = signal(false);
  newPortal = signal<string | null>(null);
  newEnlace = '';
  newAgencyId = signal<string | null>(null);
  newContactoReferencia = '';

  portalOptions = ['Idealista', 'Fotocasa', 'Pisos', 'Habitaclia', 'Otros'];
  agenciaNombres = computed(() => this.agencies().map(a => a.nombre));

  iconBuilding2 = Building2;
  iconSearch = Search;
  iconPlus = Plus;
  iconX = X;
  iconMinus = Minus;

  estados = [
    { key: 'todos', nombre: 'Todas' },
    { key: 'analisis', nombre: 'Analizando' },
    { key: 'visita', nombre: 'Visita' },
    { key: 'oferta', nombre: 'En negociación' },
    { key: 'arras', nombre: 'Arras' },
    { key: 'alquilado', nombre: 'Alquilado' }
  ];

  readonly filteredProperties = computed(() => {
    let props = this.properties();
    if (this.filtroActual !== 'todos') {
      props = props.filter(p => p.estado === this.filtroActual);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      props = props.filter(p =>
        p.direccion.toLowerCase().includes(term) ||
        p.zona.toLowerCase().includes(term)
      );
    }
    return props;
  });

  getCountByEstado(estado: string): number {
    if (estado === 'todos') return this.properties().length;
    return this.properties().filter(p => p.estado === estado).length;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onPropertyClick(property: any): void {
    this.router.navigate(['/properties', property.id]);
  }

  adjustField(field: string, delta: number, min: number = 0): void {
    const current = (this as any)[field];
    const val = current != null ? current : 0;
    (this as any)[field] = Math.max(min, val + delta);
  }

  onPortalSelected(nombre: string): void {
    this.newPortal.set(nombre.toLowerCase());
  }

  onAgenciaSelected(nombre: string): void {
    const agency = this.agencies().find(a => a.nombre === nombre);
    this.newAgencyId.set(agency?.id ?? null);
  }

  addProperty(): void {
    if (!this.newDireccion.trim() || !this.newZona.trim() || this.newPrecioPedido == null) return;

    const precio = this.newPrecioPedido;
    const propertyData: any = {};
    if (this.newCodigoPostal.trim()) propertyData.codigoPostal = this.newCodigoPostal.trim();
    if (this.newSuperficie != null) propertyData.superficie = this.newSuperficie;
    if (this.newHabitaciones != null) propertyData.habitaciones = this.newHabitaciones;
    if (this.newBanos != null) propertyData.banos = this.newBanos;
    if (this.newPlanta.trim()) propertyData.planta = this.newPlanta.trim();
    if (this.newAnoConstruccion != null) propertyData.anoConstruccion = this.newAnoConstruccion;
    if (this.newAscensor()) propertyData.ascensor = true;
    if (this.newTerrazaBalcon()) propertyData.terrazaBalcon = true;

    const adData: any = {};
    if (this.newPortal()) adData.portal = this.newPortal() as any;
    if (this.newEnlace.trim()) adData.enlace = this.newEnlace.trim();

    const newProperty = this.propertyService.addProperty({
      direccion: this.newDireccion.trim(),
      zona: this.newZona.trim(),
      precioPedido: precio,
      estado: 'analisis',
      tags: [],
      financials: {
        precioCompra: precio,
        itp: 0,
        notariaGestoria: 0,
        reforma: 0,
        alquilerEstimado: 0,
        comunidad: 0,
        ibi: 0,
        seguro: 0
      },
      checklist: {
        estructura: [],
        electricidad: [],
        humedades: [],
        zonaComun: []
      },
      ...(Object.keys(propertyData).length > 0 ? { propertyData } : {}),
      ...(Object.keys(adData).length > 0 ? { adData } : {}),
      ...(this.newAgencyId() ? { agencyId: this.newAgencyId()! } : {}),
      ...(this.newContactoReferencia.trim() ? { contactoReferencia: this.newContactoReferencia.trim() } : {})
    });

    this.showAddModal.set(false);
    this.resetForm();
    this.router.navigate(['/properties', newProperty.id]);
  }

  private resetForm(): void {
    this.newDireccion = '';
    this.newZona = '';
    this.newPrecioPedido = null;
    this.newCodigoPostal = '';
    this.newSuperficie = null;
    this.newHabitaciones = null;
    this.newBanos = null;
    this.newPlanta = '';
    this.newAnoConstruccion = null;
    this.newAscensor.set(false);
    this.newTerrazaBalcon.set(false);
    this.newPortal.set(null);
    this.newEnlace = '';
    this.newAgencyId.set(null);
    this.newContactoReferencia = '';
  }
}