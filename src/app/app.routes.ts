import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // ============= AUTH LAYOUT =============
  {
    path: 'auth',
    loadComponent: () =>
      import('./components/auth-layout/auth-layout').then(
        m => m.AuthLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'signin',
        pathMatch: 'full',
      },
      {
        path: 'signin',
        loadComponent: () =>
          import('./features/auth/signin/signin').then(m => m.SigninComponent),
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup/signup').then(m => m.SignupComponent),
      },
    ],
  },

  // ============= MAIN LAYOUT (PROTECTED) =============
  {
    path: '',
    loadComponent: () =>
      import('./components/main-layout/main-layout').then(
        m => m.MainLayoutComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },

      // ---- HOME (dashboard) ----
      {
        path: 'home',
        loadComponent: () => import('./home/home').then(m => m.Home),
      },

      // ---- CONTENT (pages / posts / banners) ----
      {
        path: 'content',
        loadComponent: () =>
          import('./content/content').then(m => m.Content),
        children: [
          {
            path: '',
            redirectTo: 'pages',
            pathMatch: 'full',
          },
          {
            path: 'pages',
            loadComponent: () =>
              import('./content/pages/pages').then(m => m.PagesComponent),
          },
          {
            path: 'posts',
            loadComponent: () =>
              import('./content/posts/post').then(m => m.PostsComponent),
          },
          {
            path: 'banners',
            loadComponent: () =>
              import('./content/banners/banner').then(m => m.BannersComponent),
          },
        ],
      },

      // ---- ACTIVITY LOG (separate menu, same level as Home) ----
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./activity-log/activity-log').then(
            m => m.ActivityLogComponent
          ),
      },

      // ---- ARCHIVES PAGE (NEW) ----
      {
        path: 'content/archives',
        loadComponent: () =>
          import('./archived/archive').then(m => m.ArchivesComponent), // ⭐ IMPORTANT: ./archived/archive (NO .component)
      },
    ],
  },

  // ============= FALLBACK =============
  {
    path: '**',
    redirectTo: 'auth/signin',
  },
];
