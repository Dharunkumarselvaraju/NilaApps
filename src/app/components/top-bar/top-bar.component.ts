import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
import { DateRange, PeriodFilter } from '../../services/dashboard.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent implements OnInit {
  @Input() initialYear?: number;
  @Input() initialDistrict?: string;
  @Input() initialPeriod?: string;
  @Input() initialDateRange?: DateRange;

  @Output() periodChange = new EventEmitter<string>();
  @Output() districtChange = new EventEmitter<string>();
  @Output() yearChange = new EventEmitter<number>();
  @Output() dateRangeChange = new EventEmitter<DateRange>();
  @Output() periodFilterChange = new EventEmitter<PeriodFilter>();

  selectedPeriod: 'Monthly' | 'Quarterly' = 'Monthly';
  selectedDistrict = 'All District';
  selectedYear = 2024;
  currentPeriod = 1; // Current month (1-12) or quarter (1-4)
  
  // Date range inputs
  startDate = '2024-01-01';
  endDate = '2024-12-31';

  periods = ['Monthly', 'Quarterly'] as const;
  districts = [
    'All District',
    'Ariyulur',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Karur',
    'Madurai'
  ];  years = [2024, 2025];
  
  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    // Use input values if provided, otherwise use defaults
    if (this.initialYear) {
      this.selectedYear = this.initialYear;
    }
    if (this.initialDistrict) {
      this.selectedDistrict = this.initialDistrict;
    }
    if (this.initialPeriod) {
      this.selectedPeriod = this.initialPeriod as 'Monthly' | 'Quarterly';
    }
    if (this.initialDateRange) {
      this.startDate = this.initialDateRange.startDate;
      this.endDate = this.initialDateRange.endDate;
    } else {
      this.initializeDates();
    }
  }

  private initializeDates(): void {
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.currentPeriod = this.selectedPeriod === 'Monthly' ? 
      currentDate.getMonth() + 1 : 
      Math.floor(currentDate.getMonth() / 3) + 1;
    
    this.updateDateInputs();
  }

  setPeriod(period: 'Monthly' | 'Quarterly'): void {
    this.selectedPeriod = period;
    this.currentPeriod = 1; // Reset to first period
    this.updateDateInputs();
    this.emitPeriodFilter();
    this.periodChange.emit(this.selectedPeriod);
  }

  navigatePeriod(direction: number): void {
    const maxPeriods = this.selectedPeriod === 'Monthly' ? 12 : 4;
    this.currentPeriod += direction;
    
    if (this.currentPeriod > maxPeriods) {
      this.currentPeriod = 1;
      this.selectedYear++;
    } else if (this.currentPeriod < 1) {
      this.currentPeriod = maxPeriods;
      this.selectedYear--;
    }
    
    this.updateDateInputs();
    this.emitPeriodFilter();
  }

  canNavigateBack(): boolean {
    return !(this.selectedYear === 2024 && this.currentPeriod === 1);
  }

  canNavigateForward(): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentPeriod = this.selectedPeriod === 'Monthly' ? 
      currentDate.getMonth() + 1 : 
      Math.floor(currentDate.getMonth() / 3) + 1;
    
    return !(this.selectedYear === currentYear && this.currentPeriod >= currentPeriod);
  }

  getCurrentPeriodLabel(): string {
    if (this.selectedPeriod === 'Monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[this.currentPeriod - 1]} ${this.selectedYear}`;
    } else {
      return `Q${this.currentPeriod} ${this.selectedYear}`;
    }
  }

  private updateDateInputs(): void {
    if (this.selectedPeriod === 'Monthly') {
      const year = this.selectedYear;
      const month = this.currentPeriod;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      
      this.startDate = this.formatDateForInput(firstDay);
      this.endDate = this.formatDateForInput(lastDay);
    } else {
      const year = this.selectedYear;
      const quarter = this.currentPeriod;
      const firstMonth = (quarter - 1) * 3;
      const firstDay = new Date(year, firstMonth, 1);
      const lastDay = new Date(year, firstMonth + 3, 0);
      
      this.startDate = this.formatDateForInput(firstDay);
      this.endDate = this.formatDateForInput(lastDay);
    }
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onDateRangeChange(): void {
    this.dateRangeChange.emit({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  private emitPeriodFilter(): void {
    this.periodFilterChange.emit({
      type: this.selectedPeriod,
      period: this.currentPeriod,
      year: this.selectedYear
    });
  }
  onDistrictChange(): void {
    this.districtChange.emit(this.selectedDistrict);
  }

  onYearChange(): void {
    this.updateDateInputs();
    this.yearChange.emit(this.selectedYear);
    this.emitPeriodFilter();
  }

  onThemeToggle(): void {
    this.themeService.toggleTheme();
  }
}
