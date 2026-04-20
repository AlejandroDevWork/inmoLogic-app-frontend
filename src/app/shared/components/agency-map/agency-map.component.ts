import { Component, Input, OnDestroy, signal, afterNextRender, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Agency } from '../../../core/models/inmo.interface';
import * as L from 'leaflet';

const defaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [18, 30],
  iconAnchor: [9, 30],
  popupAnchor: [0, -25],
  shadowSize: [30, 30]
});
L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-agency-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative z-[1]">
      <!-- Layer switcher -->
      <div class="absolute top-3 right-3 z-[1000] flex gap-1.5">
        @for (layer of layers; track layer.key) {
          <button (click)="switchLayer(layer.key)"
                  class="px-2.5 py-1.5 rounded-[10px] text-[11px] font-medium
                         transition-all duration-200 shadow-sm"
                  [class]="activeLayer() === layer.key
                    ? 'bg-petrol text-white'
                    : 'bg-white/90 text-stone border border-warm-border hover:bg-white'">
            {{ layer.label }}
          </button>
        }
      </div>
      <div [id]="mapId" class="w-full"
           [class]="fullHeight ? 'h-full' : 'h-[300px] lg:h-[400px]'"></div>
    </div>
  `
})
export class AgencyMapComponent implements OnDestroy {
  @Input({ required: true }) agencies: Agency[] = [];
  @Input() fullHeight = false;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private tileLayers: Record<string, L.TileLayer> = {};
  activeLayer = signal('mapa');
  readonly mapId = 'agency-map-' + Math.random().toString(36).substring(2, 9);

  layers = [
    { key: 'mapa', label: 'Mapa' },
    { key: 'satelite', label: 'Satélite' },
    { key: 'relieve', label: 'Relieve' },
  ];

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.updateMarkers();
    });

    effect(() => {
      this.updateMarkers();
    });
  }

  private initMap(): void {
    this.map = L.map(this.mapId, {
      center: [40.0, -3.7],
      zoom: 6,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false
    });

    this.tileLayers['mapa'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    this.tileLayers['satelite'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    this.tileLayers['relieve'] = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    this.tileLayers['mapa'].addTo(this.map);
  }

  switchLayer(key: string): void {
    if (!this.map || key === this.activeLayer()) return;

    Object.values(this.tileLayers).forEach(l => this.map!.removeLayer(l));
    this.tileLayers[key].addTo(this.map);
    this.activeLayer.set(key);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.markers.forEach(m => m.remove());
    this.markers = [];

    const validAgencies = this.agencies.filter(a => a.lat != null && a.lng != null);
    if (validAgencies.length === 0) return;

    const bounds: L.LatLngBounds = L.latLngBounds([]);

    for (const agency of validAgencies) {
      const latlng = L.latLng(agency.lat!, agency.lng!);
      bounds.extend(latlng);

      const marker = L.marker(latlng).addTo(this.map!);
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:140px">
          <strong style="font-size:13px">${agency.nombre}</strong>
          ${agency.direccion ? `<br/><span style="font-size:11px;color:#8B8680">${agency.direccion}</span>` : ''}
        </div>
      `);
      this.markers.push(marker);
    }

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}