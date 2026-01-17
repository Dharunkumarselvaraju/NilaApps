import { Component, Input, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DistrictRanking, District } from '../../models/dashboard-response.model';

@Component({
  selector: 'app-district-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './district-ranking.component.html',
  styleUrls: ['./district-ranking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistrictRankingComponent implements AfterViewInit {
  @Input() data: DistrictRanking | null = null;
  @ViewChild('tilesContainer') tilesContainer!: ElementRef<HTMLDivElement>;

  rankBy = 'enrollment';
  canScrollLeft = false;
  canScrollRight = true;
  
  // Tooltip state
  showTooltip = false;
  tooltipData: any = null;
  tooltipPosition = { x: 0, y: 0 };

  rankByOptions = [
    { value: 'enrollment', label: 'Enrollment' },
    { value: 'pass', label: 'Pass %' },
    { value: 'completion', label: 'Completion %' }
  ];

  get sortedDistricts(): District[] {
    if (!this.data) return [];
    
    const districts = [...this.data.districts];
    
    switch (this.rankBy) {
      case 'enrollment':
        return districts.sort((a, b) => b.enrolled - a.enrolled);
      case 'pass':
        return districts.sort((a, b) => (b.passed / b.enrolled) * 100 - (a.passed / a.enrolled) * 100);
      case 'completion':
        return districts.sort((a, b) => b.completionRatePercent - a.completionRatePercent);
      default:
        return districts;
    }
  }

  get maxValue(): number {
    if (!this.sortedDistricts.length) return 1;
    
    switch (this.rankBy) {
      case 'enrollment':
        return Math.max(...this.sortedDistricts.map(d => d.enrolled));
      case 'pass':
        return Math.max(...this.sortedDistricts.map(d => (d.passed / d.enrolled) * 100));
      case 'completion':
        return Math.max(...this.sortedDistricts.map(d => d.completionRatePercent));
      default:
        return 1;
    }
  }

  getBarWidth(district: District): number {
    let value: number;
    
    switch (this.rankBy) {
      case 'enrollment':
        value = district.enrolled;
        break;
      case 'pass':
        value = (district.passed / district.enrolled) * 100;
        break;
      case 'completion':
        value = district.completionRatePercent;
        break;
      default:
        value = 0;
    }
    
    return (value / this.maxValue) * 100;
  }
  getValue(district: District): string {
    switch (this.rankBy) {
      case 'enrollment':
        return district.enrolled.toLocaleString();
      case 'pass':
        return ((district.passed / district.enrolled) * 100).toFixed(1) + '%';
      case 'completion':
        return district.completionRatePercent + '%';
      default:
        return '';
    }
  }

  getFormattedValue(district: District): string {
    switch (this.rankBy) {
      case 'enrollment':
        return this.formatNumber(district.enrolled);
      case 'pass':
        return ((district.passed / district.enrolled) * 100).toFixed(1) + '%';
      case 'completion':
        return district.completionRatePercent + '%';
      default:
        return '';
    }
  }

  getValueLabel(): string {
    switch (this.rankBy) {
      case 'enrollment':
        return 'Students';
      case 'pass':
        return 'Pass Rate';
      case 'completion':
        return 'Completion Rate';
      default:
        return '';
    }
  }

  formatNumber(value: number): string {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toLocaleString();
  }

  scrollLeft(): void {
    if (this.tilesContainer) {
      this.tilesContainer.nativeElement.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
      this.updateScrollButtons();
    }
  }

  scrollRight(): void {
    if (this.tilesContainer) {
      this.tilesContainer.nativeElement.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
      this.updateScrollButtons();
    }
  }

  private updateScrollButtons(): void {
    setTimeout(() => {
      if (this.tilesContainer) {
        const container = this.tilesContainer.nativeElement;
        this.canScrollLeft = container.scrollLeft > 0;
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      }
    }, 100);
  }

  getOrdinalSuffix(rank: number): string {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return rank + 'st';
    if (j === 2 && k !== 12) return rank + 'nd';
    if (j === 3 && k !== 13) return rank + 'rd';
    return rank + 'th';
  }
  onRankByChange(): void {
    // Component will automatically re-render with new sorting
    setTimeout(() => this.updateScrollButtons(), 100);
  }

  // Tooltip methods
  onTileHover(event: MouseEvent, district: District): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.tooltipPosition = {
      x: event.clientX,
      y: event.clientY - 10
    };
    
    this.tooltipData = {
      district: district.district,
      rank: district.rank,
      enrolled: district.enrolled,
      passed: district.passed,
      completed: district.assessmentCompleted,
      passRate: ((district.passed / district.enrolled) * 100).toFixed(1),
      completionRate: district.completionRatePercent.toFixed(1)
    };
    
    this.showTooltip = true;
  }

  onTileLeave(): void {
    this.showTooltip = false;
    this.tooltipData = null;
  }

  ngAfterViewInit(): void {
    this.updateScrollButtons();
  }
}
