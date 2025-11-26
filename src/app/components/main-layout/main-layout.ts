import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    CommonModule,
    NgClass,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayoutComponent {
  
  sidebarOpen = true; 
  isDesktopCollapsed = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleDesktopSidebar() {
    this.isDesktopCollapsed = !this.isDesktopCollapsed;
  }
}