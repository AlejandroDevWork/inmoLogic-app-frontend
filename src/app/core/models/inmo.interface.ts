/**
 * PropFlow - Professional Real Estate OS
 * Core Domain Models
 */

// ============================================
// AGENCY & CONTACTS
// ============================================
export interface Agency {
  id: string;
  nombre: string;
  direccion?: string;
  mapaUrl?: string;
  logoUrl?: string;
  tipoRelacion: AgencyTipoRelacion;
  relacion: RelacionAgency;
  lastContactDate?: string;
  agentes: Agent[];
  notas?: string;
  lat?: number;
  lng?: number;
}

export type AgencyTipoRelacion = 'partner-preferente' | 'solo-captacion' | 'ocasional' | 'nueva';

export type RelacionAgency = 1 | 2 | 3 | 4 | 5;

export interface Agent {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  notas?: string;
}

// ============================================
// PROPERTY - Inmueble en Proceso de Inversión
// ============================================
export interface PropertyData {
  codigoPostal?: string;
  superficie?: number;
  habitaciones?: number;
  banos?: number;
  aseos?: number;
  planta?: string;
  orientacion?: string;
  ascensor?: boolean;
  anoConstruccion?: number;
  terrazaBalcon?: boolean;
  parkingTrastero?: boolean;
  referenciaCatastral?: string;
  ite?: string;
  derramas?: string;
}

export type AdPortal = 'idealista' | 'fotocasa' | 'pisos' | 'habitaclia' | 'otros';

export interface AdData {
  portal?: AdPortal;
  enlace?: string;
  precioRebajado?: boolean;
  tiempoPublicado?: number;
}

export interface Property {
  id: string;
  direccion: string;
  zona: string;
  precioPedido: number;
  metrosCuadrados?: number;
  imagenUrl?: string;
  estado: PropertyEstado;
  tags: PropertyTag[];
  agencyId?: string;
  contactoReferencia?: string;
  fechaVisita?: string;
  checklist: ChecklistVisita | ChecklistTecnico;
  financials: Financials;
  propertyData?: PropertyData;
  adData?: AdData;
  createdAt: string;
  updatedAt: string;
}

export type PropertyEstado =
  | 'analisis'
  | 'visita'
  | 'oferta'
  | 'arras'
  | 'alquilado';

export type PropertyTag = 'hot-deal' | 'a-reformar' | 'llave-en-mano' | 'oportunidad';

// ============================================
// CHECKLIST VISITA PRO
// ============================================
export interface ChecklistVisita {
  exterior: ChecklistSection;
  interior: ChecklistSection;
  instalaciones: ChecklistSection;
  entorno: ChecklistSection;
}

export interface ChecklistSection {
  id: string;
  nombre: string;
  icono: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  nombre: string;
  estado: ChecklistEstado;
  notas?: string;
}

export type ChecklistEstado = 'bueno' | 'regular' | 'malo' | 'na';
export type AnalisisEstado = 'bien' | 'mal' | 'reparar';

export interface ChecklistTecnico {
  estructura: AnalisisItem[];
  electricidad: AnalisisItem[];
  humedades: AnalisisItem[];
  zonaComun: AnalisisItem[];
}

export interface AnalisisItem {
  id: string;
  nombre: string;
  estado: AnalisisEstado;
  notas?: string;
}

// ============================================
// FINANCIALS - Análisis Financiero
// ============================================
export interface Financials {
  precioCompra: number;
  itp: number;
  notariaGestoria: number;
  reforma: number;
  alquilerEstimado: number;
  comunidad: number;
  ibi: number;
  seguro: number;
  hipoteca?: {
    porcentajeEntrada: number;
    tipoInteres: number;
    plazoAnios: number;
  };
}

// ============================================
// MÉTRICAS COMPUTADAS (Read-only)
// ============================================
export interface PropertyMetrics {
  totalInvestment: number;
  netYield: number;
  cashflow: number;
  capRate: number;
  breakEvenOccupancy: number;
}

// ============================================
// CONTACTOS
// ============================================
export type ContactTipo = 'fontanero' | 'constructor' | 'abogado' | 'portero' | 'notario' | 'electricista' | 'pintor' | 'arquitecto' | 'gestor' | 'otro';

export interface Contact {
  id: string;
  nombre: string;
  tipo?: ContactTipo;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  desplazamiento: 'coche' | 'moto' | 'otros' | '';
  notasCafe?: string;
  agencyId?: string;
  lastContactDate?: string;
  notas?: string;
}

// ============================================
// CRM STATUS
// ============================================
export interface AgencyCrmStatus {
  agency: Agency;
  diasSinContacto: number;
  estado: 'verde' | 'amarillo' | 'rojo';
  necesitaContacto: boolean;
}

export interface ContactCrmStatus {
  contact: Contact;
  diasSinContacto: number;
  estado: 'verde' | 'amarillo' | 'rojo';
  necesitaContacto: boolean;
}

// ============================================
// RECORDATORIO
// ============================================
export interface Reminder {
  id: string;
  tipo: 'llamada' | 'visita' | 'seguimiento';
  titulo: string;
  fecha: string;
  agencyId?: string;
  propertyId?: string;
  completado: boolean;
}

// ============================================
// DOCUMENTO
// ============================================
export interface DocumentItem {
  id: string;
  nombre: string;
  tipo: 'nota-simple' | 'ite' | 'plano' | 'contrato' | 'otro';
  url?: string;
  propertyId?: string;
  createdAt: string;
}