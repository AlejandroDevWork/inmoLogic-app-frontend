import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../core/models/inmo.interface';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { LucideAngularModule, MapPin, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, LucideAngularModule],
  templateUrl: './property-card.component.html',
  host: { style: 'display: block' }
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Output() cardClick = new EventEmitter<Property>();

  iconMapPin = MapPin;
  iconArrowRight = ArrowRight;

  get precioPorMetro(): number {
    if (!this.property.metrosCuadrados || this.property.metrosCuadrados === 0) return 0;
    return this.property.precioPedido / this.property.metrosCuadrados;
  }
}