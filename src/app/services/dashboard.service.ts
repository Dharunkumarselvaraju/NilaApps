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
  private mergedData: any = null;

  constructor(private http: HttpClient) {}

  getDashboard(year: number = 2024): Observable<DashboardResponse> {
    return this.http.get<any>('/data/dashboard.json').pipe(
      map(data => {
        if (this.mergedData === null) {
          this.mergedData = data;
        }
        return this.mergedData[year.toString()];
      })
    );
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
      
      // Calculate assessment completion for selected district from districtRanking data
      const districtData = data.districtRanking?.districts?.find(d => d.district === filters.district);
      if (districtData) {
        // Calculate completion percentage based on district data
        const completedPercent = Math.round((districtData.assessmentCompleted / districtData.enrolled) * 100);
        filteredData.assessmentCompletion = {
          completedPercent: completedPercent,
          notCompletedPercent: 100 - completedPercent
        };
        
        // Calculate grade breakdown based on pass rate for the district
        const passRate = Math.round((districtData.passed / districtData.enrolled) * 100);
        filteredData.gradeBreakdown = this.calculateGradeBreakdown(passRate);
        
        // Update summary for selected district
        filteredData.summary = {
          totalLearners: districtData.enrolled,
          male: districtData.male,
          female: districtData.female,
          others: districtData.others,
          activeLearners: Math.round(districtData.enrolled * 0.45),
          engagedLearners: Math.round(districtData.enrolled * 0.04)
        };
        
        // Update pass stats for selected district
        filteredData.passStats = {
          overallLearners: districtData.enrolled,
          assessmentTaken: districtData.assessmentCompleted,
          passed: districtData.passed,
          failed: districtData.assessmentCompleted - districtData.passed
        };
      }
    }

    return filteredData;
  }

  // Calculate grade breakdown based on pass rate
  private calculateGradeBreakdown(passRate: number): any[] {
    // Distribute grades based on pass rate
    // Higher pass rate = more A and B grades
    const aGrade = Math.min(Math.round(passRate * 0.4), 60);
    const bGrade = Math.min(Math.round(passRate * 0.35), 30);
    const cGrade = Math.min(Math.round((100 - passRate) * 0.4), 20);
    const dGrade = Math.min(Math.round((100 - passRate) * 0.35), 15);
    const eGrade = Math.max(100 - aGrade - bGrade - cGrade - dGrade, 0);
    
    return [
      { grade: "A", label: "A - Grade (>80)", percent: aGrade },
      { grade: "B", label: "B - Grade (>60)", percent: bGrade },
      { grade: "C", label: "C - Grade (>50)", percent: cGrade },
      { grade: "D", label: "D - Grade (>30)", percent: dGrade },
      { grade: "E", label: "E - Grade (0)", percent: eGrade }
    ];
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
