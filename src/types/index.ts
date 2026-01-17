/**
 * BiasBreaker Dual-Sided Platform Type Definitions
 * Provides type safety for the bias analysis and reporting system
 */

// ============================================================================
// User Types
// ============================================================================

/**
 * Defines the available user roles in the BiasBreaker platform
 * - student: Can submit and view their own analyses
 * - college_admin: Can manage college-level data and view college analytics
 * - super_admin: Full platform access with global analytics
 */
export type UserRole = 'student' | 'college_admin' | 'super_admin';

/**
 * Represents a user in the BiasBreaker platform
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's role determining access permissions */
  role: UserRole;
  /** Name of the college the user belongs to */
  collegeName: string;
  /** Unique identifier for the user's college */
  collegeId: string;
  /** User's display name */
  displayName: string;
  /** Timestamp when the user account was created */
  createdAt: Date;
}

// ============================================================================
// Bias Analysis Types
// ============================================================================

/**
 * Categories of bias that can be detected by the BiasBreaker analysis engine
 * - gender_bias: Discrimination based on gender identity
 * - department_discrimination: Unfair treatment across departments
 * - socioeconomic_bias: Bias based on economic or social status
 * - academic_elitism: Preferential treatment based on academic credentials
 * - community_patterns: Systemic patterns affecting specific communities
 */
export type BiasType =
  | 'gender_bias'
  | 'department_discrimination'
  | 'socioeconomic_bias'
  | 'academic_elitism'
  | 'community_patterns';

/**
 * Severity levels for detected bias patterns
 */
export type BiasSeverity = 'low' | 'medium' | 'high';

/**
 * Represents a detected bias pattern within analyzed text
 */
export interface DetectedPattern {
  /** The type of bias detected */
  type: BiasType;
  /** The specific text containing the bias pattern */
  text: string;
  /** Severity level of the detected pattern */
  severity: BiasSeverity;
}

/**
 * Represents a complete bias analysis result in the BiasBreaker platform
 */
export interface Analysis {
  /** Unique identifier for the analysis */
  id: string;
  /** ID of the user who submitted the analysis */
  userId: string;
  /** Email of the user who submitted the analysis */
  userEmail: string;
  /** Name of the college associated with this analysis */
  collegeName: string;
  /** Unique identifier for the associated college */
  collegeId: string;
  /** Title or subject of the analyzed content */
  title: string;
  /** The original text that was analyzed */
  text: string;
  /** Overall bias score from 0 (no bias) to 100 (extreme bias) */
  biasScore: number;
  /** Array of bias types detected in the analysis */
  biasTypes: BiasType[];
  /** Detailed patterns detected within the text */
  detectedPatterns: DetectedPattern[];
  /** AI-generated suggestions for reducing bias */
  suggestions: string[];
  /** Timestamp when the analysis was performed */
  timestamp: Date;
  /** Overall severity classification of the analysis */
  severity: BiasSeverity;
  /** Optional department name for departmental analysis */
  department?: string;
}

// ============================================================================
// College Types
// ============================================================================

/**
 * Represents a college/institution in the BiasBreaker platform
 */
export interface College {
  /** Unique identifier for the college */
  id: string;
  /** Official name of the college */
  name: string;
  /** Total number of analyses/reports submitted for this college */
  totalReports: number;
  /** @deprecated Use totalReports instead */
  totalAnalyses?: number;
  /** Average bias score across all analyses (0-100) */
  averageBiasScore: number;
  /** Count of high-severity incidents flagged */
  highSeverityCount: number;
  /** @deprecated Use highSeverityCount instead */
  criticalIncidents?: number;
  /** Timestamp of the last activity/submission */
  lastActivity: Date;
  /** @deprecated Use lastActivity instead */
  lastUpdated?: Date;
  /** List of departments within the college */
  departments: string[];
  /** Most common bias types detected in this college */
  commonBiasTypes?: BiasType[];
}

/**
 * Statistics for a specific college (used in admin dashboard)
 */
export interface CollegeStats {
  /** Unique identifier for the college */
  id: string;
  /** Official name of the college */
  name: string;
  /** Total number of analyses submitted for this college */
  totalAnalyses: number;
  /** Average bias score across all analyses (0-100) */
  averageBiasScore: number;
  /** Count of high-severity incidents flagged */
  criticalIncidents: number;
  /** Timestamp of the last data update */
  lastUpdated: Date;
  /** List of departments within the college */
  departments?: string[];
  /** Recent analysis trend */
  trend?: 'up' | 'down' | 'stable';
}

// ============================================================================
// Platform Statistics Types
// ============================================================================

/**
 * Global platform statistics for super admin dashboard
 */
export interface GlobalStats {
  /** Total number of registered users across the platform */
  totalUsers: number;
  /** Total number of colleges registered on the platform */
  totalColleges: number;
  /** Total number of analyses performed platform-wide */
  totalAnalyses: number;
  /** Average bias score across all platform analyses (0-100) */
  averagePlatformBias: number;
  /** Timestamp of the last statistics update */
  lastUpdated: Date;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Partial user data for creation/updates
 */
export type UserInput = Omit<User, 'id' | 'createdAt'>;

/**
 * Partial analysis data for creation
 */
export type AnalysisInput = Omit<Analysis, 'id' | 'timestamp'>;

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  /** Indicates if the request was successful */
  success: boolean;
  /** The response data (if successful) */
  data?: T;
  /** Error message (if unsuccessful) */
  error?: string;
}
