import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassStats } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-pass-stats-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pass-stats-chart.component.html',
  styleUrls: ['./pass-stats-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassStatsChartComponent implements OnChanges {
  @Input() data: PassStats | null = null;
  
  private _chartData: any[] = [];

  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.data) {
      this._chartData = [];
      return;
    }
    
    const maxValue = Math.max(
      this.data.overallLearners,
      this.data.assessmentTaken,
      this.data.passed,
      this.data.failed
    );

    this._chartData = [
      {
        label: 'Overall Learners',
        value: this.data.overallLearners,
        percentage: (this.data.overallLearners / maxValue) * 100,
        color: '#3b82f6'
      },
      {
        label: 'Assessment taken',
        value: this.data.assessmentTaken,
        percentage: (this.data.assessmentTaken / maxValue) * 100,
        color: '#06b6d4'
      },
      {
        label: 'Passed',
        value: this.data.passed,
        percentage: (this.data.passed / maxValue) * 100,
        color: '#10b981'
      },
      {
        label: 'Failed',
        value: this.data.failed,
        percentage: (this.data.failed / maxValue) * 100,
        color: '#ef4444'
      }
    ];
  }
  get chartData() {
    return this._chartData;
  }

  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toLocaleString();
  }

  // Tooltip methods
  onBarHover(event: MouseEvent, item: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      label: item.label,
      value: item.value,
      percentage: (item.value / this.chartData[0].value * 100).toFixed(1),
      color: item.color
    };
    
    this.showTooltip = true;
  }

  onBarLeave(): void {
    this.showTooltip = false;
    this.tooltipData = null;
  }
}
