import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from 'src/app/shared/ui/select';
import { HlmSwitchImports } from 'src/app/shared/ui/switch';
import { HlmSkeleton } from 'src/app/shared/ui/skeleton';

import { BillingChartData, BillingPeriod, Client } from '../../models/dashboard.models';

@Component({
  selector: 'app-billing-chart',
  standalone: true,
  imports: [
    NgApexchartsModule,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmSwitchImports,
    HlmSkeleton,
  ],
  templateUrl: './billing-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingChartComponent {
  readonly chartData = input<BillingChartData | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly clients = input<Client[]>([]);
  readonly selectedClientId = input<string | null>(null);
  readonly billingPeriod = input<BillingPeriod>('monthly');

  readonly clientSelected = output<string | null>();
  readonly periodToggled = output<BillingPeriod>();

  readonly chartSeries = computed<ApexAxisChartSeries>(() => {
    const data = this.chartData();
    if (!data || data.dataPoints.length === 0) return [];
    return [
      {
        name: 'Faturamento (R$)',
        data: data.dataPoints.map(p => p.value),
      },
    ];
  });

  readonly chartCategories = computed<string[]>(() => {
    const data = this.chartData();
    if (!data) return [];
    return data.dataPoints.map(p => p.period);
  });

  readonly chart: ApexChart = {
    type: 'area',
    height: 280,
    toolbar: { show: false },
    zoom: { enabled: false },
  };

  readonly stroke: ApexStroke = {
    curve: 'smooth',
    width: 2,
  };

  readonly fill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  };

  readonly dataLabels: ApexDataLabels = { enabled: false };

  readonly grid: ApexGrid = {
    borderColor: 'hsl(var(--border))',
    strokeDashArray: 4,
  };

  readonly yaxis: ApexYAxis = {
    labels: {
      formatter: (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
  };

  readonly tooltip: ApexTooltip = {
    y: {
      formatter: (value: number) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
  };

  readonly colors = ['hsl(var(--primary))'];

  readonly xaxis = computed<ApexXAxis>(() => ({
    categories: this.chartCategories(),
    labels: { style: { fontSize: '12px' } },
  }));

  get isBiweekly(): boolean {
    return this.billingPeriod() === 'biweekly';
  }

  onClientChange(value: string | null | undefined): void {
    const clientId = value ?? null;
    this.clientSelected.emit(clientId === '' ? null : clientId);
  }

  onPeriodToggle(checked: boolean): void {
    this.periodToggled.emit(checked ? 'biweekly' : 'monthly');
  }
}
