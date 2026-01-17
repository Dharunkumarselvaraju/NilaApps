import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

// Components
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { SummaryCardsComponent } from './components/summary-cards/summary-cards.component';
import { CourseProgressChartComponent } from './components/course-progress-chart/course-progress-chart.component';
import { PassStatsChartComponent } from './components/pass-stats-chart/pass-stats-chart.component';
import { AssessmentDonutComponent } from './components/assessment-donut/assessment-donut.component';
import { GradeBreakdownPieComponent } from './components/grade-breakdown-pie/grade-breakdown-pie.component';
import { DistrictRankingComponent } from './components/district-ranking/district-ranking.component';

// Services and Models
import { DashboardService, DateRange, PeriodFilter } from './services/dashboard.service';
import { ThemeService } from './services/theme.service';
import { DashboardResponse } from './models/dashboard-response.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    SummaryCardsComponent,
    CourseProgressChartComponent,
    PassStatsChartComponent,
    AssessmentDonutComponent,
    GradeBreakdownPieComponent,
    DistrictRankingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'LearnTrack';
  dashboardData: DashboardResponse | null = null;
  loading = false; // Start without loading state
  error: string | null = null;
  
  selectedYear = 2024;
  selectedDistrict = 'All District';
  selectedPeriod = 'Monthly';
  selectedDateRange: DateRange = {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  };
  selectedPeriodFilter: PeriodFilter = {
    type: 'Monthly',
    period: 1,
    year: 2024
  };

  private destroy$ = new Subject<void>();
  constructor(
    private dashboardService: DashboardService,
    private themeService: ThemeService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Set initial placeholder data to show content immediately
    this.setInitialPlaceholderData();
  }
  private setInitialPlaceholderData(): void {
    // Provide initial data to display dashboard immediately
    this.dashboardData = {
      summary: {
        totalLearners: 28125,
        male: 15000,
        female: 11800,
        others: 325,
        activeLearners: 12250,
        engagedLearners: 1100
      },
      courseProgress: [
        { district: "Ariyulur", below: 10, average: 30, good: 60 },
        { district: "Chennai", below: 18, average: 35, good: 47 },
        { district: "Coimbatore", below: 10, average: 25, good: 65 },
        { district: "Cuddalore", below: 22, average: 28, good: 50 },
        { district: "Dharmapuri", below: 6, average: 18, good: 76 }
      ],
      passStats: {
        overallLearners: 28125,
        assessmentTaken: 22500,
        passed: 18000,
        failed: 4500
      },
      assessmentCompletion: {
        completedPercent: 75,
        notCompletedPercent: 25
      },
      gradeBreakdown: [
        { grade: "A", label: "Excellent", percent: 8 },
        { grade: "B", label: "Good", percent: 12 },
        { grade: "C", label: "Average", percent: 30 },
        { grade: "D", label: "Below Average", percent: 50 }
      ],
      districtRanking: {
        rankBy: "Completion Rate",
        districts: [
          { 
            district: "Dharmapuri", 
            rank: 1, 
            enrolled: 2500, 
            male: 1300, 
            female: 1150, 
            others: 50, 
            passed: 1900, 
            assessmentCompleted: 2000, 
            completionRatePercent: 76 
          },
          { 
            district: "Coimbatore", 
            rank: 2, 
            enrolled: 3000, 
            male: 1600, 
            female: 1350, 
            others: 50, 
            passed: 1950, 
            assessmentCompleted: 2400, 
            completionRatePercent: 65 
          },
          { 
            district: "Ariyulur", 
            rank: 3, 
            enrolled: 2800, 
            male: 1500, 
            female: 1250, 
            others: 50, 
            passed: 1680, 
            assessmentCompleted: 2200, 
            completionRatePercent: 60 
          },
          { 
            district: "Chennai", 
            rank: 4, 
            enrolled: 3500, 
            male: 1800, 
            female: 1650, 
            others: 50, 
            passed: 1645, 
            assessmentCompleted: 2800, 
            completionRatePercent: 47 
          },
          { 
            district: "Cuddalore", 
            rank: 5, 
            enrolled: 2200, 
            male: 1100, 
            female: 1050, 
            others: 50, 
            passed: 1100, 
            assessmentCompleted: 1760, 
            completionRatePercent: 50 
          }
        ]
      }
    };
  }

  ngOnInit(): void {
    console.log('App component initializing with:', {
      year: this.selectedYear,
      district: this.selectedDistrict,
      period: this.selectedPeriod,
      dateRange: this.selectedDateRange
    });

    // Initialize service with current values
    this.initializeService();
    
    // Load initial raw data first
    this.loadInitialData();

    // Subscribe to filtered dashboard data
    this.subscribeToFilteredData();
  }

  private initializeService(): void {
    this.dashboardService.setSelectedYear(this.selectedYear);
    this.dashboardService.setSelectedDistrict(this.selectedDistrict);
    this.dashboardService.setSelectedPeriod(this.selectedPeriod);
    this.dashboardService.setDateRange(this.selectedDateRange);
    this.dashboardService.setPeriodFilter(this.selectedPeriodFilter);
  }
  private loadInitialData(): void {
    console.log('Loading initial data for year:', this.selectedYear);
    // Don't show loading state - data loads in background
    this.error = null;
    
    this.dashboardService.loadAndCacheData(this.selectedYear)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Initial raw data loaded successfully:', data);
          // Data is cached, filtered data subscription will handle the UI update
        },
        error: (err) => {
          console.error('Error loading initial data:', err);
          this.error = `Failed to load dashboard data for ${this.selectedYear}`;
          this.cdr.markForCheck();
        }
      });
  }  private subscribeToFilteredData(): void {
    this.dashboardService.getFilteredDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Filtered dashboard data received, updating dashboard:', data);
          // Replace placeholder data with real data when available
          this.dashboardData = data;
          this.error = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error receiving filtered dashboard data:', err);
          // Keep showing placeholder data and show error message
          this.error = 'Failed to process dashboard data';
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }  public loadDashboardData(year: number): void {
    console.log('Loading dashboard data for year:', year);
    this.error = null;

    // Load and cache the raw data without showing loading state
    this.dashboardService.loadAndCacheData(year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Raw data loaded successfully for year:', year, data);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading dashboard data:', err);
          this.error = `Failed to load dashboard data for ${year}`;
          this.cdr.markForCheck();
        }
      });
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.dashboardService.setSelectedPeriod(period);
    this.dashboardService.setDateRange(this.selectedDateRange);
  }

  onDistrictChange(district: string): void {
    this.selectedDistrict = district;
    this.dashboardService.setSelectedDistrict(district);
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.dashboardService.setSelectedYear(year);
    this.loadDashboardData(year);
  }

  onDateRangeChange(dateRange: DateRange): void {
    this.selectedDateRange = dateRange;
    this.dashboardService.setDateRange(dateRange);
    console.log('Date range changed:', dateRange);
  }

  onPeriodFilterChange(periodFilter: PeriodFilter): void {
    this.selectedPeriodFilter = periodFilter;
    this.selectedYear = periodFilter.year;
    this.dashboardService.setPeriodFilter(periodFilter);
    this.dashboardService.setSelectedYear(periodFilter.year);
    
    // Load new data if year changed
    if (periodFilter.year !== this.selectedYear) {
      this.loadDashboardData(periodFilter.year);
    }
    
    console.log('Period filter changed:', periodFilter);
  }
}
