import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { HistoryItem } from '../core/models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  readonly ops = ['compare', 'convert', 'add', 'subtract', 'divide'];
  readonly opIcons: Record<string, string> = { compare: '⇔', convert: '↺', add: '+', subtract: '−', divide: '÷' };
  readonly opColors: Record<string, string> = { compare: '#00e5ff', convert: '#7c3aed', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d' };
  readonly quickActions = [
    { label: 'Convert Length', icon: '📏', path: '/calculator' },
    { label: 'Convert Weight', icon: '⚖️', path: '/calculator' },
    { label: 'Convert Temperature', icon: '🌡️', path: '/calculator' },
    { label: 'Convert Volume', icon: '🧪', path: '/calculator' },
    { label: 'View History', icon: '◎', path: '/history' },
  ];

  counts: Record<string, number> = {};
  recentHistory: HistoryItem[] = [];
  loading = true;

  constructor(private readonly api: ApiService, public readonly auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    try {
      const requests: Record<string, any> = {
        history: this.api.getHistory().pipe(catchError(() => of([]))),
      };
      for (const op of this.ops) {
        requests[op] = this.api.getOperationCount(op).pipe(catchError(() => of(0)));
      }

      const result = await firstValueFrom(forkJoin(requests));
      this.recentHistory = (result['history'] as HistoryItem[]).slice(-5).reverse();
      for (const op of this.ops) {
        this.counts[op] = Number(result[op] ?? 0);
      }
    } finally {
      this.loading = false;
    }
  }

  totalOps(): number {
    return Object.values(this.counts).reduce((a, b) => a + b, 0);
  }

  formatTime(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
