import { Injectable, signal, computed, Signal } from '@angular/core';
import { Agency, Property, AgencyCrmStatus, Contact, ContactCrmStatus } from '../models/inmo.interface';

const STORAGE_KEYS = {
  AGENCIES: 'propflow_agencies',
  PROPERTIES: 'propflow_properties',
  CONTACTS: 'propflow_contacts'
};

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  // === STATE: Writable Signals ===
  private agenciesSignal = signal<Agency[]>(this.loadFromStorage<Agency[]>(STORAGE_KEYS.AGENCIES, []));
  private propertiesSignal = signal<Property[]>(this.loadFromStorage<Property[]>(STORAGE_KEYS.PROPERTIES, []));
  private contactsSignal = signal<Contact[]>(this.loadFromStorage<Contact[]>(STORAGE_KEYS.CONTACTS, []));

  constructor() {
    this.seedMockDataIfEmpty();
  }

  private seedMockDataIfEmpty(): void {
    if (this.propertiesSignal().length === 0) {
      this.addProperty({
        direccion: 'Calle Gran Vía 45, 3ºB',
        zona: 'Centro, Madrid',
        precioPedido: 250000,
        estado: 'analisis',
        tags: ['a-reformar'],
        propertyData: {
          codigoPostal: '28013',
          superficie: 85,
          habitaciones: 3,
          banos: 1,
          planta: '3ª',
          orientacion: 'Sur',
          ascensor: true,
          anoConstruccion: 1965,
          terrazaBalcon: true,
          parkingTrastero: false,
          referenciaCatastral: '1234567AB1234C0001WX',
        },
        adData: {
          portal: 'idealista',
          enlace: 'https://www.idealista.com/inmueble/12345678/',
          precioRebajado: false,
          tiempoPublicado: 42,
        },
        financials: {
          precioCompra: 250000,
          itp: 10,
          notariaGestoria: 1500,
          reforma: 35000,
          alquilerEstimado: 1400,
          comunidad: 120,
          ibi: 600,
          seguro: 350,
        },
        checklist: {
          estructura: [
            { id: 'est-1', nombre: 'Cimientos', estado: 'bien' },
            { id: 'est-2', nombre: 'Muros de carga', estado: 'bien' },
            { id: 'est-3', nombre: 'Forjados', estado: 'reparar' },
            { id: 'est-4', nombre: 'Cubierta/Tejado', estado: 'bien' },
            { id: 'est-5', nombre: 'Escaleras', estado: 'bien' },
          ],
          electricidad: [
            { id: 'ele-1', nombre: 'Cuadro eléctrico', estado: 'mal' },
            { id: 'ele-2', nombre: 'Cableado', estado: 'reparar' },
            { id: 'ele-3', nombre: 'Tomas de corriente', estado: 'bien' },
          ],
          humedades: [
            { id: 'hum-1', nombre: 'Paredes', estado: 'reparar' },
            { id: 'hum-2', nombre: 'Techos', estado: 'bien' },
          ],
          zonaComun: [
            { id: 'zc-1', nombre: 'Portal', estado: 'bien' },
            { id: 'zc-2', nombre: 'Ascensor', estado: 'bien' },
          ],
        },
      });
    }
  }

  // === PUBLIC READ-ONLY SIGNALS ===
  readonly agencies: Signal<Agency[]> = this.agenciesSignal.asReadonly();
  readonly properties: Signal<Property[]> = this.propertiesSignal.asReadonly();
  readonly contacts: Signal<Contact[]> = this.contactsSignal.asReadonly();

  // === COMPUTED: CRM Status para Agencias ===
  readonly agenciasCrmStatus: Signal<AgencyCrmStatus[]> = computed(() => {
    return this.agenciesSignal().map(agency => {
      const diasSinContacto = this.calcularDiasSinContacto(agency.lastContactDate);
      const estado = this.determinarEstadoCrm(diasSinContacto);

      return {
        agency,
        diasSinContacto,
        estado,
        necesitaContacto: diasSinContacto >= 7
      };
    });
  });

  // === COMPUTED: Agencias con Alerta ===
  readonly agenciasRequierenContacto: Signal<AgencyCrmStatus[]> = computed(() => {
    return this.agenciasCrmStatus().filter(status => status.necesitaContacto && status.estado === 'rojo');
  });

  readonly agenciasAlerta: Signal<AgencyCrmStatus[]> = computed(() => {
    return this.agenciasCrmStatus().filter(status => status.necesitaContacto);
  });

  // === COMPUTED: Contactos CRM Status ===
  readonly contactosCrmStatus: Signal<ContactCrmStatus[]> = computed(() => {
    return this.contactsSignal().map(contact => {
      const diasSinContacto = this.calcularDiasSinContacto(contact.lastContactDate);
      const estado = this.determinarEstadoCrm(diasSinContacto);
      return { contact, diasSinContacto, estado, necesitaContacto: diasSinContacto >= 7 };
    });
  });

  readonly contactosRequierenContacto: Signal<ContactCrmStatus[]> = computed(() => {
    return this.contactosCrmStatus().filter(status => status.necesitaContacto);
  });

  // === COMPUTED: Propiedades por Estado ===
  readonly propiedadesEnAnalisis = computed(() =>
    this.propertiesSignal().filter(p => p.estado === 'analisis')
  );

  readonly propiedadesEnVisita = computed(() =>
    this.propertiesSignal()
      .filter(p => p.estado === 'visita')
      .sort((a, b) => {
        if (!a.fechaVisita) return 1;
        if (!b.fechaVisita) return -1;
        return new Date(a.fechaVisita).getTime() - new Date(b.fechaVisita).getTime();
      })
  );

  readonly propiedadesEnOferta = computed(() =>
    this.propertiesSignal().filter(p => p.estado === 'oferta')
  );

  readonly propiedadesEnArras = computed(() =>
    this.propertiesSignal().filter(p => p.estado === 'arras')
  );

  readonly propiedadesAlquiladas = computed(() =>
    this.propertiesSignal().filter(p => p.estado === 'alquilado')
  );

  // === MÉTODOS DE PERSISTENCIA ===
  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof localStorage === 'undefined') {
      return defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  private persistAgencies(): void {
    this.saveToStorage(STORAGE_KEYS.AGENCIES, this.agenciesSignal());
  }

  private persistContacts(): void {
    this.saveToStorage(STORAGE_KEYS.CONTACTS, this.contactsSignal());
  }

  private persistProperties(): void {
    this.saveToStorage(STORAGE_KEYS.PROPERTIES, this.propertiesSignal());
  }

  // === UTILS: CRM Logic ===
  private calcularDiasSinContacto(lastContactDate?: string): number {
    if (!lastContactDate) return 999;

    const lastContact = new Date(lastContactDate);
    const hoy = new Date();
    const diffTime = hoy.getTime() - lastContact.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private determinarEstadoCrm(diasSinContacto: number): 'verde' | 'amarillo' | 'rojo' {
    if (diasSinContacto >= 15) return 'rojo';
    if (diasSinContacto >= 7) return 'amarillo';
    return 'verde';
  }

  // === CRUD: AGENCIAS ===
  addAgency(agency: Omit<Agency, 'id'>): Agency {
    const newAgency: Agency = {
      ...agency,
      id: this.generateId()
    };
    this.agenciesSignal.update(current => [...current, newAgency]);
    this.persistAgencies();
    return newAgency;
  }

  updateAgency(id: string, updates: Partial<Agency>): void {
    this.agenciesSignal.update(current =>
      current.map(agency => agency.id === id ? { ...agency, ...updates } : agency)
    );
    this.persistAgencies();
  }

  deleteAgency(id: string): void {
    this.agenciesSignal.update(current => current.filter(a => a.id !== id));
    this.persistAgencies();
  }

  getAgencyById(id: string): Agency | undefined {
    return this.agenciesSignal().find(a => a.id === id);
  }

  // === CRUD: CONTACTOS ===
  addContact(contact: Omit<Contact, 'id'>): Contact {
    const newContact: Contact = { ...contact, id: this.generateId() };
    this.contactsSignal.update(current => [...current, newContact]);
    this.persistContacts();
    return newContact;
  }

  updateContact(id: string, updates: Partial<Contact>): void {
    this.contactsSignal.update(current =>
      current.map(c => c.id === id ? { ...c, ...updates } : c)
    );
    this.persistContacts();
  }

  deleteContact(id: string): void {
    this.contactsSignal.update(current => current.filter(c => c.id !== id));
    this.persistContacts();
  }

  getContactById(id: string): Contact | undefined {
    return this.contactsSignal().find(c => c.id === id);
  }

  // === CRUD: PROPIEDADES ===
  addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...property,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now
    };
    this.propertiesSignal.update(current => [...current, newProperty]);
    this.persistProperties();
    return newProperty;
  }

  updateProperty(id: string, updates: Partial<Property>): void {
    this.propertiesSignal.update(current =>
      current.map(property =>
        property.id === id
          ? { ...property, ...updates, updatedAt: new Date().toISOString() }
          : property
      )
    );
    this.persistProperties();
  }

  deleteProperty(id: string): void {
    this.propertiesSignal.update(current => current.filter(p => p.id !== id));
    this.persistProperties();
  }

  getPropertyById(id: string): Property | undefined {
    return this.propertiesSignal().find(p => p.id === id);
  }

  // === UTILS ===
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // === MIGRACIÓN: Migrar datos antiguos si existen ===
  private migrateOldData(): void {
    const oldAgencies = localStorage.getItem('inmologic_agencies');
    const oldProperties = localStorage.getItem('inmologic_properties');

    if (oldAgencies && !localStorage.getItem(STORAGE_KEYS.AGENCIES)) {
      localStorage.setItem(STORAGE_KEYS.AGENCIES, oldAgencies);
      localStorage.removeItem('inmologic_agencies');
    }
    if (oldProperties && !localStorage.getItem(STORAGE_KEYS.PROPERTIES)) {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, oldProperties);
      localStorage.removeItem('inmologic_properties');
    }
  }

  clearAll(): void {
    this.agenciesSignal.set([]);
    this.propertiesSignal.set([]);
    this.persistAgencies();
    this.persistProperties();
  }
}