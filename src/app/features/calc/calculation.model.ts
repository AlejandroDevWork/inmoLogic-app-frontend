import { signal, computed } from '@angular/core';

export interface PropertyInfo {
  direccion: string;
  referenciaCatastral: string;
  anoConstruccion: number;
  superficie: number;
  planta: string;
  orientacion: string;
  ascensor: boolean;
  habitaciones: number;
  banos: number;
  aseos: number;
  terrazaBalcon: boolean;
  parkingTrastero: boolean;
  link: string;
  comentarios: string;
  // Cualitativa
  ite: string;
  derramas: string;
  mejorasComunidad: string;
  tipoVecinos: string;
  valoracionZona: string;
  motivoVenta: string;
  suministrosAlta: boolean;
  vendeConMobiliario: boolean;
  quienVende: string;
  porQueVenden: string;
  queBuscaVendedor: string;
  posiblesAcuerdos: string;
}

export interface PurchaseCosts {
  precioInmueble: number;
  descuento: number;
  superficie: number;
  valorReferenciaCatastral: number;
  notarioRegistro: number;
  itpPorcentaje: number;
  comisionCompra: number;
  gastosFinanciacion: number;
  equipoInternoCaptacion: number;
  otrosGastosCompra: number;
  mobiliario: number;
  costeReforma: number;
  ibi: number;
  seguro: number;
  seguroImpago: number;
  comunidad: number;
}

export interface FinancingOption1 {
  interesAnual: number;
  anosAmortizacion: number;
  porcentajeFinanciado: number;
}

export interface FinancingOption2 {
  rentabilidadInversor: number;
  capitalInversor: number;
}

export interface FinancingOption3 {
  interesAnual: number;
  capitalInversor: number;
}

export interface ReformEstimate {
  cocina: number;
  banio: number;
  grifos: number;
  pintar: number;
  alisarParedes: number;
  tarimaSuelo: number;
  luces: number;
  ventanas: number;
  revisionVentanas: number;
  puertas: number;
  persianas: number;
  electricidad: number;
  altaSuministros: number;
  mueblesSalon: number;
  mueblesHabitacion: number;
  electrodomesticos: number;
  imprevistos: number;
  otros: number;
}

export interface RentalComparable {
  direccion: string;
  caracteristicas: string;
  link: string;
  precioAntesReforma: number;
  metros: number;
  precioDespuesReforma: number;
}

export interface SaleComparable {
  direccion: string;
  caracteristicas: string;
  link: string;
  precioAntesReforma: number;
  metros: number;
  precioDespuesReforma: number;
}

export interface CRAEstimates {
  alquilerMensualMin: number;
  alquilerMensualMed: number;
  alquilerMensualMax: number;
  porcentajeOcupacion: number;
  reparacionesAnuales: number;
  seguroImpago: number;
}

export interface CRVEstimates {
  comisionVentaMin: number;
  comisionVentaMed: number;
  comisionVentaMax: number;
  otrosGastosVenta: number;
  estimacionVentaMin: number;
  estimacionVentaMed: number;
  estimacionVentaMax: number;
}

export interface ShortRentalEstimates {
  precioDiaAltaMin: number;
  precioDiaAltaMed: number;
  precioDiaAltaMax: number;
  diasOcupadosAlta: number;
  mesesAlta: number;
  estanciasAlta: number;
  precioDiaMediaMin: number;
  precioDiaMediaMed: number;
  precioDiaMediaMax: number;
  diasOcupadosMedia: number;
  mesesMedia: number;
  estanciasMedia: number;
  precioDiaBajaMin: number;
  precioDiaBajaMed: number;
  precioDiaBajaMax: number;
  diasOcupadosBaja: number;
  mesesBaja: number;
  estanciasBaja: number;
  reparacionesAnuales: number;
  otrosAnual: number;
  limpiezaEstancia: number;
  comisionPlataformas: number;
  comisionGestion: number;
  suministrosMensuales: number;
}

export interface SpacesRentalEstimates {
  inversionAdecuacion: number;
  reparacionesAnuales: number;
  otrosAnual: number;
  gestionPorcentaje: number;
  suministrosMensuales: number;
  precioEspacio1Min: number;
  precioEspacio1Med: number;
  precioEspacio1Max: number;
  numEspacios1: number;
  porcentajeOcupacion: number;
}

export interface MortgageBonus {
  seguroVida: number;
  seguroHogar: number;
  nomina: number;
  tarjetaCredito: number;
  seguroVidaAhorroPct: number;
  seguroHogarAhorroPct: number;
  nominaAhorroPct: number;
  tarjetaAhorroPct: number;
  seguroVidaCosteOtro: number;
  seguroHogarCosteOtro: number;
}

export function createCalculationEngine() {
  // === INPUT SIGNALS ===
  const costs = signal<PurchaseCosts>({
    precioInmueble: 800000,
    descuento: 0,
    superficie: 0,
    valorReferenciaCatastral: 0,
    notarioRegistro: 1500,
    itpPorcentaje: 10,
    comisionCompra: 3000,
    gastosFinanciacion: 0,
    equipoInternoCaptacion: 0,
    otrosGastosCompra: 0,
    mobiliario: 12000,
    costeReforma: 0,
    ibi: 300,
    seguro: 180,
    seguroImpago: 0,
    comunidad: 480,
  });

  const financing1 = signal<FinancingOption1>({
    interesAnual: 3,
    anosAmortizacion: 25,
    porcentajeFinanciado: 90,
  });

  const financing2 = signal<FinancingOption2>({
    rentabilidadInversor: 10,
    capitalInversor: 50000,
  });

  const financing3 = signal<FinancingOption3>({
    interesAnual: 8,
    capitalInversor: 10000,
  });

  const craEstimates = signal<CRAEstimates>({
    alquilerMensualMin: 4400,
    alquilerMensualMed: 4800,
    alquilerMensualMax: 1300,
    porcentajeOcupacion: 0.98,
    reparacionesAnuales: 300,
    seguroImpago: 400,
  });

  const crvEstimates = signal<CRVEstimates>({
    comisionVentaMin: 4537.5,
    comisionVentaMed: 4973.1,
    comisionVentaMax: 5808,
    otrosGastosVenta: 1000,
    estimacionVentaMin: 125000,
    estimacionVentaMed: 137000,
    estimacionVentaMax: 160000,
  });

  const shortRental = signal<ShortRentalEstimates>({
    precioDiaAltaMin: 75, precioDiaAltaMed: 100, precioDiaAltaMax: 120,
    diasOcupadosAlta: 20, mesesAlta: 4, estanciasAlta: 5,
    precioDiaMediaMin: 65, precioDiaMediaMed: 80, precioDiaMediaMax: 100,
    diasOcupadosMedia: 20, mesesMedia: 5, estanciasMedia: 5,
    precioDiaBajaMin: 50, precioDiaBajaMed: 65, precioDiaBajaMax: 80,
    diasOcupadosBaja: 20, mesesBaja: 3, estanciasBaja: 3,
    reparacionesAnuales: 1200, otrosAnual: 400,
    limpiezaEstancia: 50, comisionPlataformas: 0.15,
    comisionGestion: 0, suministrosMensuales: 200,
  });

  const spacesRental = signal<SpacesRentalEstimates>({
    inversionAdecuacion: 5000,
    reparacionesAnuales: 400, otrosAnual: 400,
    gestionPorcentaje: 10, suministrosMensuales: 0,
    precioEspacio1Min: 30, precioEspacio1Med: 40, precioEspacio1Max: 50,
    numEspacios1: 28, porcentajeOcupacion: 11,
  });

  const mortgageBonus = signal<MortgageBonus>({
    seguroVida: 200, seguroHogar: 250, nomina: 0, tarjetaCredito: 30,
    seguroVidaAhorroPct: 0.2, seguroHogarAhorroPct: 0.15,
    nominaAhorroPct: 0.3, tarjetaAhorroPct: 0.05,
    seguroVidaCosteOtro: 150, seguroHogarCosteOtro: 100,
  });

  // === TARGET YIELD ===
  const targetYield = signal<number>(0.08);

  // === COMPUTED: Derived values ===
  const descuento = computed(() => costs().precioInmueble * costs().descuento / 100);
  const precioCompra = computed(() => costs().precioInmueble - descuento());
  const itp = computed(() => precioCompra() * costs().itpPorcentaje / 100);
  const totalGastosCompra = computed(() =>
    costs().notarioRegistro + itp() + costs().comisionCompra +
    costs().gastosFinanciacion + costs().equipoInternoCaptacion + costs().otrosGastosCompra
  );
  const inversionTotal = computed(() =>
    precioCompra() + totalGastosCompra() + costs().mobiliario + costs().costeReforma
  );
  const gastosAnuales = computed(() =>
    costs().ibi + costs().seguro + costs().seguroImpago + costs().comunidad
  );
  const prestamoHipotecario = computed(() =>
    precioCompra() * financing1().porcentajeFinanciado / 100
  );
  const capitalPropio = computed(() => inversionTotal() - prestamoHipotecario());

  // Monthly mortgage payment (French amortization)
  const cuotaMensual = computed(() => {
    const r = financing1().interesAnual / 100 / 12;
    const n = financing1().anosAmortizacion * 12;
    const p = prestamoHipotecario();
    if (r === 0 || n === 0 || p === 0) return 0;
    return p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  });
  const cuotaAnual = computed(() => cuotaMensual() * 12);
  const interesesAnio1 = computed(() => prestamoHipotecario() * financing1().interesAnual / 100);
  const amortizacionAnio1 = computed(() => cuotaAnual() - interesesAnio1());

  // CRA calculations
  const craAlquilerAnual = computed(() => ({
    min: craEstimates().alquilerMensualMin * 12,
    med: craEstimates().alquilerMensualMed * 12,
    max: craEstimates().alquilerMensualMax * 12,
  }));
  const craIngresosAnuales = computed(() => ({
    min: craAlquilerAnual().min * craEstimates().porcentajeOcupacion,
    med: craAlquilerAnual().med * craEstimates().porcentajeOcupacion,
    max: craAlquilerAnual().max * craEstimates().porcentajeOcupacion,
  }));
  const craGastosTotales = computed(() =>
    gastosAnuales() + craEstimates().reparacionesAnuales + craEstimates().seguroImpago
  );
  const craBeneficioBruto = computed(() => ({
    min: craIngresosAnuales().min - craGastosTotales(),
    med: craIngresosAnuales().med - craGastosTotales(),
    max: craIngresosAnuales().max - craGastosTotales(),
  }));
  const craRentabilidadBruta = computed(() => ({
    min: craAlquilerAnual().min / inversionTotal(),
    med: craAlquilerAnual().med / inversionTotal(),
    max: craAlquilerAnual().max / inversionTotal(),
  }));
  const craRentabilidadNeta = computed(() => ({
    min: craBeneficioBruto().min / inversionTotal(),
    med: craBeneficioBruto().med / inversionTotal(),
    max: craBeneficioBruto().max / inversionTotal(),
  }));
  const craBeneficioDespuesFinanciacion = computed(() => ({
    min: craBeneficioBruto().min - cuotaAnual(),
    med: craBeneficioBruto().med - cuotaAnual(),
    max: craBeneficioBruto().max - cuotaAnual(),
  }));
  const craROE = computed(() => ({
    min: craBeneficioDespuesFinanciacion().min / capitalPropio(),
    med: craBeneficioDespuesFinanciacion().med / capitalPropio(),
    max: craBeneficioDespuesFinanciacion().max / capitalPropio(),
  }));
  const craCashflowCapital = computed(() => ({
    min: craBeneficioDespuesFinanciacion().min / capitalPropio(),
    med: craBeneficioDespuesFinanciacion().med / capitalPropio(),
    max: craBeneficioDespuesFinanciacion().max / capitalPropio(),
  }));

  // CRV calculations
  const crvBeneficioBruto = computed(() => ({
    min: crvEstimates().estimacionVentaMin - inversionTotal() - crvEstimates().comisionVentaMin - crvEstimates().otrosGastosVenta,
    med: crvEstimates().estimacionVentaMed - inversionTotal() - crvEstimates().comisionVentaMed - crvEstimates().otrosGastosVenta,
    max: crvEstimates().estimacionVentaMax - inversionTotal() - crvEstimates().comisionVentaMax - crvEstimates().otrosGastosVenta,
  }));
  const crvRentabilidad = computed(() => ({
    min: crvBeneficioBruto().min / inversionTotal(),
    med: crvBeneficioBruto().med / inversionTotal(),
    max: crvBeneficioBruto().max / inversionTotal(),
  }));

  // Comparativa
  const comparativa = computed(() => ({
    rentabilidadAnual: {
      crv: { min: crvRentabilidad().min, med: crvRentabilidad().med, max: crvRentabilidad().max },
      cra: { min: craRentabilidadNeta().min, med: craRentabilidadNeta().med, max: craRentabilidadNeta().max },
    },
    beneficiosDespuesFinanciacion: {
      crv: { min: crvBeneficioBruto().min - cuotaAnual(), med: crvBeneficioBruto().med - cuotaAnual(), max: crvBeneficioBruto().max - cuotaAnual() },
      cra: { min: craBeneficioDespuesFinanciacion().min, med: craBeneficioDespuesFinanciacion().med, max: craBeneficioDespuesFinanciacion().max },
    },
  }));

  // Reform estimate totals
  const reforma = signal<ReformEstimate>({
    cocina: 6000, banio: 1700, grifos: 0, pintar: 1540,
    alisarParedes: 3850, tarimaSuelo: 2800, luces: 380,
    ventanas: 650, revisionVentanas: 250, puertas: 900,
    persianas: 120, electricidad: 600, altaSuministros: 600,
    mueblesSalon: 0, mueblesHabitacion: 0, electrodomesticos: 800,
    imprevistos: 600, otros: 500,
  });
  const reformaTotal = computed(() =>
    reforma().cocina + reforma().banio + reforma().grifos + reforma().pintar +
    reforma().alisarParedes + reforma().tarimaSuelo + reforma().luces +
    reforma().ventanas + reforma().revisionVentanas + reforma().puertas +
    reforma().persianas + reforma().electricidad + reforma().altaSuministros +
    reforma().mueblesSalon + reforma().mueblesHabitacion + reforma().electrodomesticos +
    reforma().imprevistos + reforma().otros
  );

  // Mortgage bonus
  const bonificaciones = computed(() => {
    const hp = prestamoHipotecario();
    const mb = mortgageBonus();
    return {
      seguroVida: { ahorroPct: mb.seguroVidaAhorroPct, ahorroEuros: hp * mb.seguroVidaAhorroPct, costeOtro: mb.seguroVidaCosteOtro },
      seguroHogar: { ahorroPct: mb.seguroHogarAhorroPct, ahorroEuros: hp * mb.seguroHogarAhorroPct, costeOtro: mb.seguroHogarCosteOtro },
      nomina: { ahorroPct: mb.nominaAhorroPct, ahorroEuros: hp * mb.nominaAhorroPct, costeOtro: 0 },
      tarjeta: { ahorroPct: mb.tarjetaAhorroPct, ahorroEuros: hp * mb.tarjetaAhorroPct, costeOtro: 0 },
    };
  });

  // Short rental computations
  const srIngresoAltaMin = computed(() => shortRental().precioDiaAltaMin * shortRental().diasOcupadosAlta * shortRental().mesesAlta);
  const srIngresoAltaMax = computed(() => shortRental().precioDiaAltaMax * shortRental().diasOcupadosAlta * shortRental().mesesAlta);
  const srIngresoMediaMin = computed(() => shortRental().precioDiaMediaMin * shortRental().diasOcupadosMedia * shortRental().mesesMedia);
  const srIngresoMediaMax = computed(() => shortRental().precioDiaMediaMax * shortRental().diasOcupadosMedia * shortRental().mesesMedia);
  const srIngresoBajaMin = computed(() => shortRental().precioDiaBajaMin * shortRental().diasOcupadosBaja * shortRental().mesesBaja);
  const srIngresoBajaMax = computed(() => shortRental().precioDiaBajaMax * shortRental().diasOcupadosBaja * shortRental().mesesBaja);
  const srIngresoAnualBrutoMin = computed(() => srIngresoAltaMin() + srIngresoMediaMin() + srIngresoBajaMin());
  const srIngresoAnualBrutoMax = computed(() => srIngresoAltaMax() + srIngresoMediaMax() + srIngresoBajaMax());
  const srComisionPlataformas = computed(() => srIngresoAnualBrutoMin() * shortRental().comisionPlataformas);
  const srComisionGestion = computed(() => srIngresoAnualBrutoMin() * shortRental().comisionGestion);
  const srLimpiezaTotal = computed(() => {
    const sr = shortRental();
    const totalEstancias = (sr.estanciasAlta || 0) + (sr.estanciasMedia || 0);
    return totalEstancias * sr.limpiezaEstancia;
  });
  const srSuministrosAnuales = computed(() => shortRental().suministrosMensuales * 12);
  const srGastosAnuales = computed(() =>
    shortRental().reparacionesAnuales + shortRental().otrosAnual +
    srComisionPlataformas() + srComisionGestion() + srLimpiezaTotal() + srSuministrosAnuales()
  );
  const srBeneficioNetoMin = computed(() => srIngresoAnualBrutoMin() - srGastosAnuales());
  const srBeneficioNetoMax = computed(() => srIngresoAnualBrutoMax() - srGastosAnuales());
  const srRentabilidadNetaMin = computed(() => srBeneficioNetoMin() / (inversionTotal() || 1));
  const srRentabilidadNetaMax = computed(() => srBeneficioNetoMax() / (inversionTotal() || 1));

  // Spaces rental computations
  const spIngresoMensual = computed(() =>
    spacesRental().precioEspacio1Med * spacesRental().numEspacios1 * (spacesRental().porcentajeOcupacion / 100)
  );
  const spIngresoAnual = computed(() => spIngresoMensual() * 12);
  const spGastosAnuales = computed(() =>
    spacesRental().reparacionesAnuales + spacesRental().otrosAnual +
    (spIngresoAnual() * spacesRental().gestionPorcentaje / 100) +
    (spacesRental().suministrosMensuales * 12)
  );
  const spBeneficioAnual = computed(() => spIngresoAnual() - spGastosAnuales());
  const spRentabilidad = computed(() => (spIngresoAnual() - spGastosAnuales()) / (inversionTotal() + spacesRental().inversionAdecuacion || 1));

  // Reform tiers (price per m2 for low/media/lujo)
  const reformaTiers = signal({ lowM2: 0, mediaM2: 0, lujoM2: 0 });
  const reformaLow = computed(() => reformaTiers().lowM2 * costs().superficie);
  const reformaMedia = computed(() => reformaTiers().mediaM2 * costs().superficie);
  const reformaLujo = computed(() => reformaTiers().lujoM2 * costs().superficie);

  // Financing option 2 (Gestión) derived
  const capitalPropioGestion = computed(() => inversionTotal() - financing2().capitalInversor);

  // Financing option 3 (Interés fijo/variable) derived
  const interesesAnualesOpcion3 = computed(() => financing3().capitalInversor * financing3().interesAnual / 100);
  const capitalPropioOpcion3 = computed(() => inversionTotal() - financing3().capitalInversor);

  // Max purchase price helpers
  const gastosFijosSinITP = computed(() =>
    costs().notarioRegistro + costs().comisionCompra +
    costs().gastosFinanciacion + costs().equipoInternoCaptacion +
    costs().otrosGastosCompra + costs().mobiliario + costs().costeReforma
  );
  const precioInmuebleFactor = computed(() =>
    1 - costs().descuento / 100 + costs().itpPorcentaje / 100
  );

  // CRA: max purchase price for long-term rental profitability
  const craPrecioMaximoCompra = computed(() => {
    const ty = targetYield() || 0.0001;
    const fix = gastosFijosSinITP();
    const factor = precioInmuebleFactor() || 0.0001;
    return {
      min: (craBeneficioBruto().min / ty - fix) / factor,
      med: (craBeneficioBruto().med / ty - fix) / factor,
      max: (craBeneficioBruto().max / ty - fix) / factor,
    };
  });

  // CRV: max purchase price for sale/revaluation profitability
  const crvPrecioMaximoCompra = computed(() => {
    const ty = targetYield() || 0.0001;
    const fix = gastosFijosSinITP();
    const factor = precioInmuebleFactor() || 0.0001;
    const crv = crvEstimates();
    return {
      min: ((crv.estimacionVentaMin - crv.comisionVentaMin - crv.otrosGastosVenta) / (1 + ty) - fix) / factor,
      med: ((crv.estimacionVentaMed - crv.comisionVentaMed - crv.otrosGastosVenta) / (1 + ty) - fix) / factor,
      max: ((crv.estimacionVentaMax - crv.comisionVentaMax - crv.otrosGastosVenta) / (1 + ty) - fix) / factor,
    };
  });

  // Short rental: max purchase price
  const srPrecioMaximoCompra = computed(() => {
    const ty = targetYield() || 0.0001;
    const fix = gastosFijosSinITP();
    const factor = precioInmuebleFactor() || 0.0001;
    return {
      min: (srBeneficioNetoMin() / ty - fix) / factor,
      med: (((srBeneficioNetoMin() + srBeneficioNetoMax()) / 2) / ty - fix) / factor,
      max: (srBeneficioNetoMax() / ty - fix) / factor,
    };
  });

  // Space rental: max purchase price (single value)
  const spPrecioMaximoCompra = computed(() => {
    const ty = targetYield() || 0.0001;
    const fix = gastosFijosSinITP();
    const factor = precioInmuebleFactor() || 0.0001;
    const maxInversionTotal = spBeneficioAnual() / ty;
    const maxInversion = maxInversionTotal - spacesRental().inversionAdecuacion;
    return (maxInversion - fix) / factor;
  });

  // Price per m2
  const precioM2 = computed(() => costs().precioInmueble / (costs().superficie || 1));
  const gastosCompraM2 = computed(() => totalGastosCompra() / (costs().superficie || 1));
  const porcentajeGastosCompra = computed(() => totalGastosCompra() / (costs().precioInmueble || 1));

  return {
    costs, financing1, financing2, financing3, craEstimates, crvEstimates,
    shortRental, spacesRental, mortgageBonus, reforma, reformaTiers,
    targetYield,
    // Derived
    descuento, precioCompra, itp, totalGastosCompra, inversionTotal,
    gastosAnuales, prestamoHipotecario, capitalPropio,
    cuotaMensual, cuotaAnual, interesesAnio1, amortizacionAnio1,
    craAlquilerAnual, craIngresosAnuales, craGastosTotales,
    craBeneficioBruto, craRentabilidadBruta, craRentabilidadNeta,
    craBeneficioDespuesFinanciacion, craROE, craCashflowCapital,
    crvBeneficioBruto, crvRentabilidad,
    comparativa, reformaTotal, bonificaciones,
    // Max purchase price
    gastosFijosSinITP, precioInmuebleFactor,
    craPrecioMaximoCompra, crvPrecioMaximoCompra,
    srPrecioMaximoCompra, spPrecioMaximoCompra,
    // Reform tiers
    reformaLow, reformaMedia, reformaLujo,
    // Financing option 2 & 3
    capitalPropioGestion, interesesAnualesOpcion3, capitalPropioOpcion3,
    // Short rental derived
    srIngresoAltaMin, srIngresoAltaMax,
    srIngresoMediaMin, srIngresoMediaMax,
    srIngresoBajaMin, srIngresoBajaMax,
    srIngresoAnualBrutoMin, srIngresoAnualBrutoMax,
    srComisionPlataformas, srComisionGestion,
    srLimpiezaTotal, srSuministrosAnuales, srGastosAnuales,
    srBeneficioNetoMin, srBeneficioNetoMax,
    srRentabilidadNetaMin, srRentabilidadNetaMax,
    // Spaces rental derived
    spIngresoMensual, spIngresoAnual, spGastosAnuales,
    spBeneficioAnual, spRentabilidad,
    // Price per m2
    precioM2, gastosCompraM2, porcentajeGastosCompra,
  };
}

export type CalculationEngine = ReturnType<typeof createCalculationEngine>;