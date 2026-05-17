export interface Client {
  id: string;
  name: string;
}

export interface BillingDataPoint {
  period: string;
  value: number;
}

export interface BillingChartData {
  clientId: string | null;
  dataPoints: BillingDataPoint[];
}

export interface ClosingItem {
  clientId: string;
  clientName: string;
  totalValue: number;
  orderCount: number;
}

export type BillingPeriod = 'biweekly' | 'monthly';
