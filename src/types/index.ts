export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'college_admin' | 'super_admin';
  college?: string;
  createdAt: Date;
}

export interface BiasAnalysis {
  id: string;
  userId: string;
  text: string;
  results: BiasResult;
  timestamp: Date;
  isDemoAnalysis?: boolean;
  college?: string;
}

export interface BiasResult {
  overallScore: number;
  biasesDetected: BiasDetection[];
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface BiasDetection {
  type: 'gender' | 'age' | 'location' | 'educational_background' | 'experience' | 'other';
  evidence: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedRewrite?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface DemoScenario {
  id: number;
  title: string;
  category: 'Job Description' | 'Email' | 'Announcement';
  text: string;
  expectedBiases: string[];
}

export interface CollegeStats {
  collegeName: string;
  location: string;
  totalReports: number;
  criticalCases: number;
  lastReport: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdminAnalytics {
  totalReports: number;
  activeColleges: number;
  criticalAlerts: number;
  totalUsers: number;
  averageAccuracy: number;
  averageAnalysisTime: number;
}
