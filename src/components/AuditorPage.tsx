import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, 
  MessageSquare, FileText, Calendar, Users, Building2,
  DollarSign, Clock, AlertCircle, ArrowRight, History,
  DownloadCloud, AlertTriangle, Info, TrendingUp, Shield,
  Zap, BarChart3, PieChart as PieChartIcon, Activity,
  FileWarning, Copy, Share2, Printer, Bot
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  Cell, PieChart, Pie
} from 'recharts';
import { Expense, UserProfile, Department, DEPARTMENTS, Policy } from '../types';

interface AuditorPageProps {
  user: UserProfile | null;
  expenses: Expense[];
  policies: Policy[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

// Mock Data for Intelligence Features
const BUDGET_DATA = [
  { name: 'Computer Science', spent: 450000, budget: 500000, score: 92 },
  { name: 'Information Technology', spent: 380000, budget: 400000, score: 88 },
  { name: 'Mechanical', spent: 520000, budget: 500000, score: 65 }, // Over budget
  { name: 'Electronics', spent: 290000, budget: 350000, score: 95 },
  { name: 'Civil', spent: 150000, budget: 300000, score: 98 },
];

const TREND_DATA = [
  { month: 'Jan', actual: 120000, predicted: 115000 },
  { month: 'Feb', actual: 145000, predicted: 140000 },
  { month: 'Mar', actual: 138000, predicted: 150000 },
  { month: 'Apr', actual: null, predicted: 165000 }, // Prediction
  { month: 'May', actual: null, predicted: 155000 },
];

const FRAUD_ALERTS = [
  { id: '1', type: 'Duplicate', message: 'Potential duplicate expense detected in IT Dept', severity: 'high' },
  { id: '2', type: 'Mismatch', message: 'Receipt amount does not match claimed amount for Lab Supplies', severity: 'medium' },
  { id: '3', type: 'Policy', message: 'Weekend submission for non-emergency category', severity: 'low' },
];

export default function AuditorPage({ user, expenses, policies, onApprove, onReject }: AuditorPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'intelligence'>('intelligence');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [remarks, setRemarks] = useState('');
  const [auditLogs, setAuditLogs] = useState<{ id: string; message: string; timestamp: string }[]>([
    { id: '1', message: 'AI Fraud Detection flagged Expense #4521', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '2', message: 'Mechanical Dept exceeded monthly budget by 4%', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  ]);

  // Enhance expenses with intelligence data for demo
  const enhancedExpenses = useMemo(() => {
    return expenses.map(e => ({
      ...e,
      fraudScore: e.fraudScore ?? Math.floor(Math.random() * 40), // Random low score for demo
      isDuplicate: e.isDuplicate ?? (e.amount === 1500 && e.department === 'Computer Science'), // Mock duplicate
      isEmergency: e.isEmergency ?? e.category === 'Emergency expenses',
      receiptAuthentic: e.receiptAuthentic ?? (Math.random() > 0.1),
      priority: e.amount > 10000 ? 'High' : e.amount > 5000 ? 'Medium' : 'Low'
    })) as Expense[];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const filtered = enhancedExpenses.filter(expense => {
      const matchesSearch = 
        expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = deptFilter === 'All' || expense.department === deptFilter;
      const matchesStatus = statusFilter === 'All' || expense.status === statusFilter;
      const matchesDate = !dateFilter || expense.submissionDate.includes(dateFilter);

      return matchesSearch && matchesDept && matchesStatus && matchesDate;
    });

    return filtered.sort((a, b) => {
      // Emergency first, then Fraud Score, then Priority
      if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
      if ((a.fraudScore || 0) !== (b.fraudScore || 0)) return (b.fraudScore || 0) - (a.fraudScore || 0);
      
      const pMap = { High: 3, Medium: 2, Low: 1 };
      const pA = pMap[a.priority || 'Low'];
      const pB = pMap[b.priority || 'Low'];
      if (pA !== pB) return pB - pA;
      
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    });
  }, [enhancedExpenses, searchTerm, deptFilter, statusFilter, dateFilter]);

  const stats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    fraudRisk: enhancedExpenses.filter(e => (e.fraudScore || 0) > 70).length,
    budgetAlerts: BUDGET_DATA.filter(d => d.spent > d.budget).length,
  };

  const handlePrintReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Nandha College of Technology', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Financial Audit Report', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 32, { align: 'center' });
    
    // Summary Stats
    doc.setFontSize(12);
    doc.text('Summary Statistics', 14, 45);
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Expenses', stats.total.toString()],
        ['Pending Approvals', stats.pending.toString()],
        ['High Risk Alerts', stats.fraudRisk.toString()],
        ['Budget Overages', stats.budgetAlerts.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Expense Details
    doc.text('Detailed Expense Audit', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Employee', 'Department', 'Category', 'Amount', 'Status', 'Risk']],
      body: filteredExpenses.map(e => [
        new Date(e.submissionDate).toLocaleDateString(),
        e.employeeName,
        e.department,
        e.category,
        `Rs. ${e.amount.toLocaleString()}`,
        e.status.toUpperCase(),
        `${e.fraudScore}%`
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] }
    });

    doc.save(`Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleApprove = (id: string) => {
    onApprove(id);
    setAuditLogs(prev => [{
      id: Math.random().toString(),
      message: `Verified & Approved: ${selectedExpense?.description}`,
      timestamp: new Date().toISOString()
    }, ...prev]);
    setSelectedExpense(null);
  };

  const handleReject = (id: string) => {
    if (!remarks) {
      alert('Please provide auditor remarks for rejection');
      return;
    }
    onReject(id, remarks);
    setAuditLogs(prev => [{
      id: Math.random().toString(),
      message: `Rejected: ${selectedExpense?.description}`,
      timestamp: new Date().toISOString()
    }, ...prev]);
    setSelectedExpense(null);
    setRemarks('');
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Financial Intelligence Unit</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Audit Intelligence</h1>
          <p className="text-slate-500 font-medium">AI-powered financial oversight and fraud detection.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-2xl flex">
            <button 
              onClick={() => setViewMode('intelligence')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'intelligence' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Intelligence
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Expense List
            </button>
          </div>
          <button 
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Printer className="w-5 h-5" />
            Generate PDF
          </button>
        </div>
      </div>

      {viewMode === 'intelligence' ? (
        <div className="space-y-8">
          {/* Intelligence Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Fraud Risk Alerts', value: stats.fraudRisk, icon: Shield, color: 'rose', trend: '+2 this week' },
              { label: 'Budget Overages', value: stats.budgetAlerts, icon: AlertCircle, color: 'amber', trend: '3 departments' },
              { label: 'Audit Score', value: '94/100', icon: CheckCircle, color: 'emerald', trend: 'Institutional Avg' },
              { label: 'Predicted Spend', value: '₹1.65L', icon: TrendingUp, color: 'blue', trend: 'Next Month' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Utilization */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Budget Utilization</h3>
                  <p className="text-sm text-slate-500">Spent vs Allocated by Department</p>
                </div>
                <BarChart3 className="w-6 h-6 text-slate-300" />
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BUDGET_DATA} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={120} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="spent" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={20} />
                    <Bar dataKey="budget" fill="#e2e8f0" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending Trends & Prediction */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Spending Intelligence</h3>
                  <p className="text-sm text-slate-500">Actual vs Predicted Trends</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                    <Area type="monotone" dataKey="predicted" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Fraud Alerts */}
            <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-rose-500" />
                AI Fraud Monitor
              </h3>
              <div className="space-y-4">
                {FRAUD_ALERTS.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-2xl border flex gap-3 ${
                    alert.severity === 'high' ? 'bg-rose-50 border-rose-100' : 
                    alert.severity === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                  }`}>
                    <FileWarning className={`w-5 h-5 shrink-0 ${
                      alert.severity === 'high' ? 'text-rose-600' : 
                      alert.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider mb-1 opacity-60">{alert.type}</p>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm">
                View All Risk Analysis
              </button>
            </div>

            {/* Department Leaderboard */}
            <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-500" />
                Spending Leaderboard
              </h3>
              <div className="space-y-4">
                {BUDGET_DATA.sort((a, b) => b.spent - a.spent).map((dept, i) => (
                  <div key={dept.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-xl text-xs font-black text-slate-500">
                        0{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${dept.spent > dept.budget ? 'bg-rose-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((dept.spent / dept.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-900">₹{(dept.spent / 1000).toFixed(1)}K</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Discipline Scores */}
            <div className="lg:col-span-1 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-500" />
                Discipline Scores
              </h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={BUDGET_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="score"
                    >
                      {BUDGET_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 90 ? '#10b981' : entry.score > 80 ? '#3b82f6' : '#f43f5e'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Avg Score</p>
                  <p className="text-xl font-black text-emerald-700">88.4</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-600 uppercase">Compliance</p>
                  <p className="text-xl font-black text-blue-700">92%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters Toolbar */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search employee, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
            >
              <option value="All">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
            />
          </div>

          {/* Advanced Table */}
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk & Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee & Dept</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Intelligence</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredExpenses.map((expense) => (
                    <tr 
                      key={expense.id} 
                      className={`hover:bg-slate-50/80 transition-all cursor-pointer group ${expense.isEmergency ? 'bg-amber-50/30' : ''}`}
                      onClick={() => setSelectedExpense(expense)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              expense.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                              expense.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {expense.priority}
                            </span>
                            {expense.isEmergency && (
                              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider animate-pulse">
                                Emergency
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(expense.submissionDate).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {expense.receiptUrl ? (
                            <div 
                              className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExpense(expense);
                              }}
                            >
                              <img 
                                src={expense.receiptUrl} 
                                alt="Receipt" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/800/1000';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                              <FileText className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-black text-slate-900">{expense.employeeName}</p>
                            <p className="text-xs text-blue-600 font-bold">{expense.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-900">₹{expense.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{expense.category}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                (expense.fraudScore || 0) > 70 ? 'bg-rose-500' : 
                                (expense.fraudScore || 0) > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="text-xs font-black text-slate-700">Risk: {expense.fraudScore}%</span>
                            </div>
                            <div className="flex gap-1">
                              {expense.isDuplicate && <Copy className="w-3.5 h-3.5 text-rose-500" title="Potential Duplicate" />}
                              {!expense.receiptAuthentic && <FileWarning className="w-3.5 h-3.5 text-amber-500" title="Receipt Mismatch" />}
                              {expense.receiptAuthentic && <Shield className="w-3.5 h-3.5 text-emerald-500" title="Verified Receipt" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          expense.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          expense.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                          <button className="p-2.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all"><DownloadCloud className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedExpense && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExpense(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 md:p-14 overflow-y-auto">
                <div className="flex items-start justify-between mb-12">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Audit Intelligence Review</span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        (selectedExpense.fraudScore || 0) > 70 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {(selectedExpense.fraudScore || 0) > 70 ? 'High Risk Alert' : 'Low Risk Profile'}
                      </span>
                      {selectedExpense.isEmergency && (
                        <span className="px-4 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Emergency Approval Required</span>
                      )}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedExpense.description}</h2>
                  </div>
                  <button onClick={() => setSelectedExpense(null)} className="p-4 hover:bg-slate-100 rounded-3xl transition-all text-slate-400"><XCircle className="w-10 h-10" /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-10">
                    {/* AI Analysis Card */}
                    <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black flex items-center gap-2">
                          <Shield className="w-6 h-6 text-blue-400" />
                          AI Risk Assessment
                        </h4>
                        <span className="text-3xl font-black text-blue-400">{selectedExpense.fraudScore}%</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Receipt Authenticity</span>
                          <span className={selectedExpense.receiptAuthentic ? 'text-emerald-400' : 'text-rose-400'}>
                            {selectedExpense.receiptAuthentic ? 'Verified' : 'Flagged'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Duplicate Check</span>
                          <span className={selectedExpense.isDuplicate ? 'text-rose-400' : 'text-emerald-400'}>
                            {selectedExpense.isDuplicate ? 'Potential Match Found' : 'Unique Submission'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              (selectedExpense.fraudScore || 0) > 70 ? 'bg-rose-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${selectedExpense.fraudScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                        <p className="text-3xl font-black text-slate-900">₹{selectedExpense.amount.toLocaleString()}</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                        <p className="text-lg font-black text-slate-900">{selectedExpense.department}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Users className="w-7 h-7" /></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Employee Profile</p>
                          <p className="text-lg font-black text-slate-900">{selectedExpense.employeeName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black text-slate-900 block">Auditor Decision Remarks</label>
                      <textarea 
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="AI suggests approval based on verified receipt. Add your notes here..."
                        className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[32px] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all h-40 resize-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-slate-900">Receipt Evidence</label>
                      <button className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Share Evidence
                      </button>
                    </div>
                    <div className="aspect-[4/5] bg-slate-100 rounded-[48px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {selectedExpense.receiptUrl ? (
                        <img 
                          src={selectedExpense.receiptUrl} 
                          alt="Receipt" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/800/1000';
                          }}
                        />
                      ) : (
                        <div className="text-center p-12">
                          <FileText className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                          <p className="text-slate-400 font-bold text-lg">No receipt evidence found</p>
                        </div>
                      )}
                      {selectedExpense.receiptUrl && (
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
                          <a 
                            href={selectedExpense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-white rounded-2xl font-black text-slate-900 flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform"
                          >
                            <Eye className="w-6 h-6" /> View Full Evidence
                          </a>
                          <a 
                            href={selectedExpense.receiptUrl}
                            download={`receipt_${selectedExpense.id}.jpg`}
                            className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-white flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform"
                          >
                            <DownloadCloud className="w-6 h-6" /> Download for Archive
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedExpense.status === 'pending' && (
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => handleApprove(selectedExpense.id)}
                    className="flex-[2] py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[24px] shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <CheckCircle className="w-7 h-7" /> Approve & Verify
                  </button>
                  <button 
                    onClick={() => handleReject(selectedExpense.id)}
                    className="flex-1 py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[24px] shadow-2xl shadow-rose-500/30 transition-all flex items-center justify-center gap-3"
                  >
                    <XCircle className="w-7 h-7" /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
