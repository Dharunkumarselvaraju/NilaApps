import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentCompletion } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-assessment-donut',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-donut.component.html',
  styleUrls: ['./assessment-donut.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentDonutComponent implements OnChanges {
  @Input() data: AssessmentCompletion | null = null;
  
  private _chartData: any[] = [];
  private _completedOffset = 0;
  private _notCompletedOffset = 0;
  private _rotationAngle = -90;

  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.updateChartCalculations();
    }
  }

  private updateChartCalculations(): void {
    if (!this.data) return;
    
    // Update chart data
    this._chartData = [
      {
        label: 'Assessment completed',
        value: this.data.completedPercent,
        color: '#10b981'
      },
      {
        label: 'Assessment not completed',
        value: this.data.notCompletedPercent,
        color: '#ef4444'
      }
    ];

    // Update offset calculations
    const circumference = 2 * Math.PI * 45; // radius = 45
    this._completedOffset = circumference - (this.data.completedPercent / 100) * circumference;
    
    const completedLength = (this.data.completedPercent / 100) * circumference;
    this._notCompletedOffset = circumference - (this.data.notCompletedPercent / 100) * circumference - completedLength;
    
    this._rotationAngle = -90 + (this.data.completedPercent * 3.6);
  }

  // Tooltip methods
  onSegmentHover(event: MouseEvent, segmentType: 'completed' | 'notCompleted'): void {
    if (!this.data) return;
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      type: segmentType === 'completed' ? 'Completed' : 'Not Completed',
      percentage: segmentType === 'completed' ? this.data.completedPercent : this.data.notCompletedPercent,
      color: segmentType === 'completed' ? '#10b981' : '#ef4444'
    };
    
    this.showTooltip = true;
  }

  onSegmentLeave(): void {
    this.showTooltip = false;
    this.tooltipData = null;
  }

  get chartData() {
    return this._chartData;
  }

  get completedOffset() {
    return this._completedOffset;
  }

  get notCompletedOffset() {
    return this._notCompletedOffset;
  }

  get strokeDashArray() {
    return 2 * Math.PI * 45;
  }

  get rotationAngle() {
    return this._rotationAngle;
  }
}
