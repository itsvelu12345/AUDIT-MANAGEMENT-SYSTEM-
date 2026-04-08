import { UserRole } from './types';

export interface AuthUser {
  userId: string;
  password: string;
  role: UserRole;
  name: string;
  department?: string;
}

export const PREDEFINED_CREDENTIALS: AuthUser[] = [
  // ADMIN
  {
    userId: 'pradeep',
    password: '1234',
    role: 'admin',
    name: 'Pradeep (Admin)',
    department: 'Administration'
  },
  // AUDITORS
  {
    userId: 'ahmed',
    password: '1234',
    role: 'auditor',
    name: 'Ahmed (Auditor)',
    department: 'Finance'
  },
  // EMPLOYEES
  {
    userId: 'mounish',
    password: '1234',
    role: 'employee',
    name: 'Mounish (Employee)',
    department: 'Computer Science'
  }
];
