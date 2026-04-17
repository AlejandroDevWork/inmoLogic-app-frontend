import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../core/services/property.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AppDropdownComponent } from '../../shared/components/app-dropdown/app-dropdown.component';
import { LucideAngularModule, Users, Phone, Mail, MessageCircle, Plus, X, Coffee, Car, Bike, MapPin } from 'lucide-angular';

@Component({
  selector: 'app-contacts',
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
          <h1 class="text-xl font-bold text-petrol">Contactos</h1>
          <p class="text-xs text-stone mt-1">Tu red de contactos inmobiliarios</p>
        </div>
        <button (click)="showAddModal.set(true)"
          class="w-10 h-10 rounded-[14px] bg-earth flex items-center justify-center
                 shadow-sm transition-all duration-200 active:scale-95">
          <lucide-icon [img]="iconPlus" class="text-white" [size]="20"></lucide-icon>
        </button>
      </div>

      <!-- Contactos que requieren contacto -->
      @if (contactosAlerta().length > 0) {
        <div>
          <h2 class="text-sm font-semibold text-petrol mb-3">Requieren contacto</h2>
          <div class="bg-white/70 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm overflow-hidden">
            @for (status of contactosAlerta(); track status.contact.id) {
              <div class="flex items-center gap-3 p-4 border-b border-cream last:border-b-0">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                     [class]="status.estado === 'rojo' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'">
                  {{ status.contact.nombre.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-petrol truncate">{{ status.contact.nombre }}</p>
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

      <!-- Todos los contactos -->
      <div>
        <h2 class="text-sm font-semibold text-petrol mb-3">Todos los contactos</h2>
        <div class="space-y-3">
          @for (contact of contacts(); track contact.id) {
            <div class="bg-white/70 backdrop-blur-md rounded-[28px] border border-white/40 shadow-sm p-4">
              <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-[14px] bg-sand/60 flex items-center justify-center text-petrol text-sm font-bold flex-shrink-0">
                  {{ contact.nombre.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="text-sm font-semibold text-petrol truncate">{{ contact.nombre }}</h3>
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
            <div class="bg-white/60 backdrop-blur-md rounded-[24px] border border-white/40 shadow-sm p-10 text-center">
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

    <!-- Add Contact Modal -->
    @if (showAddModal()) {
      <div class="fixed inset-0 z-[9999] flex items-end justify-center"
           (click)="showAddModal.set(false)">
        <div class="absolute inset-0 bg-petrol/40 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-white rounded-t-[28px] shadow-xl
                    max-h-[85vh] overflow-y-auto animate-slide-up"
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
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Teléfono</label>
                <input type="tel" placeholder="600 000 000"
                  [(ngModel)]="newTelefono"
                  class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                         text-sm text-petrol placeholder:text-stone/30
                         border border-warm-border focus:border-earth
                         focus:outline-none transition-colors" />
              </div>
              <div>
                <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Email</label>
                <input type="email" placeholder="email@ejemplo.com"
                  [(ngModel)]="newEmail"
                  class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                         text-sm text-petrol placeholder:text-stone/30
                         border border-warm-border focus:border-earth
                         focus:outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">WhatsApp</label>
              <input type="tel" placeholder="600 000 000"
                [(ngModel)]="newWhatsapp"
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
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
                <app-dropdown [options]="agencyNames()" placeholder="Sin agencia"
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
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
                       text-sm text-petrol placeholder:text-stone/30
                       border border-warm-border focus:border-earth
                       focus:outline-none transition-colors resize-none">
              </textarea>
            </div>
            <div>
              <label class="text-[10px] text-stone font-medium uppercase tracking-wide">Notas</label>
              <textarea placeholder="Notas generales..." rows="2"
                [(ngModel)]="newNotas"
                class="w-full mt-1 px-3 py-2.5 bg-cream/50 rounded-[14px]
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
  readonly contactosAlerta = this.propertyService.contactosRequierenContacto;

  // Modal state
  showAddModal = signal(false);
  newNombre = '';
  newTelefono = '';
  newEmail = '';
  newWhatsapp = '';
  newDesplazamiento = signal<string | null>(null);
  newAgencyId = signal<string | null>(null);
  newNotasCafe = '';
  newNotas = '';

  desplazamientoOptions = ['Coche', 'Moto', 'Otros'];

  agencyNames = computed(() => this.agencies().map(a => a.nombre));

  iconUsers = Users;
  iconPhone = Phone;
  iconMail = Mail;
  iconWhatsapp = MessageCircle;
  iconPlus = Plus;
  iconX = X;
  iconCoffee = Coffee;
  iconCar = Car;
  iconBike = Bike;
  iconBuilding = MapPin;

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

  addContact(): void {
    if (!this.newNombre.trim()) return;

    const desplazamientoMap: Record<string, string> = {
      'Coche': 'coche',
      'Moto': 'moto',
      'Otros': 'otros'
    };

    const agency = this.newAgencyId()
      ? this.agencies().find(a => a.nombre === this.newAgencyId())
      : null;

    this.propertyService.addContact({
      nombre: this.newNombre.trim(),
      telefono: this.newTelefono.trim() || undefined,
      email: this.newEmail.trim() || undefined,
      whatsapp: this.newWhatsapp.trim() || undefined,
      desplazamiento: (desplazamientoMap[this.newDesplazamiento() || ''] || '') as any,
      agencyId: agency?.id || undefined,
      notasCafe: this.newNotasCafe.trim() || undefined,
      notas: this.newNotas.trim() || undefined
    });

    this.newNombre = '';
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