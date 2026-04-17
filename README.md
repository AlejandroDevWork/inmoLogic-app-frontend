# inmoLogic - Professional Real Estate OS

Plataforma personal de inversión inmobiliaria construida con **Angular 20**, **Ionic**, **Tailwind CSS** y **Signals**.

## Arquitectura

```
src/app/
├── core/                      # Lógica de negocio y modelos
│   ├── models/
│   │   └── inmo.interface.ts  # Domain models (Agency, Property, Financials)
│   ├── services/
│   │   └── property.service.ts # Estado reactivo con Signals
│   └── core.ts                # Barrel export
├── features/                  # Módulos de negocio
│   ├── analysis/
│   │   └── property-analysis.component.ts  # Calculadora financiera + Checklist
│   └── dashboard/
│       └── dashboard.component.ts          # Métricas y CRM alerts
├── shared/                    # UI Components atómicos
│   ├── components/
│   │   ├── app-input/
│   │   ├── app-card/
│   │   └── app-button/
│   └── shared-components.ts   # Barrel export
└── home/                      # Página de inicio (Ionic)
```

## Stack Técnico

| Tecnología | Versión |
|------------|---------|
| Angular | 20.0.0 |
| Ionic | 8.0.0 |
| Tailwind CSS | 4.2.2 |
| TypeScript | 5.9.0 |

## Características

### 1. PropertyService con Signals
- **writable signals** para estado reactivo de properties y agencies
- **computed signals** para métricas en tiempo real
- **Persistencia** en LocalStorage
- **CRM automático**: Semáforo de agencias (verde/amarillo/rojo) según días sin contacto

### 2. Calculadora Financiera (PropertyAnalysis)
**Métricas computadas:**
- `totalInvestment` = precio + ITP + notaría + reforma
- `netYield` = ((alquiler × 12) - gastos anuales) / inversión × 100
- `cashflow` = alquiler - gastos - hipoteca

**Checklist Técnico:**
- 4 categorías: Estructura, Electricidad, Humedades, Zona Común
- Radio buttons: Bien / Mal / Reparar
- Notas por ítem

### 3. Dashboard Inversionista
- **Cards de métricas**: Total oportunidades, ROI medio, Cashflow total
- **Alertas CRM**: Agencias que necesitan contacto (>7 días amarillo, >15 días rojo)
- **Pipeline de inversión**: Contador por estado (búsqueda, visita, oferta, arras, alquilado)

## Diseño "Private Banking"

Paleta de colores premium:
- Background: `bg-slate-50`
- Texto: `text-slate-900`
- Primario: `blue-950`
- Bordes: `slate-200`, `slate-300`
- Sombras: `shadow-sm`, `shadow-md`

## Comandos

```bash
# Desarrollo
npm start

# Build producción
npm run build

# Testing
npm test
```

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/dashboard` | DashboardComponent | Vista general de cartera |
| `/analysis` | PropertyAnalysisComponent | Calculadora y checklist |

## Persistencia

Los datos se guardan en LocalStorage:
- `inmologic_agencies`: Array de Agency
- `inmologic_properties`: Array de Property

## Próximas Features

- [ ] Exportar informe PDF
- [ ] Integración con APIs inmobiliarias
- [ ] Subida de fotos y documentos
- [ ] Modo oscuro
- [ ] Multi-usuario

---

**Construido con ❤️ para inversores inmobiliarios profesionales**
