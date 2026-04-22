import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeocodingService, GeocodingResult } from '../../services/geocoding.service';
import { LucideAngularModule, MapPin, Search } from 'lucide-angular';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './address-autocomplete.component.html',
})
export class AddressAutocompleteComponent {
  @Input() placeholder = 'Buscar dirección...';
  @Input() initialValue = '';
  @Output() addressSelected = new EventEmitter<{ address: string; lat: number; lng: number }>();

  geocoding = inject(GeocodingService);

  searchText = '';
  results = signal<GeocodingResult[]>([]);
  showDropdown = signal(false);
  searching = signal(false);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  iconSearch = Search;
  iconPin = MapPin;

  ngOnInit(): void {
    if (this.initialValue) {
      this.searchText = this.initialValue;
    }
  }

  onInput(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (this.searchText.length < 3) {
      this.results.set([]);
      this.showDropdown.set(false);
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.search();
    }, 300);
  }

  onFocus(): void {
    if (this.results().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  private search(): void {
    this.searching.set(true);
    this.geocoding.search(this.searchText).subscribe(results => {
      this.results.set(results);
      this.showDropdown.set(true);
      this.searching.set(false);
    });
  }

  selectResult(result: GeocodingResult): void {
    const address = this.geocoding.formatAddress(result);
    this.searchText = address;
    this.showDropdown.set(false);
    this.addressSelected.emit({ address, lat: result.lat, lng: result.lng });
  }
}