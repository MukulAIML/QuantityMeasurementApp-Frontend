import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserSession } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<UserSession | null>(this.loadSession());
  readonly session = computed(() => this.sessionSignal());
  readonly user = computed(() => this.sessionSignal()?.username ?? null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly api: ApiService, private readonly router: Router) {}

  isAuthenticated(): boolean {
    return !!this.token();
  }

  clearError(): void {
    this.error.set(null);
  }

  async login(username: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.login(username, password));
      this.setSession(res?.username ?? username, res?.token ?? '');
      return true;
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Invalid credentials');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async register(username: string, password: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.register(username, password));
      this.setSession(res?.username ?? username, res?.token ?? '');
      return true;
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Registration failed. Username may already exist.');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  logout(redirect = true): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.sessionSignal.set(null);
    if (redirect) {
      this.router.navigateByUrl('/login');
    }
  }

  private setSession(username: string, token: string): void {
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    this.sessionSignal.set({ username, token });
  }

  private loadSession(): UserSession | null {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    return username && token ? { username, token } : null;
  }
}
