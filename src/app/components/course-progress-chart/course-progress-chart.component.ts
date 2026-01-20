import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
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
export class CourseProgressChartComponent implements OnChanges {
  @Input() data: CourseProgress[] = [];
  @Input() selectedDistrict: string = 'All District';

  // Pagination
  currentPage = 0;
  districtsPerPage = 5;

  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDistrict']) {
      this.currentPage = 0;
    }
  }

  get isAllDistrict(): boolean {
    return this.selectedDistrict === 'All District';
  }

  get filteredData() {
    if (this.isAllDistrict) {
      return this.data;
    }
    return this.data.filter(item => item.district === this.selectedDistrict);
  }

  get displayedDistricts() {
    const start = this.currentPage * this.districtsPerPage;
    const end = start + this.districtsPerPage;
    return this.filteredData.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.districtsPerPage);
  }

  get canGoPrev() {
    return this.currentPage > 0;
  }

  get canGoNext() {
    return this.currentPage < this.totalPages - 1;
  }

  get maxValue() {
    return Math.max(
      ...this.filteredData.flatMap(item => [item.below, item.average, item.good])
    );
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 100;
  }

  getHighestCategoryValue(district: CourseProgress): number {
    return Math.max(district.below, district.average, district.good);
  }

  getHighestCategory(district: CourseProgress) {
    const below = district.below;
    const average = district.average;
    const good = district.good;
    
    // Find the actual maximum value and return the corresponding category
    if (average >= below && average >= good) {
      return { key: 'average', label: 'Average', color: '#f59e0b' };
    }
    if (below >= average && below >= good) {
      return { key: 'below', label: 'Below', color: '#ef4444' };
    }
    return { key: 'good', label: 'Good', color: '#10b981' };
  }

  getDistrictHighestValue(district: CourseProgress): number {
    const highest = this.getHighestCategoryValue(district);
    return this.getBarHeight(highest);
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

  // Pagination methods
  onPrevPage(): void {
    if (this.canGoPrev) {
      this.currentPage--;
    }
  }

  onNextPage(): void {
    if (this.canGoNext) {
      this.currentPage++;
    }
  }

  // Tooltip methods
  onBarHover(event: MouseEvent, district: CourseProgress): void {
    const category = this.getHighestCategory(district);
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      district: this.getDistrictName(district.district),
      category: category.label,
      value: this.getHighestCategoryValue(district),
      color: category.color
    };
    
    this.showTooltip = true;
  }

  onBarHoverMultiple(event: MouseEvent, district: CourseProgress, category: any): void {
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
