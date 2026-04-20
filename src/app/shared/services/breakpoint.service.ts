import { Injectable, signal, Signal, inject, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const BREAKPOINT_LG = 1024;

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly isDesktop: Signal<boolean>;

  constructor() {
    const isBrowser = isPlatformBrowser(this.platformId);
    const desktop = signal(isBrowser ? window.matchMedia(`(min-width: ${BREAKPOINT_LG}px)`).matches : false);
    this.isDesktop = desktop;

    if (isBrowser) {
      const mql = window.matchMedia(`(min-width: ${BREAKPOINT_LG}px)`);
      const handler = (e: MediaQueryListEvent) => desktop.set(e.matches);
      mql.addEventListener('change', handler);
      this.destroyRef.onDestroy(() => mql.removeEventListener('change', handler));
    }
  }
}