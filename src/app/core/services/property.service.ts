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

    if (this.agenciesSignal().length === 0) {
      this.addAgency({
        nombre: 'Inmobiliaria Madrid Centro',
        direccion: 'Calle Gran Vía 45, Madrid, España',
        tipoRelacion: 'partner-preferente',
        relacion: 4,
        agentes: [
          { id: this.generateId(), nombre: 'María López', telefono: '612345678', whatsapp: '612345678', email: 'maria@inmocentro.es' },
          { id: this.generateId(), nombre: 'Carlos Ruiz', telefono: '698765432', whatsapp: '698765432', email: 'carlos@inmocentro.es' },
          { id: this.generateId(), nombre: 'Ana Fernández', telefono: '655123456', email: 'ana@inmocentro.es' }
        ],
        notas: 'Buena relación, rapidez en respuestas',
        lat: 40.4200,
        lng: -3.7025,
      });

      this.addAgency({
        nombre: 'Pisos Barcelona',
        direccion: 'Passeig de Gràcia 78, Barcelona, España',
        tipoRelacion: 'solo-captacion',
        relacion: 3,
        agentes: [
          { id: this.generateId(), nombre: 'Jordi Martínez', telefono: '634567890', whatsapp: '634567890', email: 'jordi@pisosbcn.es' }
        ],
        notas: 'Especialistas en pisos del Eixample',
        lat: 41.3954,
        lng: 2.1628,
      });

      this.addAgency({
        nombre: 'Costa Inmobiliaria',
        direccion: 'Avenida del Mar 12, Valencia, España',
        tipoRelacion: 'ocasional',
        relacion: 2,
        agentes: [
          { id: this.generateId(), nombre: 'Vicente Soriano', telefono: '611223344', whatsapp: '611223344', email: 'vicente@costainmo.es' },
          { id: this.generateId(), nombre: 'Laura Pérez', telefono: '622334455', email: 'laura@costainmo.es' }
        ],
        notas: 'Buenas oportunidades en la costa',
        lat: 39.4699,
        lng: -0.3763,
      });

      this.addAgency({
        nombre: 'Gestión Inmueble Sevilla',
        direccion: 'Calle Sierpes 22, Sevilla, España',
        tipoRelacion: 'nueva',
        relacion: 1,
        agentes: [],
        notas: 'Primer contacto pendiente',
        lat: 37.3886,
        lng: -5.9823,
      });

      this.addAgency({
        nombre: 'Raíces Bilbao',
        direccion: 'Gran Vía Don Diego López de Haro 30, Bilbao, España',
        tipoRelacion: 'partner-preferente',
        relacion: 5,
        agentes: [
          { id: this.generateId(), nombre: 'Aitor Etxebarria', telefono: '644778899', whatsapp: '644778899', email: 'aitor@raicesbilbao.es' },
          { id: this.generateId(), nombre: 'Leire Goikoetxea', telefono: '655889900', email: 'leire@raicesbilbao.es' },
          { id: this.generateId(), nombre: 'Unai Mendizabal', telefono: '611990011', whatsapp: '611990011' }
        ],
        notas: 'Excelente profesionalidad, muy recomendados',
        lat: 43.2630,
        lng: -2.9350,
      });

      this.addAgency({
        nombre: 'Sol y Piso Málaga',
        direccion: 'Calle Larios 15, Málaga, España',
        tipoRelacion: 'solo-captacion',
        relacion: 3,
        agentes: [
          { id: this.generateId(), nombre: 'Antonio Serrano', telefono: '622112233', whatsapp: '622112233', email: 'antonio@solypiso.es' },
          { id: this.generateId(), nombre: 'Carmen Delgado', telefono: '633223344', email: 'carmen@solypiso.es' }
        ],
        notas: 'Buena Cartera en costa del Sol',
        lat: 36.7213,
        lng: -4.4214,
      });

      this.addAgency({
        nombre: 'Norte Inmuebles Zaragoza',
        direccion: 'Paseo Independencia 50, Zaragoza, España',
        tipoRelacion: 'ocasional',
        relacion: 2,
        agentes: [
          { id: this.generateId(), nombre: 'Rosa Murillo', telefono: '676543210', email: 'rosa@norteinmuebles.es' }
        ],
        notas: 'Ocasionales, buenas oportunidades puntuales',
        lat: 41.6488,
        lng: -0.8891,
      });
    }

    if (this.contactsSignal().length === 0) {
      // Contacto vinculado a Inmobiliaria Madrid Centro
      this.addContact({
        nombre: 'María López',
        tipo: 'gestor',
        telefono: '612345678',
        email: 'maria@inmocentro.es',
        whatsapp: '612345678',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Inmobiliaria Madrid Centro')?.id,
        lastContactDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        notas: 'Agente principal de Madrid Centro, muy profesional',
        notasCafe: 'Le gusta el café con leche descafeinado',
      });

      // Contacto vinculado a la misma agencia
      this.addContact({
        nombre: 'Carlos Ruiz',
        tipo: 'constructor',
        telefono: '698765432',
        whatsapp: '698765432',
        email: 'carlos@inmocentro.es',
        desplazamiento: 'moto',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Inmobiliaria Madrid Centro')?.id,
        lastContactDate: new Date(Date.now() - 12 * 86400000).toISOString(),
        notas: 'Encargado de zonas sur',
      });

      // Contacto vinculado a Pisos Barcelona
      this.addContact({
        nombre: 'Jordi Martínez',
        tipo: 'gestor',
        telefono: '634567890',
        whatsapp: '634567890',
        email: 'jordi@pisosbcn.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Pisos Barcelona')?.id,
        lastContactDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        notas: 'Conoce muy bien el mercado del Eixample',
        notasCafe: 'Café solo siempre',
      });

      // Contacto independiente (sin agencia)
      this.addContact({
        nombre: 'Isabel Navarro',
        tipo: 'notario',
        telefono: '677889900',
        email: 'isabel.navarro@email.com',
        desplazamiento: 'otros',
        lastContactDate: new Date(Date.now() - 20 * 86400000).toISOString(),
        notas: 'Propietaria directa, busca vender piso en Chamberí',
        notasCafe: 'Té verde',
      });

      // Contacto independiente
      this.addContact({
        nombre: 'Pablo García',
        tipo: 'constructor',
        telefono: '644556677',
        whatsapp: '644556677',
        desplazamiento: 'coche',
        notas: 'Inversor potencial, interesado en rentabilidad > 7%',
        notasCafe: 'Café cortado',
      });

      // Contacto vinculado a Costa Inmobiliaria
      this.addContact({
        nombre: 'Vicente Soriano',
        tipo: 'gestor',
        telefono: '611223344',
        whatsapp: '611223344',
        email: 'vicente@costainmo.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Costa Inmobiliaria')?.id,
        lastContactDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        notas: 'Director de Costa Inmobiliaria, buen trato personal',
      });

      // Contacto vinculado a Madrid Centro (3º contacto en la misma agencia)
      this.addContact({
        nombre: 'Ana Fernández',
        tipo: 'arquitecto',
        telefono: '655123456',
        email: 'ana@inmocentro.es',
        desplazamiento: 'moto',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Inmobiliaria Madrid Centro')?.id,
        lastContactDate: new Date(Date.now() - 8 * 86400000).toISOString(),
        notas: 'Gestiona pisos en el barrio de Salamanca',
        notasCafe: 'Café con leche',
      });

      // Contacto vinculado a Costa Inmobiliaria (2º contacto)
      this.addContact({
        nombre: 'Laura Pérez',
        tipo: 'abogado',
        telefono: '622334455',
        email: 'laura@costainmo.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Costa Inmobiliaria')?.id,
        lastContactDate: new Date(Date.now() - 18 * 86400000).toISOString(),
        notas: 'Se ocupa de la zona de la Malvarrosa',
      });

      // Contacto vinculado a Raíces Bilbao (1º)
      this.addContact({
        nombre: 'Aitor Etxebarria',
        tipo: 'gestor',
        telefono: '644778899',
        whatsapp: '644778899',
        email: 'aitor@raicesbilbao.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Raíces Bilbao')?.id,
        lastContactDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        notas: 'Director comercial, muy activo',
        notasCafe: 'Café solo largo',
      });

      // Contacto vinculado a Raíces Bilbao (2º)
      this.addContact({
        nombre: 'Leire Goikoetxea',
        tipo: 'pintor',
        telefono: '655889900',
        email: 'leire@raicesbilbao.es',
        desplazamiento: 'moto',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Raíces Bilbao')?.id,
        lastContactDate: new Date(Date.now() - 6 * 86400000).toISOString(),
        notas: 'Especialista en pisos reformados en Getxo',
        notasCafe: 'Infusión de frutos rojos',
      });

      // Contacto vinculado a Raíces Bilbao (3º)
      this.addContact({
        nombre: 'Unai Mendizabal',
        tipo: 'fontanero',
        telefono: '611990011',
        whatsapp: '611990011',
        desplazamiento: 'otros',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Raíces Bilbao')?.id,
        notas: 'Nuevo en el equipo, en formación',
      });

      // Contacto vinculado a Sol y Piso Málaga (1º)
      this.addContact({
        nombre: 'Antonio Serrano',
        tipo: 'constructor',
        telefono: '622112233',
        whatsapp: '622112233',
        email: 'antonio@solypiso.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Sol y Piso Málaga')?.id,
        lastContactDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        notas: 'Conoce toda la costa occidental',
      });

      // Contacto vinculado a Sol y Piso Málaga (2º)
      this.addContact({
        nombre: 'Carmen Delgado',
        tipo: 'gestor',
        telefono: '633223344',
        email: 'carmen@solypiso.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Sol y Piso Málaga')?.id,
        lastContactDate: new Date(Date.now() - 4 * 86400000).toISOString(),
        notas: 'Gestiona alquileres vacacionales',
        notasCafe: 'Café con leche descafeinado',
      });

      // Contacto vinculado a Norte Inmuebles Zaragoza
      this.addContact({
        nombre: 'Rosa Murillo',
        tipo: 'portero',
        telefono: '676543210',
        email: 'rosa@norteinmuebles.es',
        desplazamiento: 'coche',
        agencyId: this.agenciesSignal().find(a => a.nombre === 'Norte Inmuebles Zaragoza')?.id,
        lastContactDate: new Date(Date.now() - 25 * 86400000).toISOString(),
        notas: 'Contacto antiguo, hay que reactivar',
      });

      // Contacto independiente (sin agencia)
      this.addContact({
        nombre: 'Fernando Ortiz',
        tipo: 'electricista',
        telefono: '699112233',
        whatsapp: '699112233',
        desplazamiento: 'coche',
        notas: 'Propietario de varios locales en Tetuán, posible acuerdo de exclusiva',
        notasCafe: 'Espresso doble',
      });

      // Contacto independiente (sin agencia)
      this.addContact({
        nombre: 'Elena Ruiz',
        tipo: 'abogado',
        telefono: '688334455',
        email: 'elena.ruiz@email.com',
        desplazamiento: 'moto',
        lastContactDate: new Date(Date.now() - 30 * 86400000).toISOString(),
        notas: 'Abogada especializada en derecho inmobiliario, buena referida para contratos',
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