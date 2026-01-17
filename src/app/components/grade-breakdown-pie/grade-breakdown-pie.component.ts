import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradeBreakdown } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-grade-breakdown-pie',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-breakdown-pie.component.html',
  styleUrls: ['./grade-breakdown-pie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeBreakdownPieComponent implements OnChanges {
  @Input() data: GradeBreakdown[] = [];

  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];
  
  private _chartData: any[] = [];
  private _pathData: any[] = [];

  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    this._chartData = this.data.map((item, index) => ({
      ...item,
      color: this.colors[index] || '#6b7280'
    }));
    
    this.updatePathData();
  }

  private updatePathData(): void {
    let cumulativePercentage = 0;
    this._pathData = this._chartData.map(item => {
      const startAngle = cumulativePercentage * 3.6;
      const endAngle = (cumulativePercentage + item.percent) * 3.6;
      cumulativePercentage += item.percent;

      const startAngleRad = (startAngle - 90) * Math.PI / 180;
      const endAngleRad = (endAngle - 90) * Math.PI / 180;

      const largeArcFlag = item.percent > 50 ? 1 : 0;

      const x1 = 60 + 40 * Math.cos(startAngleRad);
      const y1 = 60 + 40 * Math.sin(startAngleRad);
      const x2 = 60 + 40 * Math.cos(endAngleRad);
      const y2 = 60 + 40 * Math.sin(endAngleRad);

      const pathData = [
        'M', 60, 60,
        'L', x1, y1,
        'A', 40, 40, 0, largeArcFlag, 1, x2, y2,
        'Z'
      ].join(' ');

      return {
        ...item,
        pathData
      };
    });
  }
  get chartData() {
    return this._chartData;
  }

  get pathData() {
    return this._pathData;
  }

  trackByGrade(index: number, item: any): string {
    return item.grade;
  }

  // Tooltip methods
  onSliceHover(event: MouseEvent, slice: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      grade: slice.grade,
      label: slice.label,
      percentage: slice.percent,
      color: slice.color
    };
    
    this.showTooltip = true;
  }

  onSliceLeave(): void {
    this.showTooltip = false;
    this.tooltipData = null;
  }
}
