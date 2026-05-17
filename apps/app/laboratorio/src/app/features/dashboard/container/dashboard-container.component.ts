import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { DashboardFacade } from '../dashboard.facade';
import { BillingPeriod } from '../models/dashboard.models';
import { BillingChartComponent } from '../components/billing-chart/billing-chart.component';
import { ClosingsRankingComponent } from '../components/closings-ranking/closings-ranking.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [BillingChartComponent, ClosingsRankingComponent],
  templateUrl: './dashboard-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent implements OnInit {
  private facade = inject(DashboardFacade);

  readonly clients = this.facade.clients;
  readonly selectedClientId = this.facade.selectedClientId;
  readonly billingPeriod = this.facade.billingPeriod;
  readonly isBillingChartLoading = this.facade.isBillingChartLoading;
  readonly billingChartData = this.facade.billingChartData;

  readonly selectedRankingMonth = this.facade.selectedRankingMonth;
  readonly isRankingsLoading = this.facade.isRankingsLoading;
  readonly closingsRankingData = this.facade.closingsRankingData;
  readonly monthOptions = this.facade.monthOptions;

  ngOnInit(): void {
    this.facade.initialize();
  }

  onClientSelected(clientId: string | null): void {
    this.facade.selectClient(clientId);
    this.facade.loadBillingChart();
  }

  onPeriodToggled(period: BillingPeriod): void {
    this.facade.setBillingPeriod(period);
    this.facade.loadBillingChart();
  }

  onMonthSelected(month: string): void {
    this.facade.setRankingMonth(month);
    this.facade.loadClosingsRanking();
  }
}
