export type UserRole = 'admin' | 'auditor' | 'employee';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  department_id?: number;
  createdAt: any;
}

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  category: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  submissionDate: any;
  violation?: boolean;
  violationDetails?: string;
  auditorId?: string;
  auditDate?: any;
  rejectionReason?: string;
  fraudScore?: number; // 0-100
  isDuplicate?: boolean;
  isEmergency?: boolean;
  receiptAuthentic?: boolean;
  priority?: 'High' | 'Medium' | 'Low';
}

export interface Policy {
  id: string;
  category: string;
  maxAmount: number;
  department?: string;
}

export interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
}

export const EXPENSE_CATEGORIES = [
  'Lab components expenses',
  'Classroom maintenance expenses',
  'Infrastructure expenses',
  'Event expenses',
  'Sports expenses',
  'Skill enhancement program expenses',
  'Hostel management expenses',
  'Hostel food expenses',
  'Emergency expenses',
  'Examination expenses',
  'Revaluation expenses',
  'Transport expenses',
  'Industrial visit (IV) expenses',
  'Tour expenses'
];

export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence',
  'General Engineering'
];
