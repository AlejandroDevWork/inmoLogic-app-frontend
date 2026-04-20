import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeocodingService, GeocodingResult } from '../../services/geocoding.service';
import { LucideAngularModule, MapPin, Search } from 'lucide-angular';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="relative">
      <div class="relative">
        <lucide-icon [img]="iconSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" [size]="14"></lucide-icon>
        <input type="text"
               [placeholder]="placeholder"
               [(ngModel)]="searchText"
               (input)="onInput()"
               (focus)="onFocus()"
               (blur)="onBlur()"
               class="w-full pl-9 pr-3 py-2.5 bg-sand/30 rounded-[14px]
                      text-sm text-petrol placeholder:text-stone/30
                      border border-warm-border focus:border-earth
                      focus:outline-none transition-colors" />
      </div>

      @if (showDropdown() && results().length > 0) {
        <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-[14px] border border-warm-border shadow-lg z-[100] overflow-hidden">
          @for (result of results(); track result.lat + '-' + result.lng) {
            <button (mousedown)="selectResult(result)"
                    class="w-full flex items-start gap-2.5 px-3 py-2.5 text-left
                           hover:bg-sand/30 transition-colors border-b border-cream last:border-b-0">
              <lucide-icon [img]="iconPin" class="text-earth mt-0.5 shrink-0" [size]="14"></lucide-icon>
              <p class="text-sm text-petrol truncate">{{ geocoding.formatAddress(result) }}</p>
            </button>
          }
        </div>
      }

      @if (showDropdown() && searching()) {
        <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-[14px] border border-warm-border shadow-lg z-[100] p-3 text-center">
          <p class="text-xs text-stone">Buscando...</p>
        </div>
      }
    </div>
  `
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