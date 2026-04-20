import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, Users, Phone, Mail, MessageCircle, Plus, X, Coffee, MapPin, Search, SlidersHorizontal } from 'lucide-angular';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppDropdownComponent,
    LucideAngularModule
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-5 bg-cream min-h-full overflow-y-auto">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-petrol">Contactos</h1>
        </div>
        <button (click)="showAddModal.set(true)"
          class="w-10 h-10 rounded-[14px] bg-earth flex items-center justify-center
                 shadow-sm transition-all duration-200 active:scale-95">
          <lucide-icon [img]="iconPlus" class="text-white" [size]="20"></lucide-icon>
        </button>
      </div>

      <!-- Search + Filter button -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <lucide-icon [img]="iconSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" [size]="16"></lucide-icon>
          <input type="text" placeholder="Buscar contacto..."
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
            class="w-full pl-9 pr-4 py-2.5 bg-white rounded-[14px] text-sm text-petrol
                   placeholder:text-stone/30 border border-warm-border
                   focus:border-earth focus:outline-none transition-colors" />
        </div>
        <button (click)="showFilterModal.set(true)"
          class="w-10 h-10 rounded-[14px] bg-white border border-warm-border flex items-center justify-center
                 shadow-sm transition-all duration-200 active:scale-95 hover:bg-sand/40 relative">
          <lucide-icon [img]="iconFilter" class="text-petrol" [size]="18"></lucide-icon>
          @if (hasActiveFilters()) {
            <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-earth"></div>
          }
        </button>
      </div>

      <!-- Active filter pills -->
      @if (hasActiveFilters()) {
        <div class="flex flex-wrap gap-1.5">
          @if (filtroTipo() !== 'todas') {
            <button (click)="filtroTipo.set('todas')"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ getTipoLabel(filtroTipo()) }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          @if (filtroDesplazamiento() !== 'todas') {
            <button (click)="filtroDesplazamiento.set('todas')"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ getDesplazamientoLabel(filtroDesplazamiento()) }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          @if (filtroAgencia() !== 'todas') {
            <button (click)="filtroAgencia.set('todas')"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ filtroAgencia() }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          <button (click)="clearFilters()"
            class="px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                   text-stone hover:text-petrol transition-colors">
            Limpiar todo
          </button>
        </div>
      }

      <!-- Contactos list -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-petrol">Contactos</h2>
          <span class="text-[10px] text-stone">{{ filteredContacts().length }} de {{ contacts().length }}</span>
        </div>
        <div class="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          @for (contact of filteredContacts(); track contact.id) {
            <div class="bg-white rounded-[28px] border border-warm-border shadow-sm p-4">
              <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-[14px] bg-sand/60 flex items-center justify-center text-petrol text-sm font-bold flex-shrink-0">
                  {{ contact.nombre.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="text-sm font-semibold text-petrol truncate">{{ contact.nombre }}</h3>
                    @if (contact.tipo) {
                      <span class="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-earth-light/25 text-earth-dark">
                        {{ getTipoLabel(contact.tipo) }}
                      </span>
                    }
                    @if (contact.desplazamiento) {
                      <span class="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-cream text-stone">
                        {{ getDesplazamientoLabel(contact.desplazamiento) }}
                      </span>
                    }
                  </div>

                  <!-- Agencia vinculada -->
                  @if (contact.agencyId) {
                    <div class="flex items-center gap-1 mt-0.5">
                      <lucide-icon [img]="iconBuilding" class="text-stone/50" [size]="11"></lucide-icon>
                      <p class="text-[11px] text-stone">{{ getAgencyName(contact.agencyId) }}</p>
                    </div>
                  }

                  <!-- Notas de café -->
                  @if (contact.notasCafe) {
                    <div class="flex items-start gap-1.5 mt-1.5">
                      <lucide-icon [img]="iconCoffee" class="text-earth/50 mt-0.5" [size]="11"></lucide-icon>
                      <p class="text-[10px] text-stone/70 italic">{{ contact.notasCafe }}</p>
                    </div>
                  }

                  @if (contact.notas) {
                    <div class="flex items-start gap-1.5 mt-1">
                      <p class="text-[10px] text-stone/50">{{ contact.notas }}</p>
                    </div>
                  }
                </div>

                <!-- Quick actions -->
                <div class="flex items-center gap-1.5">
                  @if (contact.telefono) {
                    <button class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                   text-stone hover:text-petrol transition-colors">
                      <lucide-icon [img]="iconPhone" [size]="14"></lucide-icon>
                    </button>
                  }
                  @if (contact.whatsapp) {
                    <button class="w-8 h-8 rounded-[10px] bg-emerald-50 flex items-center justify-center
                                   text-emerald-600 hover:text-emerald-700 transition-colors">
                      <lucide-icon [img]="iconWhatsapp" [size]="14"></lucide-icon>
                    </button>
                  }
                  @if (contact.email) {
                    <button class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                   text-stone hover:text-petrol transition-colors">
                      <lucide-icon [img]="iconMail" [size]="14"></lucide-icon>
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="lg:col-span-2 bg-white rounded-[24px] border border-warm-border shadow-sm p-10 text-center">
              <div class="w-14 h-14 rounded-[18px] bg-sand/40 mx-auto mb-3 flex items-center justify-center">
                <lucide-icon [img]="iconUsers" class="text-stone/30" [size]="28"></lucide-icon>
              </div>
              <p class="text-sm text-petrol font-medium">Sin contactos</p>
              <p class="text-xs text-stone mt-1">Añade tu primer contacto</p>
            </div>
          }
        </div>
      </div>

    </div>

    <!-- Filter Modal -->
    @if (showFilterModal()) {
      <div class="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
           (click)="showFilterModal.set(false)">
        <div class="absolute inset-0 bg-petrol/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-white rounded-t-[28px] lg:rounded-[28px] shadow-xl
                    max-h-[85vh] overflow-y-auto animate-slide-up lg:animate-fade-in"
             (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white flex items-center justify-between p-5 pb-3 border-b border-cream z-10">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="iconFilter" class="text-petrol" [size]="18"></lucide-icon>
              <h2 class="text-lg font-bold text-petrol">Filtros</h2>
            </div>
            <button (click)="showFilterModal.set(false)"
              class="w-8 h-8 rounded-[10px] bg-cream/60 flex items-center justify-center text-stone hover:text-petrol transition-colors">
              <lucide-icon [img]="iconX" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="p-5 space-y-5">
            <!-- Tipo -->
            <div>
              <label class="text-xs text-petrol font-semibold mb-2 block">Tipo de contacto</label>
              <div class="flex flex-wrap gap-1.5">
                @for (chip of filtroTipoChips; track chip.key) {
                  <button (click)="filtroTipo.set(chip.key)"
                    class="px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                    [class]="filtroTipo() === chip.key
                      ? 'bg-petrol text-white'
                      : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                    {{ chip.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Desplazamiento -->
            <div>
              <label class="text-xs text-petrol font-semibold mb-2 block">Desplazamiento</label>
              <div class="flex flex-wrap gap-1.5">
                @for (chip of filtroDesplazamientoChips; track chip.key) {
                  <button (click)="filtroDesplazamiento.set(chip.key)"
                    class="px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                    [class]="filtroDesplazamiento() === chip.key
                      ? 'bg-petrol text-white'
                      : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                    {{ chip.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Agencia -->
            @if (agencies().length > 0) {
              <div>
                <label class="text-xs text-petrol font-semibold mb-2 block">Agencia</label>
                <app-dropdown [options]="agenciaFilterOptions()" [placeholder]="filtroAgenciaLabel()"
                  (selectedChange)="onAgenciaFilterSelected($event)"></app-dropdown>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-2 pt-2">
              <button (click)="clearFilters()"
                class="flex-1 py-2.5 rounded-[14px] text-sm font-medium border border-warm-border
                       text-stone hover:text-petrol transition-colors">
                Limpiar filtros
              </button>
              <button (click)="showFilterModal.set(false)"
                class="flex-1 py-2.5 rounded-[14px] text-sm font-medium bg-petrol text-white
                       shadow-sm transition-all duration-200 active:scale-[0.98]">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add Contact Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-[9999] flex items-end lg:items-center justify-center"
           (click)="showAddModal.set(false)">
        <div class="absolute inset-0 bg-petrol/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-white rounded-t-[28px] lg:rounded-[28px] shadow-xl
                    max-h-[85vh] overflow-y-auto animate-slide-up lg:animate-fade-in"
             (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white flex items-center justify-between p-5 pb-3 border-b border-cream">
            <h2 class="text-lg font-bold text-petrol">Nuevo contacto</h2>
            <button (click)="showAddModal.set(false)"
              class="w-8 h-8 rounded-[10px] bg-cream/60 flex items-center justify-center text-stone hover:text-petrol transition-colors">
              <lucide-icon [img]="iconX" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Nombre</label>
              <input type="text" placeholder="Nombre del contacto"
                [(ngModel)]="newNombre"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Tipo</label>
              <div class="mt-1">
                <app-dropdown [options]="tipoOptions" placeholder="Sin tipo"
                  (selectedChange)="newTipo.set($event)"></app-dropdown>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Teléfono</label>
                <input type="tel" placeholder="600 000 000"
                  [(ngModel)]="newTelefono"
                  class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                         text-sm text-petrol placeholder:text-stone/30
                         border border-warm-border focus:border-earth
                         focus:outline-none transition-colors" />
              </div>
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Email</label>
                <input type="email" placeholder="email@ejemplo.com"
                  [(ngModel)]="newEmail"
                  class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                         text-sm text-petrol placeholder:text-stone/30
                         border border-warm-border focus:border-earth
                         focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">WhatsApp</label>
              <input type="tel" placeholder="600 000 000"
                [(ngModel)]="newWhatsapp"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Desplazamiento</label>
              <div class="mt-1">
                <app-dropdown [options]="desplazamientoOptions" placeholder="Seleccionar..."
                  (selectedChange)="newDesplazamiento.set($event)"></app-dropdown>
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Vincular a agencia</label>
              <div class="mt-1">
                <app-dropdown [options]="agenciaNombres()" placeholder="Sin agencia"
                  (selectedChange)="newAgencyId.set($event)"></app-dropdown>
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide flex items-center gap-1.5">
                <lucide-icon [img]="iconCoffee" class="text-earth" [size]="12"></lucide-icon>
                Notas de café
              </label>
              <textarea placeholder="Reuniones informales, cafés, contexto personal..."
                rows="2"
                [(ngModel)]="newNotasCafe"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors resize-none">
              </textarea>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Notas</label>
              <textarea placeholder="Notas generales..." rows="2"
                [(ngModel)]="newNotas"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors resize-none">
              </textarea>
            </div>

            <button (click)="addContact()"
              class="w-full py-3 bg-petrol text-white rounded-[16px] text-sm font-medium
                     shadow-sm transition-all duration-200 active:scale-[0.98]
                     hover:bg-petrol-light">
              Guardar contacto
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `]
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
  iconWhatsapp = MessageCircle;
  iconPlus = Plus;
  iconX = X;
  iconCoffee = Coffee;
  iconBuilding = MapPin;
  iconSearch = Search;
  iconFilter = SlidersHorizontal;

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