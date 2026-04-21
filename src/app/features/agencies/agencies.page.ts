import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { AddressAutocompleteComponent } from '../../shared/components/address-autocomplete/address-autocomplete.component';
import { AgencyMapComponent } from '../../shared/components/agency-map/agency-map.component';
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
    LucideAngularModule
  ],
  template: `
    <div class="p-4 lg:p-6 space-y-5 bg-cream min-h-full overflow-y-auto">

          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-petrol">Agencias</h1>
            </div>
            <div class="flex items-center gap-2">
              @if (agenciesConCoords().length > 0) {
                <button (click)="showMap.set(!showMap())"
                  class="w-10 h-10 rounded-[14px] bg-white border border-warm-border flex items-center justify-center
                         shadow-sm transition-all duration-200 active:scale-95 hover:bg-sand/40"
                  [class]="showMap() ? 'ring-2 ring-earth/30' : ''">
                  <lucide-icon [img]="iconMap" class="text-petrol" [size]="20"></lucide-icon>
                </button>
              }
              <button (click)="showAddModal.set(true)"
                class="w-10 h-10 rounded-[14px] bg-earth flex items-center justify-center
                       shadow-sm transition-all duration-200 active:scale-95">
                <lucide-icon [img]="iconPlus" class="text-white" [size]="20"></lucide-icon>
              </button>
            </div>
          </div>

          <!-- Mapa (collapsible) -->
          @if (agenciesConCoords().length > 0) {
            <div class="map-container"
                 [class]="showMap() ? 'map-container-open' : 'map-container-closed'">
              <div class="bg-white rounded-[24px] border border-warm-border shadow-sm overflow-hidden">
                <app-agency-map [agencies]="agenciesConCoords()" [focusAgencyId]="focusAgencyId()"></app-agency-map>
              </div>
            </div>
          }

          <!-- Search + Filter button -->
          <div class="flex gap-2">
            <div class="relative flex-1">
              <lucide-icon [img]="iconSearch" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone/40" [size]="16"></lucide-icon>
              <input type="text" placeholder="Buscar agencia..."
                [value]="searchTerm()"
                (input)="searchTerm.set($any($event.target).value); currentPage.set(1)"
                class="w-full pl-10 pr-4 py-2.5 bg-white rounded-[14px] text-sm text-petrol
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
              @if (filtroRelacion() !== 'todas') {
                <button (click)="filtroRelacion.set('todas'); currentPage.set(1)"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                         bg-petrol text-white">
                  {{ getRelacionLabel(filtroRelacion()) }}
                  <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
                </button>
              }
              @if (filtroEstrellas() !== 0) {
                <button (click)="filtroEstrellas.set(0); currentPage.set(1)"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                         bg-petrol text-white">
                  {{ filtroEstrellas() }}+ estrellas
                  <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
                </button>
              }
              @if (filtroOrden() !== 'nombre') {
                <button (click)="filtroOrden.set('nombre')"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                         bg-petrol text-white">
                  {{ getOrdenLabel(filtroOrden()) }}
                  <lucide-icon [img]="iconX" [size]="10"></lucide-icon>
                </button>
              }
              @if (filtroCiudad() !== 'todas') {
                <button (click)="filtroCiudad.set('todas'); currentPage.set(1)"
                  class="flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-medium
                         bg-petrol text-white">
                  {{ filtroCiudad() }}
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

          <!-- Agencias list -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-petrol">Agencias</h2>
              <app-dropdown [options]="pageSizeOptions" [placeholder]="pageSizeLabel()"
                [value]="pageSizeLabel()"
                (selectedChange)="onPageSizeChange($event)"
                class="w-24"></app-dropdown>
            </div>
            <div class="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              @for (agency of paginatedAgencies(); track agency.id) {
                <div class="bg-white rounded-[28px] border border-warm-border shadow-sm p-4">
                  <!-- Agency header -->
                  <div class="flex items-start gap-3">
                    <div class="w-11 h-11 rounded-[14px] bg-sand/60 flex items-center justify-center text-petrol text-sm font-bold flex-shrink-0">
                      {{ agency.nombre.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <h3 class="text-sm font-semibold text-petrol truncate">{{ agency.nombre }}</h3>
                        @if (agency.tipoRelacion) {
                          <span class="text-[10px] font-medium px-2 py-0.5 rounded-lg whitespace-nowrap"
                                [class]="getTipoRelacionClass(agency.tipoRelacion)">
                            {{ getTipoRelacionLabel(agency.tipoRelacion) }}
                          </span>
                        }
                      </div>
                      @if (agency.direccion) {
                        <div class="flex items-center gap-1 mt-0.5">
                          <lucide-icon [img]="iconMap" class="text-stone/50" [size]="11"></lucide-icon>
                          <p class="text-[11px] text-stone">{{ agency.direccion }}</p>
                        </div>
                      }
                      <div class="flex items-center gap-0.5 mt-1.5">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <lucide-icon [img]="iconStar" [size]="11"
                            [class]="star <= agency.relacion ? 'text-earth' : 'text-stone/20'">
                          </lucide-icon>
                        }
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                     text-stone hover:text-petrol transition-colors">
                        <lucide-icon [img]="iconPhone" [size]="14"></lucide-icon>
                      </button>
                      @if (agency.lat != null && agency.lng != null) {
                        <button (click)="openMapForAgency(agency.id)"
                          class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                 text-stone hover:text-petrol transition-colors">
                          <lucide-icon [img]="iconMap" [size]="14"></lucide-icon>
                        </button>
                      }
                    </div>
                  </div>

                  @if (agency.agentes && agency.agentes.length > 0) {
                    <div class="mt-4 pt-3 border-t border-warm-border/60 space-y-2.5">
                      <div class="flex items-center gap-1.5 mb-1">
                        <lucide-icon [img]="iconUsers" class="text-stone/40" [size]="12"></lucide-icon>
                        <span class="text-[10px] font-semibold text-stone/50 uppercase tracking-wider">Contactos</span>
                      </div>
                      @for (agente of agency.agentes; track agente.id) {
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-full bg-petrol/5 flex items-center justify-center text-[10px] font-bold text-petrol">
                            {{ agente.nombre.charAt(0) }}
                          </div>
                          <span class="text-xs text-petrol font-medium flex-1">{{ agente.nombre }}</span>
                          <div class="flex items-center gap-1">
                            @if (agente.telefono) {
                              <button class="w-7 h-7 rounded-lg bg-cream/60 flex items-center justify-center
                                             text-stone hover:text-petrol transition-colors">
                                <lucide-icon [img]="iconPhone" [size]="12"></lucide-icon>
                              </button>
                            }
                            @if (agente.whatsapp) {
                              <button class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center
                                             text-emerald-600 hover:text-emerald-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.058 5.335 5.335.057 11.89.057c2.765 0 5.358 1.075 7.317 3.034a10.263 10.263 0 013.034 7.317c-.003 6.558-5.339 11.893-11.893 11.893H.057zm6.597-3.798l.375.223a8.864 8.864 0 004.507 1.228h.003c4.875 0 8.841-3.966 8.843-8.843a8.802 8.802 0 00-2.584-6.259 8.792 8.792 0 00-6.259-2.584c-4.878 0-8.843 3.966-8.845 8.843a8.815 8.815 0 001.362 4.742l.208.332-.889 3.248 3.294-.83zm9.158-4.964c-.072-.12-.264-.192-.552-.272-.185-.061-1.149-.567-1.327-.631-.178-.064-.309-.097-.439.097-.131.194-.506.631-.621.762-.114.131-.229.148-.423.049-.195-.097-1.169-.43-2.229-1.366-.823-.734-1.378-1.639-1.539-1.929-.161-.29-.017-.448.086-.545.093-.09.195-.229.293-.343.097-.114.131-.195.196-.34.065-.147.033-.275-.016-.386-.049-.11-.439-1.06-.602-1.45-.161-.39-.325-.337-.439-.343h-.375c-.131 0-.342.049-.522.229-.179.181-.685.669-.685 1.631 0 .963.701 1.895.799 2.025.097.131 1.382 2.109 3.35 2.955.468.202.834.323 1.119.413.47.149.897.128 1.236.078.377-.057 1.149-.469 1.313-.921.163-.453.163-.841.114-.921z"/>
                                </svg>
                              </button>
                            }
                            @if (agente.email) {
                              <button class="w-7 h-7 rounded-lg bg-cream/60 flex items-center justify-center
                                             text-stone hover:text-petrol transition-colors">
                                <lucide-icon [img]="iconMail" [size]="12"></lucide-icon>
                              </button>
                            }
                          </div>
                        </div>
                        @if (agente.notas) {
                          <div class="ml-9 flex items-start gap-1.5">
                            <lucide-icon [img]="iconNote" class="text-stone/30 mt-0.5" [size]="10"></lucide-icon>
                            <p class="text-[10px] text-stone/70 italic">{{ agente.notas }}</p>
                          </div>
                        }
                      }
                    </div>
                  }

                  @if (agency.notas) {
                    <div class="mt-3 pt-3 border-t border-warm-border/60">
                      <div class="flex items-start gap-1.5">
                        <lucide-icon [img]="iconNote" class="text-stone/25 mt-0.5" [size]="11"></lucide-icon>
                        <p class="text-[10px] text-stone/60">{{ agency.notas }}</p>
                      </div>
                    </div>
                  }
                </div>
              } @empty {
                <div class="lg:col-span-2 bg-white rounded-[24px] border border-warm-border shadow-sm p-10 text-center">
                  <div class="w-14 h-14 rounded-[18px] bg-sand/40 mx-auto mb-3 flex items-center justify-center">
                    <lucide-icon [img]="iconBuilding2" class="text-stone/30" [size]="28"></lucide-icon>
                  </div>
                  <p class="text-sm text-petrol font-medium">Sin agencias</p>
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
              class="w-8 h-8 rounded-[10px] bg-cream/60 flex items-center justify-center text-stone
                     hover:text-petrol transition-colors">
              <lucide-icon [img]="iconX" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="p-5 space-y-5">
            <!-- Relación -->
            <div>
              <label class="text-xs text-petrol font-semibold mb-2 block">Tipo de relación</label>
              <div class="flex flex-wrap gap-1.5">
                @for (chip of filtroRelacionChips; track chip.key) {
                  <button (click)="filtroRelacion.set(chip.key); currentPage.set(1)"
                    class="px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                    [class]="filtroRelacion() === chip.key
                      ? 'bg-petrol text-white'
                      : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                    {{ chip.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Estrellas -->
            <div>
              <label class="text-xs text-petrol font-semibold mb-2 block">Valoración mínima</label>
              <div class="flex gap-1.5">
                @for (n of [0, 1, 2, 3, 4, 5]; track n) {
                  <button (click)="filtroEstrellas.set(n); currentPage.set(1)"
                    class="flex items-center gap-1 px-2.5 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                    [class]="filtroEstrellas() === n
                      ? 'bg-petrol text-white'
                      : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                    @if (n === 0) {
                      Todas
                    } @else {
                      <lucide-icon [img]="iconStar" [size]="10" class="text-earth"></lucide-icon>
                      {{ n }}+
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Orden -->
            <div>
              <label class="text-xs text-petrol font-semibold mb-2 block">Ordenar por</label>
              <app-dropdown [options]="ordenLabels" placeholder="Nombre"
                (selectedChange)="onOrdenSelected($event)"></app-dropdown>
            </div>

            <!-- Ubicación -->
            @if (ciudadesDisponibles().length > 1) {
              <div>
                <label class="text-xs text-petrol font-semibold mb-2 block">Ubicación</label>
                <div class="flex flex-wrap gap-1.5">
                  <button (click)="filtroCiudad.set('todas'); currentPage.set(1)"
                    class="px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                    [class]="filtroCiudad() === 'todas'
                      ? 'bg-petrol text-white'
                      : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                    Todas
                  </button>
                  @for (ciudad of ciudadesDisponibles(); track ciudad) {
                    <button (click)="filtroCiudad.set(ciudad); currentPage.set(1)"
                      class="px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-200"
                      [class]="filtroCiudad() === ciudad
                        ? 'bg-petrol text-white'
                        : 'bg-white text-petrol border border-warm-border hover:bg-sand/40'">
                      {{ ciudad }}
                    </button>
                  }
                </div>
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

    <!-- Add Agency Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
           (click)="showAddModal.set(false)">
        <div class="absolute inset-0 bg-petrol/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-white rounded-t-[28px] lg:rounded-[28px] shadow-xl
                    max-h-[85vh] overflow-y-auto animate-slide-up lg:animate-fade-in"
             (click)="$event.stopPropagation()">
          <div class="sticky top-0 bg-white flex items-center justify-between p-5 pb-3 border-b border-cream z-10">
            <h2 class="text-lg font-bold text-petrol">Nueva agencia</h2>
            <button (click)="showAddModal.set(false)"
              class="w-8 h-8 rounded-[10px] bg-cream/60 flex items-center justify-center text-stone
                     hover:text-petrol transition-colors">
              <lucide-icon [img]="iconX" [size]="16"></lucide-icon>
            </button>
          </div>

          <div class="p-5 space-y-4">
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Nombre</label>
              <input type="text" placeholder="Nombre de la agencia"
                [(ngModel)]="newAgencyName"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Dirección</label>
              <div class="mt-1">
                <app-address-autocomplete placeholder="Buscar dirección..."
                  (addressSelected)="onAddressSelected($event)"></app-address-autocomplete>
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Tipo de relación</label>
              <div class="mt-1">
                <app-dropdown [options]="tipoRelacionOptions" placeholder="Seleccionar..."
                  (selectedChange)="newAgencyTipo.set($event)"></app-dropdown>
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide mb-2 block">Relación</label>
              <div class="flex items-center gap-1">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <button (click)="newAgencyRelacion.set(star)"
                    class="transition-transform active:scale-90">
                    <lucide-icon [img]="iconStar" [size]="24"
                      [class]="star <= newAgencyRelacion() ? 'text-earth' : 'text-stone/20'">
                    </lucide-icon>
                  </button>
                }
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Notas</label>
              <textarea placeholder="Notas sobre la agencia..." rows="3"
                [(ngModel)]="newAgencyNotas"
                class="w-full mt-1 px-3 py-2.5 bg-sand/30 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors resize-none">
              </textarea>
            </div>

            <button (click)="addAgency()"
              class="w-full py-3 bg-petrol text-white rounded-[16px] text-sm font-medium
                     shadow-sm transition-all duration-200 active:scale-[0.98]
                     hover:bg-petrol-light">
              Guardar agencia
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
    .map-container {
      overflow: hidden;
      transition: max-height 0.35s ease, opacity 0.3s ease, margin-top 0.3s ease;
    }
    .map-container-open {
      max-height: 500px;
      opacity: 1;
      margin-top: 0;
    }
    .map-container-closed {
      max-height: 0;
      opacity: 0;
      margin-top: -20px;
    }
  `]
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