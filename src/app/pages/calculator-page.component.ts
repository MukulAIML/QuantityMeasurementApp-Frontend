import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';

interface OperationInfo {
  id: string;
  label: string;
  icon: string;
  dual: boolean;
  desc: string;
}

@Component({
  selector: 'app-calculator-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator-page.component.html',
  styleUrl: './calculator-page.component.css',
})
export class CalculatorPageComponent {
  readonly unitMap: Record<string, string[]> = {
    length: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'],
    weight: ['KILOGRAM', 'GRAM', 'POUND'],
    volume: ['LITRE', 'MILLILITRE', 'GALLON'],
    temperature: ['CELSIUS', 'FAHRENHEIT'],
  };

  readonly types = Object.keys(this.unitMap);

  readonly operations: OperationInfo[] = [
    { id: 'convert', label: 'CONVERT', icon: '↺', dual: false, desc: 'Convert a value from one unit to another' },
    { id: 'compare', label: 'COMPARE', icon: '⇔', dual: true, desc: 'Check if two quantities are equal' },
    { id: 'add', label: 'ADD', icon: '+', dual: true, desc: 'Add two quantities together' },
    { id: 'subtract', label: 'SUBTRACT', icon: '−', dual: true, desc: 'Subtract second quantity from first' },
    { id: 'divide', label: 'DIVIDE', icon: '÷', dual: true, desc: 'Divide first quantity by second' },
  ];

  readonly opColors: Record<string, string> = {
    convert: '#7c3aed', compare: '#00e5ff', add: '#22d3a5', subtract: '#f59e0b', divide: '#ff4d6d'
  };

  readonly typeIcons: Record<string, string> = {
    length: '📏', weight: '⚖️', volume: '🧪', temperature: '🌡️'
  };

  operation = 'convert';
  type = 'length';
  val1 = '';
  unit1 = this.unitMap['length'][0];
  val2 = '';
  unit2 = this.unitMap['length'][1];
  loading = false;
  error: string | null = null;
  result: any = null;

  constructor(private readonly api: ApiService) {}

  get availableUnits(): string[] {
    return this.unitMap[this.type];
  }

  get opInfo(): OperationInfo | undefined {
    return this.operations.find(o => o.id === this.operation);
  }

  get isDual(): boolean {
    return this.opInfo?.dual ?? false;
  }

  handleTypeChange(t: string): void {
    this.type = t;
    this.unit1 = this.unitMap[t][0];
    this.unit2 = this.unitMap[t][1] || this.unitMap[t][0];
    this.result = null;
    this.error = null;
  }

  handleOperationChange(op: string): void {
    this.operation = op;
    this.result = null;
    this.error = null;
  }

  handleSwap(): void {
    const tmpUnit = this.unit1;
    this.unit1 = this.unit2;
    this.unit2 = tmpUnit;
    const tmpVal = this.val1;
    this.val1 = this.val2;
    this.val2 = tmpVal;
  }

  async submit(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.result = null;
    this.error = null;
    const t = this.type.toUpperCase();
    try {
      switch (this.operation) {
        case 'convert':
          this.result = await firstValueFrom(this.api.convertQuantity(this.val1, this.unit1, t, this.unit2));
          break;
        case 'compare':
          this.result = await firstValueFrom(this.api.compareQuantities(this.val1, this.unit1, t, this.val2, this.unit2, t));
          break;
        case 'add':
          this.result = await firstValueFrom(this.api.addQuantities(this.val1, this.unit1, t, this.val2, this.unit2, t));
          break;
        case 'subtract':
          this.result = await firstValueFrom(this.api.subtractQuantities(this.val1, this.unit1, t, this.val2, this.unit2, t));
          break;
        case 'divide':
          this.result = await firstValueFrom(this.api.divideQuantities(this.val1, this.unit1, t, this.val2, this.unit2, t));
          break;
      }
    } catch (err: any) {
      this.error = err?.error?.message || err?.error || 'Operation failed. Check your inputs.';
      if (typeof this.error === 'object') {
        this.error = JSON.stringify(this.error);
      }
    } finally {
      this.loading = false;
    }
  }
}
