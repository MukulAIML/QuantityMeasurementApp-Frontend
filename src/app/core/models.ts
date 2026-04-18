export interface ApiResponse {
  [key: string]: unknown;
}

export interface HistoryItem {
  id: number;
  operation: string;
  thisValue: number;
  thisUnit: string;
  thisMeasurementType?: string;
  thatValue: number | null;
  thatUnit: string | null;
  thatMeasurementType?: string;
  resultString: string;
  resultValue?: number;
  resultUnit?: string;
  error: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface UserSession {
  username: string;
  token: string;
}
