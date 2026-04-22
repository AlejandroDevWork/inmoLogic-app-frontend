import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { AddressAutocompleteComponent } from '../../shared/components/address-autocomplete/address-autocomplete.component';
import { AgencyMapComponent } from '../../shared/components/agency-map/agency-map.component';
import { AppDataTableComponent, TableColumn } from '../../shared/components/app-data-table/app-data-table.component';
import { LucideAngularModule, Building2, Phone, Mail, Star, StickyNote, MapPin, Plus, X, Search, SlidersHorizontal, ChevronDown, ChevronUp, Users } from 'lucide-angular';

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppDropdownComponent,
    AddressAutocompleteComponent,
    AgencyMapComponent,
    AppDataTableComponent,
    LucideAngularModule
  ],
  templateUrl: './agencies.page.html',
  styleUrls: ['./agencies.page.scss']
})
export class AgenciesPage {
  private propertyService = inject(PropertyService);

  readonly agencies = this.propertyService.agencies;

  agenciesConCoords = computed(() =>
    this.agencies().filter(a => a.lat != null && a.lng != null)
  );

  // Map toggle
  showMap = signal(false);
  focusAgencyId = signal<string | null>(null);

  // Search & Filters
  searchTerm = signal('');
  filtroRelacion = signal('todas');
  filtroEstrellas = signal(0);
  filtroOrden = signal('nombre');
  filtroCiudad = signal('todas');
  pageSize = signal(5);
  currentPage = signal(1);

  agencyColumns: TableColumn[] = [
    { label: 'Nombre', align: 'left' },
    { label: 'Tipo', align: 'center' },
    { label: 'Estrellas', align: 'center' },
    { label: 'Dirección', align: 'left' },
    { label: 'Contactos', align: 'center' },
    { label: 'Notas', align: 'left' },
    { label: 'Acciones', align: 'right' }
  ];

  pageSizeOptions = ['5', '10', '15', '20', '25'];
  pageSizeLabel = computed(() => String(this.pageSize()));

  filtroRelacionChips = [
    { key: 'todas', label: 'Todas' },
    { key: 'partner-preferente', label: 'Partner' },
    { key: 'solo-captacion', label: 'Captación' },
    { key: 'ocasional', label: 'Ocasional' },
    { key: 'nueva', label: 'Nueva' },
  ];

  ordenOptions = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'reciente', label: 'Más reciente' },
    { key: 'antiguo', label: 'Más antiguo' },
    { key: 'estrellas', label: 'Más estrellas' },
  ];

  ordenLabels = this.ordenOptions.map(o => o.label);

  ciudadesDisponibles = computed(() => {
    const direcciones = this.agencies().map(a => a.direccion).filter((d): d is string => !!d);
    const ciudades = new Set<string>();
    for (const dir of direcciones) {
      const parts = dir.split(',');
      const ciudad = parts[parts.length - 1]?.trim();
      if (ciudad) ciudades.add(ciudad);
    }
    return Array.from(ciudades).sort();
  });

  hasActiveFilters = computed(() =>
    this.filtroRelacion() !== 'todas' ||
    this.filtroEstrellas() !== 0 ||
    this.filtroOrden() !== 'nombre' ||
    this.filtroCiudad() !== 'todas'
  );

  filteredAgencies = computed(() => {
    let result = this.agencies();

    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(a =>
        a.nombre.toLowerCase().includes(term) ||
        (a.direccion && a.direccion.toLowerCase().includes(term))
      );
    }

    const relacion = this.filtroRelacion();
    if (relacion !== 'todas') {
      result = result.filter(a => a.tipoRelacion === relacion);
    }

    const estrellas = this.filtroEstrellas();
    if (estrellas > 0) {
      result = result.filter(a => a.relacion >= estrellas);
    }

    const ciudad = this.filtroCiudad();
    if (ciudad !== 'todas') {
      result = result.filter(a => {
        if (!a.direccion) return false;
        const parts = a.direccion.split(',');
        const agencyCity = parts[parts.length - 1]?.trim();
        return agencyCity === ciudad;
      });
    }

    const orden = this.filtroOrden();
    if (orden === 'reciente') {
      result = [...result].sort((a, b) => {
        const da = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
        const db = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
        return db - da;
      });
    } else if (orden === 'antiguo') {
      result = [...result].sort((a, b) => {
        const da = a.lastContactDate ? new Date(a.lastContactDate).getTime() : Infinity;
        const db = b.lastContactDate ? new Date(b.lastContactDate).getTime() : Infinity;
        return da - db;
      });
    } else if (orden === 'estrellas') {
      result = [...result].sort((a, b) => b.relacion - a.relacion);
    }

    return result;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAgencies().length / this.pageSize())));

  paginatedAgencies = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAgencies().slice(start, start + this.pageSize());
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      if (start > 2) pages.push(-1); // ellipsis
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push(-1); // ellipsis
      pages.push(total);
    }
    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // Expanded row in desktop table
  expandedAgencyId = signal<string | null>(null);
  toggleAgencyExpand(id: string): void {
    this.expandedAgencyId.update(current => current === id ? null : id);
  }

  // Modal state
  showAddModal = signal(false);
  showFilterModal = signal(false);
  newAgencyName = '';
  newAgencyDireccion = '';
  newAgencyLat = signal<number | undefined>(undefined);
  newAgencyLng = signal<number | undefined>(undefined);
  newAgencyTipo = signal<string | null>(null);
  newAgencyRelacion = signal(3);
  newAgencyNotas = '';

  tipoRelacionOptions = ['Partner preferente', 'Solo captación', 'Ocasional', 'Nueva'];

  iconBuilding2 = Building2;
  iconPhone = Phone;
  iconMail = Mail;
  iconStar = Star;
  iconNote = StickyNote;
  iconMap = MapPin;
  iconPlus = Plus;
  iconX = X;
  iconSearch = Search;
  iconFilter = SlidersHorizontal;
  iconChevronDown = ChevronDown;
  iconChevronUp = ChevronUp;
  iconUsers = Users;

  cleanPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  openMapForAgency(agencyId: string): void {
    this.focusAgencyId.set(null);
    this.showMap.set(true);
    setTimeout(() => this.focusAgencyId.set(agencyId), 50);
  }

  onAddressSelected(result: { address: string; lat: number; lng: number }): void {
    this.newAgencyDireccion = result.address;
    this.newAgencyLat.set(result.lat);
    this.newAgencyLng.set(result.lng);
  }

  getTipoRelacionLabel(tipo: string): string {
    const map: Record<string, string> = {
      'partner-preferente': 'Partner',
      'solo-captacion': 'Captación',
      'ocasional': 'Ocasional',
      'nueva': 'Nueva'
    };
    return map[tipo] || tipo;
  }

  getTipoRelacionClass(tipo: string): string {
    const map: Record<string, string> = {
      'partner-preferente': 'bg-earth-light/25 text-earth-dark',
      'solo-captacion': 'bg-petrol/5 text-petrol',
      'ocasional': 'bg-cream text-stone',
      'nueva': 'bg-amber-50 text-amber-700'
    };
    return map[tipo] || 'bg-cream text-stone';
  }

  getRelacionLabel(key: string): string {
    const chip = this.filtroRelacionChips.find(c => c.key === key);
    return chip?.label ?? key;
  }

  getOrdenLabel(key: string): string {
    const opt = this.ordenOptions.find(o => o.key === key);
    return opt?.label ?? key;
  }

  onOrdenSelected(label: string): void {
    const opt = this.ordenOptions.find(o => o.label === label);
    if (opt) this.filtroOrden.set(opt.key);
  }

  onPageSizeChange(label: string): void {
    const size = parseInt(label, 10);
    if (!isNaN(size)) {
      this.pageSize.set(size);
      this.currentPage.set(1);
    }
  }

  clearFilters(): void {
    this.filtroRelacion.set('todas');
    this.filtroEstrellas.set(0);
    this.filtroOrden.set('nombre');
    this.filtroCiudad.set('todas');
  }

  addAgency(): void {
    if (!this.newAgencyName.trim()) return;

    const tipoMap: Record<string, string> = {
      'Partner preferente': 'partner-preferente',
      'Solo captación': 'solo-captacion',
      'Ocasional': 'ocasional',
      'Nueva': 'nueva'
    };

    this.propertyService.addAgency({
      nombre: this.newAgencyName.trim(),
      direccion: this.newAgencyDireccion.trim() || undefined,
      tipoRelacion: (tipoMap[this.newAgencyTipo() || ''] || 'nueva') as any,
      relacion: this.newAgencyRelacion() as 1 | 2 | 3 | 4 | 5,
      agentes: [],
      notas: this.newAgencyNotas.trim() || undefined,
      lat: this.newAgencyLat(),
      lng: this.newAgencyLng()
    });

    this.newAgencyName = '';
    this.newAgencyDireccion = '';
    this.newAgencyLat.set(undefined);
    this.newAgencyLng.set(undefined);
    this.newAgencyTipo.set(null);
    this.newAgencyRelacion.set(3);
    this.newAgencyNotas = '';
    this.showAddModal.set(false);
  }
}