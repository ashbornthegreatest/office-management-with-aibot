export enum TaskType {
  MANDATORY = 'MANDATORY',
  OPEN = 'OPEN',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string; // Short description for card
  longDescription?: string; // Detailed description for modal
  type: TaskType;
  priority: TaskPriority;
  estimatedHours: number;
  assignedToId: string | null; // null means unassigned/open (Individual)
  requiredSkills: string[];
  
  // New fields for tracking
  status: TaskStatus;
  progress: number; // 0-100
  createdAt: Date;
  completedAt?: Date;
  notes: string[]; // Activity log/notes
  files: string[]; // Names of simulated attached files

  // Group Task Fields
  isGroupTask?: boolean;
  requiredPeople?: number;
  groupAssigneeIds?: string[]; // IDs of employees in the group
}

export type AccessLevel = 'ceo' | 'manager' | 'employee';

export interface Employee {
  id: string;
  name: string;
  email: string; // Auth
  password?: string; // Auth (Simulated)
  role: string;
  accessLevel: AccessLevel;
  workloadScore: number; // 0-100
  skills: string[];
  status: 'OPTIMAL' | 'OVERLOADED' | 'UNDERUTILIZED' | string; // Relaxed for custom statuses
  avatar: string;
  
  // Profile Data
  bio?: string;
  resumeLink?: string;
  portfolioLink?: string;
  joinedDate: Date;
}

export interface AIAnalysisResult {
  summary: string;
  burnoutRisk: string[]; // Names of employees
  efficiencyScore: number;
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Product Types
export interface ProductCustomer {
  name: string;
  type: 'Company' | 'Organization' | 'School' | 'Government';
  revenueContribution: number;
}

export interface ProductHistoryPoint {
  month: string;
  traffic: number; // Unique visits
  profit: number;
  serverCost: number;
  inputCost: number; // Dev hours cost
}

export interface ProductComment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

export interface ServerStatusLog {
  id: string;
  type: 'MAINTENANCE' | 'OUTAGE' | 'OPERATIONAL';
  description: string;
  date: Date;
  durationMinutes: number;
}

export interface BugReport {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  reportedBy: string;
  status: 'OPEN' | 'RESOLVED';
  date: Date;
}

export interface AIProductAnalysis {
  summary: string;
  futureOutlook: string;
  predictedGrowth: number; // percentage
  keyRisks: string[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'Live' | 'Beta' | 'Maintenance';
  logoColor: string;
  history: ProductHistoryPoint[]; // 6 months data
  topCustomers: ProductCustomer[];
  
  // Dev Zone
  devComments: ProductComment[];
  serverLogs: ServerStatusLog[];
  bugReports: BugReport[];
}