import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeocodingResult {
  display_name: string;
  lat: number;
  lng: number;
}

interface LocationIQResult {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  constructor(private http: HttpClient) {}

  search(query: string): Observable<GeocodingResult[]> {
    const params = {
      key: environment.locationiqKey,
      q: query,
      format: 'json',
      limit: '5',
      countrycodes: 'es',
      'accept-language': 'es',
      addressdetails: '1'
    };

    return new Observable<GeocodingResult[]>(subscriber => {
      this.http.get<LocationIQResult[]>('https://eu1.locationiq.com/v1/autocomplete', { params }).subscribe({
        next: (res) => {
          const results: GeocodingResult[] = (res || []).map(r => ({
            display_name: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          }));
          subscriber.next(results);
          subscriber.complete();
        },
        error: () => {
          subscriber.next([]);
          subscriber.complete();
        }
      });
    });
  }

  formatAddress(r: GeocodingResult): string {
    return r.display_name;
  }
}