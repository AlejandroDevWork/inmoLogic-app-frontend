import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, Users, Phone, Mail, Plus, X, Coffee, MapPin, Search, SlidersHorizontal, ChevronDown } from 'lucide-angular';

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
            (input)="searchTerm.set($any($event.target).value); currentPage.set(1)"
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
            <button (click)="filtroTipo.set('todas'); currentPage.set(1)"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ getTipoLabel(filtroTipo()) }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          @if (filtroDesplazamiento() !== 'todas') {
            <button (click)="filtroDesplazamiento.set('todas'); currentPage.set(1)"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ getDesplazamientoLabel(filtroDesplazamiento()) }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          @if (filtroAgencia() !== 'todas') {
            <button (click)="filtroAgencia.set('todas'); currentPage.set(1)"
              class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                     bg-petrol text-white">
              {{ filtroAgencia() }}
              <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
            </button>
          }
          <button (click)="clearFilters(); currentPage.set(1)"
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
          <app-dropdown [options]="pageSizeOptions" [placeholder]="pageSizeLabel()"
            [value]="pageSizeLabel()"
            (selectedChange)="onPageSizeChange($event)"
            class="w-24"></app-dropdown>
        </div>
        <div class="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          @for (contact of paginatedContacts(); track contact.id) {
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.058 5.335 5.335.057 11.89.057c2.765 0 5.358 1.075 7.317 3.034a10.263 10.263 0 013.034 7.317c-.003 6.558-5.339 11.893-11.893 11.893H.057zm6.597-3.798l.375.223a8.864 8.864 0 004.507 1.228h.003c4.875 0 8.841-3.966 8.843-8.843a8.802 8.802 0 00-2.584-6.259 8.792 8.792 0 00-6.259-2.584c-4.878 0-8.843 3.966-8.845 8.843a8.815 8.815 0 001.362 4.742l.208.332-.889 3.248 3.294-.83zm9.158-4.964c-.072-.12-.264-.192-.552-.272-.185-.061-1.149-.567-1.327-.631-.178-.064-.309-.097-.439.097-.131.194-.506.631-.621.762-.114.131-.229.148-.423.049-.195-.097-1.169-.43-2.229-1.366-.823-.734-1.378-1.639-1.539-1.929-.161-.29-.017-.448.086-.545.093-.09.195-.229.293-.343.097-.114.131-.195.196-.34.065-.147.033-.275-.016-.386-.049-.11-.439-1.06-.602-1.45-.161-.39-.325-.337-.439-.343h-.375c-.131 0-.342.049-.522.229-.179.181-.685.669-.685 1.631 0 .963.701 1.895.799 2.025.097.131 1.382 2.109 3.35 2.955.468.202.834.323 1.119.413.47.149.897.128 1.236.078.377-.057 1.149-.469 1.313-.921.163-.453.163-.841.114-.921z"/>
                      </svg>
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

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-1.5 mt-5">
            <button (click)="goToPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors
                     disabled:opacity-30 disabled:cursor-default
                     bg-white border border-warm-border text-stone hover:text-petrol">
              <lucide-icon [img]="iconChevronDown" [size]="14" class="rotate-90"></lucide-icon>
            </button>
            @for (page of pageNumbers(); track page) {
              <button (click)="goToPage(page)"
                class="w-8 h-8 rounded-[10px] flex items-center justify-center text-xs font-medium transition-colors"
                [class]="page === currentPage()
                  ? 'bg-petrol text-white'
                  : 'bg-white border border-warm-border text-stone hover:text-petrol'">
                {{ page }}
              </button>
            }
            <button (click)="goToPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="w-8 h-8 rounded-[10px] flex items-center justify-center transition-colors
                     disabled:opacity-30 disabled:cursor-default
                     bg-white border border-warm-border text-stone hover:text-petrol">
              <lucide-icon [img]="iconChevronDown" [size]="14" class="-rotate-90"></lucide-icon>
            </button>
          </div>
        }
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
                  <button (click)="filtroTipo.set(chip.key); currentPage.set(1)"
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
                  <button (click)="filtroDesplazamiento.set(chip.key); currentPage.set(1)"
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
              <button (click)="clearFilters(); currentPage.set(1)"
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
  pageSize = signal(5);
  currentPage = signal(1);

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