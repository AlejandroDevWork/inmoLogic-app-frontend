import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, Building2, ClipboardCheck, Users, Briefcase, Plus } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="fixed left-0 top-0 bottom-0 w-56 bg-petrol z-40 flex flex-col border-r border-petrol-light/30 overflow-y-auto">

      <!-- Brand -->
      <div class="px-6 py-5 flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-[10px] bg-earth flex items-center justify-center">
          <lucide-icon [img]="BriefcaseIcon" class="text-white" [size]="16"></lucide-icon>
        </div>
        <span class="text-lg font-bold text-white tracking-tight">PropFlow</span>
      </div>

      <!-- Nav items -->
      <nav class="flex-1 px-3 py-2 space-y-1">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="sidebar-item-active"
             [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
             class="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-cream/70
                    transition-all duration-200 hover:bg-petrol-light/20 hover:text-cream">
            <lucide-icon [img]="item.icon" [size]="20"></lucide-icon>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- Visitas action button -->
      <div class="px-3 pb-4">
        <a [routerLink]="'/visitas'"
           class="flex items-center justify-center gap-2 w-full py-2.5 rounded-[14px]
                  bg-earth text-white text-sm font-semibold
                  transition-all duration-200 hover:bg-earth-dark active:scale-95">
          <lucide-icon [img]="iconPlus" [size]="18"></lucide-icon>
          <span>Nueva Visita</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-item-active {
      background-color: rgba(42, 74, 85, 0.4);
      color: #FFFFFF !important;
    }
    .sidebar-item-active lucide-icon {
      color: #FFFFFF !important;
    }
    .sidebar-item lucide-icon {
      color: rgba(253, 252, 249, 0.7);
      transition: color 0.2s ease;
    }
  `]
})
export class SidebarComponent {
  readonly BriefcaseIcon = Briefcase;
  readonly iconPlus = Plus;

  navItems = [
    { path: '/dashboard', icon: Home, label: 'Home', exact: true },
    { path: '/agencies', icon: Building2, label: 'Agencias', exact: true },
    { path: '/contacts', icon: Users, label: 'Contactos', exact: true },
    { path: '/properties', icon: Briefcase, label: 'Propiedades', exact: false },
  ];
}