import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, Building2, Phone, Mail, MessageCircle, Star, StickyNote, MapPin, Plus, X } from 'lucide-angular';

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    AppDropdownComponent,
    LucideAngularModule
  ],
  template: `
    <div class="px-5 pt-8 pb-32 space-y-6 bg-cream min-h-full overflow-y-auto">

          <!-- Header -->
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-petrol">Agencias</h1>
              <p class="text-xs text-stone mt-1">CRM de contactos y relaciones</p>
            </div>
            <button (click)="showAddModal.set(true)"
              class="w-10 h-10 rounded-[14px] bg-earth flex items-center justify-center
                     shadow-sm transition-all duration-200 active:scale-95">
              <lucide-icon [img]="iconPlus" class="text-white" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Alertas CRM -->
          @if (agenciasAlerta().length > 0) {
            <div>
              <h2 class="text-sm font-semibold text-petrol mb-3">Requieren contacto</h2>
              <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm overflow-hidden">
                @for (status of agenciasAlerta(); track status.agency.id) {
                  <div class="flex items-center gap-3 p-4 border-b border-cream last:border-b-0">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                         [class]="status.estado === 'rojo' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'">
                      {{ status.agency.nombre.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-petrol truncate">{{ status.agency.nombre }}</p>
                      <p class="text-xs text-stone">
                        {{ status.diasSinContacto === 999 ? 'Nunca contactado' : status.diasSinContacto + ' días' }}
                      </p>
                    </div>
                    <app-status-badge type="crm" [crmStatus]="status.estado"></app-status-badge>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Todas las Agencias -->
          <div>
            <h2 class="text-sm font-semibold text-petrol mb-3">Todas las agencias</h2>
            <div class="space-y-3">
              @for (agency of agencies(); track agency.id) {
                <div class="bg-white/70 backdrop-blur-md rounded-[28px] border border-white/40 shadow-sm p-4">
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
                      <!-- Stars -->
                      <div class="flex items-center gap-0.5 mt-1.5">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <lucide-icon [img]="iconStar" [size]="11"
                            [class]="star <= agency.relacion ? 'text-earth' : 'text-stone/20'">
                          </lucide-icon>
                        }
                      </div>
                    </div>

                    <!-- Quick actions -->
                    <div class="flex items-center gap-1.5">
                      <button class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                     text-stone hover:text-petrol transition-colors">
                        <lucide-icon [img]="iconPhone" [size]="14"></lucide-icon>
                      </button>
                      <button class="w-8 h-8 rounded-[10px] bg-sand/40 flex items-center justify-center
                                     text-stone hover:text-petrol transition-colors">
                        <lucide-icon [img]="iconMap" [size]="14"></lucide-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Agentes -->
                  @if (agency.agentes && agency.agentes.length > 0) {
                    <div class="mt-3 pt-3 border-t border-cream space-y-2.5">
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
                                <lucide-icon [img]="iconWhatsapp" [size]="12"></lucide-icon>
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

                  <!-- Notas de relación -->
                  @if (agency.notas) {
                    <div class="mt-3 pt-3 border-t border-cream">
                      <div class="flex items-start gap-1.5">
                        <lucide-icon [img]="iconNote" class="text-stone/25 mt-0.5" [size]="11"></lucide-icon>
                        <p class="text-[10px] text-stone/60">{{ agency.notas }}</p>
                      </div>
                    </div>
                  }
                </div>
              } @empty {
                <div class="bg-white/60 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-10 text-center">
                  <div class="w-14 h-14 rounded-[18px] bg-sand/40 mx-auto mb-3 flex items-center justify-center">
                    <lucide-icon [img]="iconBuilding2" class="text-stone/30" [size]="28"></lucide-icon>
                  </div>
                  <p class="text-sm text-petrol font-medium">Sin agencias</p>
                  <p class="text-xs text-stone mt-1">Añade tu primer contacto</p>
                </div>
              }
            </div>
          </div>

    </div>

    <!-- Add Agency Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-50 flex items-end justify-center"
           (click)="showAddModal.set(false)">
        <div class="absolute inset-0 bg-petrol/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-xl
                    max-h-[85vh] overflow-y-auto animate-slide-up"
             (click)="$event.stopPropagation()">
          <!-- Modal header -->
          <div class="sticky top-0 bg-white flex items-center justify-between p-5 pb-3 border-b border-cream">
            <h2 class="text-lg font-bold text-petrol">Nueva agencia</h2>
            <button (click)="showAddModal.set(false)"
              class="w-8 h-8 rounded-[10px] bg-cream/60 flex items-center justify-center text-stone
                     hover:text-petrol transition-colors">
              <lucide-icon [img]="iconX" [size]="16"></lucide-icon>
            </button>
          </div>

          <!-- Form -->
          <div class="p-5 space-y-4">
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Nombre</label>
              <input type="text" placeholder="Nombre de la agencia"
                [(ngModel)]="newAgencyName"
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Dirección</label>
              <input type="text" placeholder="Dirección de la agencia"
                [(ngModel)]="newAgencyDireccion"
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
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
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
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
  `]
})
export class AgenciesPage {
  private propertyService = inject(PropertyService);

  readonly agencies = this.propertyService.agencies;
  readonly agenciasAlerta = this.propertyService.agenciasAlerta;

  // Modal state
  showAddModal = signal(false);
  newAgencyName = '';
  newAgencyDireccion = '';
  newAgencyTipo = signal<string | null>(null);
  newAgencyRelacion = signal(3);
  newAgencyNotas = '';

  tipoRelacionOptions = ['Partner preferente', 'Solo captación', 'Ocasional', 'Nueva'];

  iconBuilding2 = Building2;
  iconPhone = Phone;
  iconMail = Mail;
  iconWhatsapp = MessageCircle;
  iconStar = Star;
  iconNote = StickyNote;
  iconMap = MapPin;
  iconPlus = Plus;
  iconX = X;

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
      notas: this.newAgencyNotas.trim() || undefined
    });

    // Reset form
    this.newAgencyName = '';
    this.newAgencyDireccion = '';
    this.newAgencyTipo.set(null);
    this.newAgencyRelacion.set(3);
    this.newAgencyNotas = '';
    this.showAddModal.set(false);
  }
}