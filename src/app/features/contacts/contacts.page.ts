import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { AppDataTableComponent, TableColumn } from '../../shared/components/app-data-table/app-data-table.component';
import { LucideAngularModule, Users, Phone, Mail, Plus, X, Coffee, MapPin, Search, SlidersHorizontal, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppDropdownComponent,
    AppDataTableComponent,
    LucideAngularModule
  ],
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss']
})
export class ContactsPage {
  private propertyService = inject(PropertyService);

  readonly contacts = this.propertyService.contacts;
  readonly agencies = this.propertyService.agencies;

  // Search & Filters
  searchTerm = signal('');
  filtroTipo = signal('todas');
  filtroDesplazamiento = signal('todas');
  filtroAgencia = signal('todas');
  pageSize = signal(5);
  currentPage = signal(1);

  contactColumns: TableColumn[] = [
    { label: 'Nombre', align: 'left' },
    { label: 'Tipo', align: 'center' },
    { label: 'Agencia', align: 'left' },
    { label: 'Notas', align: 'left' },
    { label: 'Acciones', align: 'right' }
  ];

  pageSizeOptions = ['5', '10', '15', '20', '25'];
  pageSizeLabel = computed(() => String(this.pageSize()));

  filtroTipoChips = [
    { key: 'todas', label: 'Todos' },
    { key: 'fontanero', label: 'Fontanero' },
    { key: 'constructor', label: 'Constructor' },
    { key: 'abogado', label: 'Abogado' },
    { key: 'portero', label: 'Portero' },
    { key: 'notario', label: 'Notario' },
    { key: 'electricista', label: 'Electricista' },
    { key: 'pintor', label: 'Pintor' },
    { key: 'arquitecto', label: 'Arquitecto' },
    { key: 'gestor', label: 'Gestor' },
    { key: 'otro', label: 'Otro' },
  ];

  filtroDesplazamientoChips = [
    { key: 'todas', label: 'Todos' },
    { key: 'coche', label: 'Coche' },
    { key: 'moto', label: 'Moto' },
    { key: 'otros', label: 'Otros' },
  ];

  hasActiveFilters = computed(() =>
    this.filtroTipo() !== 'todas' ||
    this.filtroDesplazamiento() !== 'todas' ||
    this.filtroAgencia() !== 'todas'
  );

  filteredContacts = computed(() => {
    let result = this.contacts();

    // Search
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      result = result.filter(c =>
        c.nombre.toLowerCase().includes(term) ||
        (c.telefono && c.telefono.includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.notas && c.notas.toLowerCase().includes(term))
      );
    }

    // Filter by tipo
    const tipo = this.filtroTipo();
    if (tipo !== 'todas') {
      result = result.filter(c => c.tipo === tipo);
    }

    // Filter by desplazamiento
    const desp = this.filtroDesplazamiento();
    if (desp !== 'todas') {
      result = result.filter(c => c.desplazamiento === desp);
    }

    // Filter by agency
    const agencia = this.filtroAgencia();
    if (agencia === 'Sin agencia') {
      result = result.filter(c => !c.agencyId);
    } else if (agencia !== 'todas') {
      const agency = this.agencies().find(a => a.nombre === agencia);
      if (agency) {
        result = result.filter(c => c.agencyId === agency.id);
      }
    }

    return result;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredContacts().length / this.pageSize())));

  paginatedContacts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredContacts().slice(start, start + this.pageSize());
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
      if (start > 2) pages.push(-1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push(-1);
      pages.push(total);
    }
    return pages;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  onPageSizeChange(label: string): void {
    const size = parseInt(label, 10);
    if (!isNaN(size)) {
      this.pageSize.set(size);
      this.currentPage.set(1);
    }
  }

  agenciaNombres = computed(() => this.agencies().map(a => a.nombre));

  agenciaFilterOptions = computed(() => ['Todas', 'Sin agencia', ...this.agencies().map(a => a.nombre)]);

  agenciaFilterLabelMap: Record<string, string> = {
    'todas': 'Todas',
    'Sin agencia': 'Sin agencia',
  };

  filtroAgenciaLabel = computed(() => this.agenciaFilterLabelMap[this.filtroAgencia()] || this.filtroAgencia());

  // Modal state
  showAddModal = signal(false);
  showFilterModal = signal(false);
  newNombre = '';
  newTipo = signal<string | null>(null);
  newTelefono = '';
  newEmail = '';
  newWhatsapp = '';
  newDesplazamiento = signal<string | null>(null);
  newAgencyId = signal<string | null>(null);
  newNotasCafe = '';
  newNotas = '';

  tipoOptions = ['Fontanero', 'Constructor', 'Abogado', 'Portero', 'Notario', 'Electricista', 'Pintor', 'Arquitecto', 'Gestor', 'Otro'];
  desplazamientoOptions = ['Coche', 'Moto', 'Otros'];

  iconUsers = Users;
  iconPhone = Phone;
  iconMail = Mail;
  iconPlus = Plus;
  iconX = X;
  iconCoffee = Coffee;
  iconBuilding = MapPin;
  iconSearch = Search;
  iconFilter = SlidersHorizontal;
  iconChevronDown = ChevronDown;

  getDesplazamientoLabel(tipo: string): string {
    const map: Record<string, string> = {
      'coche': 'Coche',
      'moto': 'Moto',
      'otros': 'Otros'
    };
    return map[tipo] || tipo;
  }

  getAgencyName(agencyId: string): string {
    const agency = this.agencies().find(a => a.id === agencyId);
    return agency ? agency.nombre : 'Agencia';
  }

  clearFilters(): void {
    this.filtroTipo.set('todas');
    this.filtroDesplazamiento.set('todas');
    this.filtroAgencia.set('todas');
  }

  cleanPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  getTipoLabel(tipo: string): string {
    const chip = this.filtroTipoChips.find(c => c.key === tipo);
    return chip?.label ?? tipo;
  }

  onAgenciaFilterSelected(label: string): void {
    if (label === 'Todas') {
      this.filtroAgencia.set('todas');
    } else {
      this.filtroAgencia.set(label);
    }
  }

  addContact(): void {
    if (!this.newNombre.trim()) return;

    const desplazamientoMap: Record<string, string> = {
      'Coche': 'coche',
      'Moto': 'moto',
      'Otros': 'otros'
    };

    const tipoMap: Record<string, string> = {
      'Fontanero': 'fontanero',
      'Constructor': 'constructor',
      'Abogado': 'abogado',
      'Portero': 'portero',
      'Notario': 'notario',
      'Electricista': 'electricista',
      'Pintor': 'pintor',
      'Arquitecto': 'arquitecto',
      'Gestor': 'gestor',
      'Otro': 'otro'
    };

    const agency = this.newAgencyId()
      ? this.agencies().find(a => a.nombre === this.newAgencyId())
      : null;

    this.propertyService.addContact({
      nombre: this.newNombre.trim(),
      tipo: (tipoMap[this.newTipo() || ''] || undefined) as any,
      telefono: this.newTelefono.trim() || undefined,
      email: this.newEmail.trim() || undefined,
      whatsapp: this.newWhatsapp.trim() || undefined,
      desplazamiento: (desplazamientoMap[this.newDesplazamiento() || ''] || '') as any,
      agencyId: agency?.id || undefined,
      notasCafe: this.newNotasCafe.trim() || undefined,
      notas: this.newNotas.trim() || undefined
    });

    this.newNombre = '';
    this.newTipo.set(null);
    this.newTelefono = '';
    this.newEmail = '';
    this.newWhatsapp = '';
    this.newDesplazamiento.set(null);
    this.newAgencyId.set(null);
    this.newNotasCafe = '';
    this.newNotas = '';
    this.showAddModal.set(false);
  }
}