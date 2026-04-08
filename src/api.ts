import { PREDEFINED_CREDENTIALS } from './authData';

// Mock data for initial state
const INITIAL_DEPARTMENTS = [
  { id: '1', name: 'Administration', budget: 1000000, spent: 0 },
  { id: '2', name: 'Computer Science', budget: 500000, spent: 0 },
  { id: '3', name: 'Information Technology', budget: 500000, spent: 0 },
  { id: '4', name: 'Mechanical Engineering', budget: 500000, spent: 0 },
  { id: '5', name: 'Civil Engineering', budget: 500000, spent: 0 },
  { id: '6', name: 'Electrical & Electronics', budget: 500000, spent: 0 },
  { id: '7', name: 'Electronics & Communication', budget: 500000, spent: 0 },
  { id: '8', name: 'Hostel Management', budget: 800000, spent: 0 },
  { id: '9', name: 'Transport', budget: 600000, spent: 0 },
  { id: '10', name: 'Sports', budget: 300000, spent: 0 },
  { id: '11', name: 'Event Management', budget: 400000, spent: 0 },
  { id: '12', name: 'Finance', budget: 1000000, spent: 0 },
  { id: '13', name: 'Audit Board', budget: 200000, spent: 0 },
];

const INITIAL_POLICIES = [
  { id: '1', category: 'Lab components', limit_amount: 50000, description: 'Maximum limit for lab equipment per request' },
  { id: '2', category: 'Classroom expenses', limit_amount: 10000, description: 'Maximum limit for classroom maintenance' },
  { id: '3', category: 'Infrastructure expenses', limit_amount: 100000, description: 'Maximum limit for infrastructure repairs' },
  { id: '4', category: 'Event and sports expenses', limit_amount: 25000, description: 'Maximum limit for sports events' },
  { id: '5', category: 'Skill enhancement expenses', limit_amount: 15000, description: 'Maximum limit for workshops/seminars' },
  { id: '6', category: 'Hostel management expenses', limit_amount: 200000, description: 'Maximum limit for hostel food/supplies' },
  { id: '7', category: 'Emergency expenses', limit_amount: 5000, description: 'Maximum limit for emergency petty cash' },
  { id: '8', category: 'Exam and revaluation expenses', limit_amount: 20000, description: 'Maximum limit for exam related costs' },
  { id: '9', category: 'Transport expenses', limit_amount: 50000, description: 'Maximum limit for vehicle maintenance' },
  { id: '10', category: 'Industrial visit and tour expenses', limit_amount: 75000, description: 'Maximum limit for IV/Tours' },
];

// Map PREDEFINED_CREDENTIALS to the format used by the mock DB
const INITIAL_USERS = PREDEFINED_CREDENTIALS.map((u, index) => {
  const dept = INITIAL_DEPARTMENTS.find(d => d.name === u.department);
  return {
    id: (index + 1).toString(),
    username: u.userId,
    password: u.password, // Store password for mock check
    name: u.name,
    role: u.role,
    department: u.department,
    department_id: dept ? parseInt(dept.id) : 1
  };
});

const INITIAL_EXPENSES = [
  {
    id: '101',
    department_id: 2,
    category: 'Lab components',
    amount: 45000,
    description: 'New microcontrollers for IoT Lab',
    date: '2026-03-10',
    status: 'pending',
    created_by: '2',
    creator_name: 'Dr. Ramesh',
    department_name: 'Computer Science',
    created_at: '2026-03-10T10:00:00Z',
    violation_flag: false,
    violation_details: null,
    receipt_url: 'https://picsum.photos/seed/receipt1/800/1000'
  },
  {
    id: '102',
    department_id: 3,
    category: 'Skill enhancement expenses',
    amount: 12000,
    description: 'Workshop on Cloud Computing',
    date: '2026-03-12',
    status: 'approved',
    created_by: '3',
    creator_name: 'Prof. Priya',
    department_name: 'Information Technology',
    created_at: '2026-03-12T14:30:00Z',
    violation_flag: false,
    violation_details: null,
    receipt_url: 'https://picsum.photos/seed/receipt2/800/1000'
  },
  {
    id: '103',
    department_id: 4,
    category: 'Infrastructure expenses',
    amount: 120000,
    description: 'Mechanical Workshop Roof Repair',
    date: '2026-03-14',
    status: 'pending',
    created_by: '4',
    creator_name: 'Mr. Kumar',
    department_name: 'Mechanical Engineering',
    created_at: '2026-03-14T09:15:00Z',
    violation_flag: true,
    violation_details: 'Amount 120000 exceeds policy limit of 100000 for Infrastructure expenses',
    receipt_url: 'https://picsum.photos/seed/receipt3/800/1000'
  },
  {
    id: '104',
    department_id: 9,
    category: 'Transport expenses',
    amount: 35000,
    description: 'Bus #12 Engine Maintenance',
    date: '2026-03-15',
    status: 'approved',
    created_by: '9',
    creator_name: 'Mr. Selvam',
    department_name: 'Transport',
    created_at: '2026-03-15T11:45:00Z',
    violation_flag: false,
    violation_details: null,
    receipt_url: 'https://picsum.photos/seed/receipt4/800/1000'
  },
  {
    id: '105',
    department_id: 10,
    category: 'Event and sports expenses',
    amount: 28000,
    description: 'Annual Sports Meet Trophies',
    date: '2026-03-16',
    status: 'pending',
    created_by: '10',
    creator_name: 'Coach Mani',
    department_name: 'Sports',
    created_at: '2026-03-16T16:20:00Z',
    violation_flag: true,
    violation_details: 'Amount 28000 exceeds policy limit of 25000 for Event and sports expenses',
    receipt_url: 'https://picsum.photos/seed/receipt5/800/1000'
  }
];

// Initialize local storage if empty
const initStorage = () => {
  const existingExpenses = localStorage.getItem('nct_expenses');
  if (!existingExpenses || JSON.parse(existingExpenses).length === 0) {
    localStorage.setItem('nct_expenses', JSON.stringify(INITIAL_EXPENSES));
  }
  if (!localStorage.getItem('nct_departments')) localStorage.setItem('nct_departments', JSON.stringify(INITIAL_DEPARTMENTS));
  if (!localStorage.getItem('nct_policies')) localStorage.setItem('nct_policies', JSON.stringify(INITIAL_POLICIES));
  
  // Always refresh users to ensure credentials match authData.ts
  localStorage.setItem('nct_users', JSON.stringify(INITIAL_USERS));
};

initStorage();

export const apiFetch = async (endpoint: string, options: any = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const expenses = JSON.parse(localStorage.getItem('nct_expenses') || '[]');
  const departments = JSON.parse(localStorage.getItem('nct_departments') || '[]');
  const policies = JSON.parse(localStorage.getItem('nct_policies') || '[]');
  const users = JSON.parse(localStorage.getItem('nct_users') || '[]');

  if (endpoint === '/api/login') {
    const { username, password } = JSON.parse(options.body);
    const user = users.find((u: any) => u.username === username);
    
    // In mock mode, check password if provided, otherwise allow if user exists
    if (user && (!password || user.password === password)) {
      return {
        token: 'mock_token_' + Date.now(),
        user: {
          ...user,
          department_name: user.department
        }
      };
    }
    throw new Error('Invalid username or password');
  }

  if (endpoint === '/api/expenses') {
    const user = JSON.parse(localStorage.getItem('nct_auth_user') || 'null');
    if (!user) throw new Error('Unauthorized');

    if (user.role === 'employee') {
      return expenses.filter((e: any) => e.department_id === user.department_id);
    }
    return expenses;
  }

  if (endpoint === '/api/departments') return departments;
  if (endpoint === '/api/policies') return policies;

  if (endpoint === '/api/approve-expense') {
    const { expense_id } = JSON.parse(options.body);
    const updatedExpenses = expenses.map((e: any) => {
      if (e.id === expense_id) {
        // Update department spent
        const depts = JSON.parse(localStorage.getItem('nct_departments') || '[]');
        const updatedDepts = depts.map((d: any) => {
          if (d.id.toString() === e.department_id.toString()) {
            return { ...d, spent: d.spent + parseFloat(e.amount) };
          }
          return d;
        });
        localStorage.setItem('nct_departments', JSON.stringify(updatedDepts));
        return { ...e, status: 'approved' };
      }
      return e;
    });
    localStorage.setItem('nct_expenses', JSON.stringify(updatedExpenses));
    return { message: 'Approved' };
  }

  if (endpoint === '/api/reject-expense') {
    const { expense_id } = JSON.parse(options.body);
    const updatedExpenses = expenses.map((e: any) => {
      if (e.id === expense_id) return { ...e, status: 'rejected' };
      return e;
    });
    localStorage.setItem('nct_expenses', JSON.stringify(updatedExpenses));
    return { message: 'Rejected' };
  }

  return {};
};

export const apiUpload = async (endpoint: string, formData: FormData) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (endpoint === '/api/upload-expense') {
    const user = JSON.parse(localStorage.getItem('nct_auth_user') || 'null');
    const expenses = JSON.parse(localStorage.getItem('nct_expenses') || '[]');
    const policies = JSON.parse(localStorage.getItem('nct_policies') || '[]');

    const category = formData.get('category') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const department_id = formData.get('department_id') as string;

    // Policy check
    const policy = policies.find((p: any) => p.category === category);
    let violation_flag = false;
    let violation_details = null;

    if (policy && amount > policy.limit_amount) {
      violation_flag = true;
      violation_details = `Amount ${amount} exceeds policy limit of ${policy.limit_amount} for ${category}`;
    }

    const receipt = formData.get('receipt');
    const receipt_url = receipt ? `https://picsum.photos/seed/${Date.now()}/800/1000` : null;

    const newExpense = {
      id: Date.now().toString(),
      department_id: parseInt(department_id),
      category,
      amount,
      description,
      date,
      status: 'pending',
      created_by: user.uid,
      creator_name: user.name,
      department_name: user.department,
      created_at: new Date().toISOString(),
      violation_flag,
      violation_details,
      receipt_url
    };

    expenses.unshift(newExpense);
    localStorage.setItem('nct_expenses', JSON.stringify(expenses));
    return newExpense;
  }

  return {};
};
