import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
})
export class AuthPageComponent implements OnInit {
  mode = signal<'login' | 'register'>('login');
  username = '';
  password = '';
  readonly isLogin = computed(() => this.mode() === 'login');

  constructor(private readonly route: ActivatedRoute, private readonly router: Router, public readonly auth: AuthService) {}

  ngOnInit(): void {
    const m = this.route.snapshot.data['mode'];
    this.mode.set(m === 'register' ? 'register' : 'login');
    this.auth.clearError();
  }

  async submit(): Promise<void> {
    const ok = this.isLogin()
      ? await this.auth.login(this.username, this.password)
      : await this.auth.register(this.username, this.password);
    if (ok) {
      this.router.navigateByUrl('/dashboard');
    }
  }
}
