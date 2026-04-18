import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HistoryItem } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  register(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http.post<{ token: string; username: string }>('/auth/register', { username, password });
  }

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http.post<{ token: string; username: string }>('/auth/login', { username, password });
  }

  compareQuantities(v1: string, u1: string, t1: string, v2: string, u2: string, t2: string): Observable<any> {
    return this.http.post('/api/v1/quantities/compare', this.buildPayload(v1, u1, t1, v2, u2, t2));
  }

  convertQuantity(value: string, fromUnit: string, type: string, toUnit: string): Observable<any> {
    return this.http.post('/api/v1/quantities/convert', this.buildPayload(value, fromUnit, type, '0', toUnit, type));
  }

  addQuantities(v1: string, u1: string, t1: string, v2: string, u2: string, t2: string): Observable<any> {
    return this.http.post('/api/v1/quantities/add', this.buildPayload(v1, u1, t1, v2, u2, t2));
  }

  subtractQuantities(v1: string, u1: string, t1: string, v2: string, u2: string, t2: string): Observable<any> {
    return this.http.post('/api/v1/quantities/subtract', this.buildPayload(v1, u1, t1, v2, u2, t2));
  }

  divideQuantities(v1: string, u1: string, t1: string, v2: string, u2: string, t2: string): Observable<any> {
    return this.http.post('/api/v1/quantities/divide', this.buildPayload(v1, u1, t1, v2, u2, t2));
  }

  getHistory(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>('/api/v1/quantities/history');
  }

  getHistoryByOperation(operation: string): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`/api/v1/quantities/history/${operation}`);
  }

  getOperationCount(operation: string): Observable<number> {
    return this.http.get<number>(`/api/v1/quantities/count/${operation}`);
  }

  private buildPayload(value1: string, unit1: string, type1: string, value2 = '0', unit2 = unit1, type2 = type1) {
    return {
      thisQuantityDTO: { value: Number.parseFloat(value1), unit: unit1, measurementType: type1 },
      thatQuantityDTO: { value: Number.parseFloat(value2), unit: unit2, measurementType: type2 },
    };
  }
}
