import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { HistoryItem } from '../core/models';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.css',
})
export class HistoryPageComponent implements OnInit {
  readonly allOps = ['compare', 'convert', 'add', 'subtract', 'divide'];
  readonly opColors: Record<string, string> = { compare: '#00e5ff', convert: '#7c3aed', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d' };
  readonly opIcons: Record<string, string> = { compare: '⇔', convert: '↺', add: '+', subtract: '−', divide: '÷' };

  history: HistoryItem[] = [];
  search = '';
  filter = 'all';
  loading = true;

  constructor(private readonly api: ApiService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchHistory();
  }

  async fetchHistory(): Promise<void> {
    this.loading = true;
    try {
      this.history = this.filter === 'all'
        ? await firstValueFrom(this.api.getHistory())
        : await firstValueFrom(this.api.getHistoryByOperation(this.filter));
      this.history = [...this.history].reverse();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  get filtered(): HistoryItem[] {
    if (!this.search) return this.history;
    const s = this.search.toLowerCase();
    return this.history.filter(h =>
      (h.operation?.toLowerCase().includes(s)) ||
      (h.thisUnit?.toLowerCase().includes(s)) ||
      (h.thatUnit?.toLowerCase().includes(s)) ||
      (h.resultString?.toLowerCase().includes(s)) ||
      String(h.thisValue).includes(s) ||
      String(h.thatValue).includes(s)
    );
  }

  get successCount(): number {
    return this.filtered.filter(h => !h.error).length;
  }

  get errorCount(): number {
    return this.filtered.filter(h => h.error).length;
  }

  setFilter(f: string): void {
    this.filter = f;
    this.fetchHistory();
  }

  formatDate(dt: string): string {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  skeletonRows = Array(5).fill(0);
}
