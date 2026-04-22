import { Component, inject, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { LucideAngularModule, Home, Building2, Users, Briefcase, Plus } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { BreakpointService } from '../services/breakpoint.service';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    SidebarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  private router = inject(Router);
  private breakpointService = inject(BreakpointService);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  readonly urlSignal = toSignal(this.router.events, { initialValue: null });
  readonly isDesktop = this.breakpointService.isDesktop;

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.scrollContainer?.nativeElement.scrollTo(0, 0);
    });
  }

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