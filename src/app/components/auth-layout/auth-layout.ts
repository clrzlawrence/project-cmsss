import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <div class="auth-layout">
      <app-header [showProfile]="false" />
      <main class="auth-main">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent {}