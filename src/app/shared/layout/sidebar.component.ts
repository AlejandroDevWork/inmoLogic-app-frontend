import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Home, Building2, ClipboardCheck, Users, Briefcase, Plus } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
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