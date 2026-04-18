import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth.guards';
import { LayoutComponent } from './layout/layout.component';
import { AuthPageComponent } from './pages/auth-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { CalculatorPageComponent } from './pages/calculator-page.component';
import { HistoryPageComponent } from './pages/history-page.component';

export const routes: Routes = [
  { path: 'login', component: AuthPageComponent, canActivate: [publicOnlyGuard], data: { mode: 'login' } },
  { path: 'register', component: AuthPageComponent, canActivate: [publicOnlyGuard], data: { mode: 'register' } },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'calculator', component: CalculatorPageComponent },
      { path: 'history', component: HistoryPageComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
