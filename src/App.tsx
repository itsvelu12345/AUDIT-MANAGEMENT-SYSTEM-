import React from 'react';
import { useState, useEffect } from 'react';
import { UserProfile, Expense, Policy, Department, UserRole } from './types';
import { AuthUser } from './authData';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import AdminPanel from './components/AdminPanel';
import AuditorPage from './components/AuditorPage';
import Login from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2, ShieldCheck } from 'lucide-react';
import { apiFetch, apiUpload } from './api';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'policies' | 'admin' | 'audit'>('dashboard');

  // Auth Initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('nct_auth_user');
    const token = localStorage.getItem('nct_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [expensesData, policiesData, departmentsData] = await Promise.all([
          apiFetch('/api/expenses'),
          apiFetch('/api/policies'),
          apiFetch('/api/departments')
        ]);

        setExpenses(expensesData.map((e: any) => ({
          ...e,
          id: e.id.toString(),
          submissionDate: e.created_at,
          department: e.department_name,
          employeeName: e.creator_name,
          receiptUrl: e.receipt_url,
          violation: e.violation_flag,
          violationDetails: e.violation_details
        })));

        setPolicies(policiesData.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          maxAmount: parseFloat(p.limit_amount || p.maxAmount || 0)
        })));

        setDepartments(departmentsData.map((d: any) => ({
          ...d,
          id: d.id.toString(),
          budget: parseFloat(d.budget),
          spent: parseFloat(d.spent)
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = async (authUser: AuthUser) => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: authUser.userId,
          password: authUser.password
        })
      });

      const userProfile: UserProfile = {
        uid: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email || `${response.user.username}@nct.ac.in`,
        role: response.user.role,
        department: response.user.department,
        department_id: response.user.department_id,
        createdAt: new Date().toISOString() as any
      };

      localStorage.setItem('nct_token', response.token);
      localStorage.setItem('nct_auth_user', JSON.stringify(userProfile));
      setUser(userProfile);
    } catch (error: any) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nct_token');
    localStorage.removeItem('nct_auth_user');
    setUser(null);
  };

  const handleSubmitExpense = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('amount', data.amount.toString());
      formData.append('description', data.description);
      formData.append('date', data.date || new Date().toISOString().split('T')[0]);
      formData.append('department_id', user?.department_id?.toString() || '');
      if (data.receiptFile) {
        formData.append('receipt', data.receiptFile);
      }

      await apiUpload('/api/upload-expense', formData);
      
      // Refresh data
      const expensesData = await apiFetch('/api/expenses');
      setExpenses(expensesData.map((e: any) => ({
        ...e,
        id: e.id.toString(),
        submissionDate: e.created_at,
        department: e.department_name,
        employeeName: e.creator_name,
        receiptUrl: e.receipt_url,
        violation: e.violation_flag,
        violationDetails: e.violation_details
      })));
      
      setShowExpenseForm(false);
    } catch (error: any) {
      console.error('Error submitting expense:', error);
      alert(error.message || 'Failed to submit expense');
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await apiFetch('/api/approve-expense', {
        method: 'POST',
        body: JSON.stringify({ expense_id: id, comments: 'Approved via dashboard' })
      });
      
      // Refresh data
      const [expensesData, departmentsData] = await Promise.all([
        apiFetch('/api/expenses'),
        apiFetch('/api/departments')
      ]);
      
      setExpenses(expensesData.map((e: any) => ({
        ...e,
        id: e.id.toString(),
        submissionDate: e.created_at,
        department: e.department_name,
        employeeName: e.creator_name,
        receiptUrl: e.receipt_url,
        violation: e.violation_flag,
        violationDetails: e.violation_details
      })));

      setDepartments(departmentsData.map((d: any) => ({
        ...d,
        id: d.id.toString(),
        budget: parseFloat(d.budget),
        spent: parseFloat(d.spent)
      })));
    } catch (error: any) {
      console.error('Error approving expense:', error);
      alert(error.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (id: string, reason: string) => {
    try {
      await apiFetch('/api/reject-expense', {
        method: 'POST',
        body: JSON.stringify({ expense_id: id, comments: reason })
      });
      
      // Refresh data
      const expensesData = await apiFetch('/api/expenses');
      setExpenses(expensesData.map((e: any) => ({
        ...e,
        id: e.id.toString(),
        submissionDate: e.created_at,
        department: e.department_name,
        employeeName: e.creator_name,
        receiptUrl: e.receipt_url,
        violation: e.violation_flag,
        violationDetails: e.violation_details
      })));
    } catch (error: any) {
      console.error('Error rejecting expense:', error);
      alert(error.message || 'Failed to reject expense');
    }
  };

  const handleAddPolicy = async (policy: Omit<Policy, 'id'>) => {
    alert('Policy management via API to be implemented');
  };

  const handleUpdatePolicy = async (policy: Policy) => {
    alert('Policy management via API to be implemented');
  };

  const handleDeletePolicy = async (id: string) => {
    alert('Policy management via API to be implemented');
  };

  const handleUpdateDepartment = async (dept: Department) => {
    alert('Department management via API to be implemented');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <img 
            src="/logo.jpeg" 
            alt="NCT Logo" 
            className="w-24 h-24 object-contain rounded-3xl shadow-2xl border-2 border-white/10"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">NCT Auditing</h1>
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing System...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={user} policies={policies} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-20 bg-[#F8FAFC]/80 backdrop-blur-md z-30 py-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Institutional Overview</h2>
            <p className="text-slate-500 mt-1">Manage and track your institutional finances with precision.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex">
              {(['dashboard', 'expenses', 'audit', 'policies', 'admin'] as const).map((tab) => {
                const isAllowed = (tab === 'dashboard' || tab === 'expenses') || 
                                 (tab === 'audit' && (user.role === 'auditor' || user.role === 'admin')) ||
                                 (tab === 'policies' && user.role !== 'employee') ||
                                 (tab === 'admin' && user.role === 'admin');
                
                if (!isAllowed) return null;

                return (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  >
                    {tab === 'admin' ? 'Admin' : tab}
                  </button>
                );
              })}
            </div>

            {user.role === 'employee' && (
              <button
                onClick={() => setShowExpenseForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Expense
              </button>
            )}
          </div>
        </div>

        <div className="space-y-24 pb-20">
          <section id="dashboard" className="scroll-mt-32">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                Dashboard
              </h3>
            </div>
            <Dashboard user={user} expenses={expenses} departments={departments} />
          </section>

          <section id="expenses" className="scroll-mt-32">
            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-emerald-600 rounded-full"></span>
                Expense Management
              </h3>
            </div>
            <ExpenseList 
              user={user} 
              expenses={expenses} 
              onApprove={handleApproveExpense} 
              onReject={handleRejectExpense} 
            />
          </section>

          {(user.role === 'auditor' || user.role === 'admin') && (
            <section id="audit" className="scroll-mt-32">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Audit Dashboard
                </h3>
              </div>
              <AuditorPage 
                user={user} 
                expenses={expenses} 
                policies={policies}
                onApprove={handleApproveExpense} 
                onReject={handleRejectExpense} 
              />
            </section>
          )}

          {user.role !== 'employee' && (
            <section id="policies" className="scroll-mt-32">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-2 h-8 bg-amber-600 rounded-full"></span>
                  Financial Policies
                </h3>
              </div>
              <AdminPanel 
                policies={policies} 
                departments={departments}
                onAddPolicy={handleAddPolicy}
                onUpdatePolicy={handleUpdatePolicy}
                onDeletePolicy={handleDeletePolicy}
                onUpdateDepartment={handleUpdateDepartment}
                hideDepartments={true}
              />
            </section>
          )}

          {user.role === 'admin' && (
            <section id="admin" className="scroll-mt-32">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                  Administration
                </h3>
              </div>
              <AdminPanel 
                policies={policies} 
                departments={departments}
                onAddPolicy={handleAddPolicy}
                onUpdatePolicy={handleUpdatePolicy}
                onDeletePolicy={handleDeletePolicy}
                onUpdateDepartment={handleUpdateDepartment}
                hidePolicies={true}
              />
            </section>
          )}
        </div>

        {showExpenseForm && (
          <ExpenseForm 
            user={user} 
            policies={policies} 
            department={departments.find(d => d.name === user.department) || null}
            onSubmit={handleSubmitExpense} 
            onClose={() => setShowExpenseForm(false)} 
          />
        )}
      </div>
    </Layout>
  );
}
