import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { LucideAngularModule, Home, Building2, Users, Briefcase, Plus } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex-1 overflow-y-auto" [class.pb-24]="!isDetailPage()">
        <router-outlet></router-outlet>
      </div>

      @if (!isDetailPage()) {
        <nav class="fixed bottom-4 left-4 right-4 bg-white rounded-[24px] shadow-lg z-50
                    flex items-center justify-around">
          @for (tab of tabs; track tab.path) {
            @if (tab.isCenter) {
              <a [routerLink]="tab.path"
                 class="flex flex-col items-center justify-center -mt-5">
                <div class="w-14 h-14 rounded-full bg-earth flex items-center justify-center shadow-md
                            transition-all duration-200 active:scale-95">
                  <lucide-icon [img]="tab.icon" class="text-white" [size]="24"></lucide-icon>
                </div>
              </a>
            } @else {
              <a [routerLink]="tab.path"
                 routerLinkActive="tab-active"
                 [routerLinkActiveOptions]="{ exact: true }"
                 class="tab-button flex flex-col items-center justify-center py-2 px-2 text-stone
                        transition-all duration-250 ease-in-out">
                <lucide-icon [img]="tab.icon" [size]="22"></lucide-icon>
                <span class="text-[10px] font-medium mt-0.5">{{ tab.label }}</span>
              </a>
            }
          }
        </nav>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }

    .tab-button {
      color: #8B8680;
      transition: all 0.25s ease;
    }

    .tab-button.tab-active {
      color: #1A2E35;
    }

    .tab-button.tab-active lucide-icon {
      color: #1A2E35;
    }

    lucide-icon {
      color: #8B8680;
      transition: color 0.25s ease;
    }
  `]
})
export class MainLayoutComponent {
  private router = inject(Router);

  readonly urlSignal = toSignal(this.router.events, { initialValue: null });
  tabs = [
    { path: '/dashboard', icon: Home, label: 'Home', isCenter: false },
    { path: '/agencies', icon: Building2, label: 'Agencias', isCenter: false },
    { path: '/visitas', icon: Plus, label: '', isCenter: true },
    { path: '/contacts', icon: Users, label: 'Contactos', isCenter: false },
    { path: '/properties', icon: Briefcase, label: 'Propiedades', isCenter: false },
  ];

  isDetailPage = computed(() => {
    const event = this.urlSignal();
    const url = event instanceof NavigationEnd ? event.urlAfterRedirects : '';
    return url.includes('/properties/') && url.split('/').length > 2 && url.split('/')[2] !== '';
  });
}