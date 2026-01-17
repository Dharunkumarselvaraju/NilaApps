export interface Summary {
  totalLearners: number;
  male: number;
  female: number;
  others: number;
  activeLearners: number;
  engagedLearners: number;
}

export interface CourseProgress {
  district: string;
  below: number;
  average: number;
  good: number;
}

export interface PassStats {
  overallLearners: number;
  assessmentTaken: number;
  passed: number;
  failed: number;
}

export interface AssessmentCompletion {
  completedPercent: number;
  notCompletedPercent: number;
}

export interface GradeBreakdown {
  grade: string;
  label: string;
  percent: number;
}

export interface District {
  district: string;
  rank: number;
  enrolled: number;
  male: number;
  female: number;
  others: number;
  passed: number;
  assessmentCompleted: number;
  completionRatePercent: number;
}

export interface DistrictRanking {
  rankBy: string;
  districts: District[];
}

export interface DashboardResponse {
  summary: Summary;
  courseProgress: CourseProgress[];
  passStats: PassStats;
  assessmentCompletion: AssessmentCompletion;
  gradeBreakdown: GradeBreakdown[];
  districtRanking: DistrictRanking;
}
