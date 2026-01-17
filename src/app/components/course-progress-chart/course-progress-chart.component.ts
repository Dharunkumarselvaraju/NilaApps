import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseProgress } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-course-progress-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-progress-chart.component.html',
  styleUrls: ['./course-progress-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseProgressChartComponent {
  @Input() data: CourseProgress[] = [];
  @Input() selectedDistrict: string = 'All District';

  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  get filteredData() {
    if (this.selectedDistrict === 'All District') {
      return this.data;
    }
    return this.data.filter(item => item.district === this.selectedDistrict);
  }

  get maxValue() {
    return Math.max(
      ...this.filteredData.flatMap(item => [item.below, item.average, item.good])
    );
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 100;
  }
  categories = [
    { key: 'below', label: 'Below', color: '#ef4444' },
    { key: 'average', label: 'Average', color: '#f59e0b' },
    { key: 'good', label: 'Good', color: '#10b981' }
  ];

  getDistrictValue(district: CourseProgress, key: string): number {
    switch (key) {
      case 'below':
        return district.below;
      case 'average':
        return district.average;
      case 'good':
        return district.good;
      default:
        return 0;
    }
  }

  getDistrictValueForBar(district: CourseProgress, key: string): number {
    return this.getBarHeight(this.getDistrictValue(district, key));
  }

  trackByDistrict(index: number, district: CourseProgress): string {
    return district.district;
  }

  trackByCategory(index: number, category: any): string {
    return category.key;
  }

  getDistrictName(districtName: string): string {
    return districtName.length > 8 ? districtName.substring(0, 8) + '...' : districtName;
  }

  // Tooltip methods
  onBarHover(event: MouseEvent, district: CourseProgress, category: any): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      district: this.getDistrictName(district.district),
      category: category.label,
      value: this.getDistrictValue(district, category.key),
      color: category.color
    };
    
    this.showTooltip = true;
  }

  onBarLeave(): void {
    this.showTooltip = false;
    this.tooltipData = null;
  }
}
