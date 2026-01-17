import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, filter } from 'rxjs';
import { DashboardResponse } from '../models/dashboard-response.model';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodFilter {
  type: 'Monthly' | 'Quarterly';
  period: number;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private selectedYearSubject = new BehaviorSubject<number>(2024);
  public selectedYear$ = this.selectedYearSubject.asObservable();

  private selectedDistrictSubject = new BehaviorSubject<string>('All District');
  public selectedDistrict$ = this.selectedDistrictSubject.asObservable();

  private selectedPeriodSubject = new BehaviorSubject<string>('Monthly');
  public selectedPeriod$ = this.selectedPeriodSubject.asObservable();

  private dateRangeSubject = new BehaviorSubject<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });
  public dateRange$ = this.dateRangeSubject.asObservable();

  private periodFilterSubject = new BehaviorSubject<PeriodFilter>({
    type: 'Monthly',
    period: 1,
    year: 2024
  });
  public periodFilter$ = this.periodFilterSubject.asObservable();

  // Raw dashboard data cache
  private rawDataCache = new Map<number, DashboardResponse>();
  constructor(private http: HttpClient) {}

  getDashboard(year: number = 2024): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`/data/dashboard_${year}.json`);
  }
  // Get filtered dashboard data based on all current filter settings
  getFilteredDashboard(): Observable<DashboardResponse> {
    return combineLatest([
      this.selectedYear$,
      this.selectedDistrict$,
      this.selectedPeriod$,
      this.dateRange$,
      this.periodFilter$
    ]).pipe(
      map(([year, district, period, dateRange, periodFilter]) => {
        // Get raw data from cache
        const rawData = this.rawDataCache.get(year);
        if (!rawData) {
          // Return null to indicate no data loaded yet, rather than empty structure
          return null as any;
        }

        // Apply basic filters to the raw data
        return this.applyBasicFilters(rawData, {
          year,
          district,
          period,
          dateRange,
          periodFilter
        });
      }),      // Filter out null values (when no data is cached yet)
      filter((data: DashboardResponse | null): data is DashboardResponse => data !== null)
    );
  }

  // Cache raw data when loaded
  loadAndCacheData(year: number): Observable<DashboardResponse> {
    return this.getDashboard(year).pipe(
      map(data => {
        this.rawDataCache.set(year, data);
        return data;
      })
    );
  }

  // Basic filtering for compatibility
  private applyBasicFilters(
    data: DashboardResponse, 
    filters: {
      year: number;
      district: string;
      period: string;
      dateRange: DateRange;
      periodFilter: PeriodFilter;
    }
  ): DashboardResponse {
    // Clone the original data to avoid mutations
    const filteredData: DashboardResponse = JSON.parse(JSON.stringify(data));
    
    // Apply basic district filter to course progress
    if (filters.district !== 'All District') {
      filteredData.courseProgress = this.filterCourseProgressByDistrict(data.courseProgress, filters.district);
    }

    return filteredData;
  }

  private filterCourseProgressByDistrict(courseProgress: any[], district: string): any[] {
    if (Array.isArray(courseProgress)) {
      return courseProgress.filter(item => item.district === district);
    }
    return courseProgress;
  }

  private getEmptyDashboardResponse(): DashboardResponse {
    return {
      summary: {
        totalLearners: 0,
        male: 0,
        female: 0,
        others: 0,
        activeLearners: 0,
        engagedLearners: 0
      },
      courseProgress: [],
      passStats: {
        overallLearners: 0,
        assessmentTaken: 0,
        passed: 0,
        failed: 0
      },
      assessmentCompletion: {
        completedPercent: 0,
        notCompletedPercent: 100
      },
      gradeBreakdown: [],
      districtRanking: {
        rankBy: 'completionRate',
        districts: []
      }
    };
  }

  setSelectedYear(year: number): void {
    this.selectedYearSubject.next(year);
  }

  getSelectedYear(): number {
    return this.selectedYearSubject.value;
  }

  setSelectedDistrict(district: string): void {
    this.selectedDistrictSubject.next(district);
  }

  getSelectedDistrict(): string {
    return this.selectedDistrictSubject.value;
  }

  setSelectedPeriod(period: string): void {
    this.selectedPeriodSubject.next(period);
  }
  getSelectedPeriod(): string {
    return this.selectedPeriodSubject.value;
  }

  setDateRange(dateRange: DateRange): void {
    this.dateRangeSubject.next(dateRange);
  }

  getDateRange(): DateRange {
    return this.dateRangeSubject.value;
  }

  setPeriodFilter(periodFilter: PeriodFilter): void {
    this.periodFilterSubject.next(periodFilter);
  }

  getPeriodFilter(): PeriodFilter {
    return this.periodFilterSubject.value;
  }
}
