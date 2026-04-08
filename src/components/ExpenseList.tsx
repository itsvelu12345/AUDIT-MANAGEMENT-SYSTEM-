import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, XCircle, Eye, AlertTriangle, 
  FileText, Search, Filter, ChevronDown, 
  MoreVertical, Download, Calendar, User, 
  DollarSign, Building2, Tag, Info 
} from 'lucide-react';
import { Expense, UserProfile } from '../types';

interface ExpenseListProps {
  user: UserProfile | null;
  expenses: Expense[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export default function ExpenseList({ user, expenses, onApprove, onReject }: ExpenseListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [isRejecting, setIsRejecting] = React.useState(false);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    
    // Employees only see their own expenses
    if (user?.role === 'employee') {
      return matchesSearch && matchesStatus && e.employeeId === user.uid;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleReject = async () => {
    if (!selectedExpense || !rejectionReason) return;
    await onReject(selectedExpense.id, rejectionReason);
    setSelectedExpense(null);
    setRejectionReason('');
    setIsRejecting(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by employee, category, or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expense Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all group relative overflow-hidden"
          >
            {expense.violation && (
              <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white rounded-bl-xl flex items-center gap-1 shadow-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Flagged</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
              {expense.receiptUrl && (
                <div 
                  className="w-full lg:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer group/thumb relative"
                  onClick={() => setSelectedExpense(expense)}
                >
                  <img 
                    src={expense.receiptUrl} 
                    alt="Receipt Thumbnail" 
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    expense.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                    expense.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{expense.category}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {expense.submissionDate ? new Date(expense.submissionDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{expense.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <User className="w-3 h-3" />
                    {expense.employeeName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Building2 className="w-3 h-3" />
                    {expense.department}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <DollarSign className="w-3 h-3" />
                    ₹{(expense.amount || 0).toLocaleString()}
                  </div>
                  {expense.receiptUrl && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <FileText className="w-3 h-3" />
                      Receipt Attached
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setSelectedExpense(expense)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>

                {user?.role !== 'employee' && expense.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onApprove(expense.id)}
                      className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsRejecting(true);
                      }}
                      className="w-full sm:w-auto px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}

                {expense.status !== 'pending' && (
                  <div className={`px-6 py-2 rounded-xl text-sm font-bold capitalize flex items-center gap-2 ${
                    expense.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {expense.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {expense.status}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Expense Details</h2>
                  <p className="text-sm text-slate-500">ID: {selectedExpense.id}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedExpense(null);
                  setIsRejecting(false);
                }} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Info</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedExpense.employeeName}</p>
                        <p className="text-xs text-slate-500">{selectedExpense.department}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expense Category</label>
                    <p className="mt-2 font-semibold text-slate-800 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-500" />
                      {selectedExpense.category}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</label>
                    <p className="mt-2 text-3xl font-black text-slate-900">₹{(selectedExpense.amount || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold capitalize ${
                      selectedExpense.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      selectedExpense.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedExpense.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : 
                       selectedExpense.status === 'rejected' ? <XCircle className="w-4 h-4" /> : 
                       <Info className="w-4 h-4" />}
                      {selectedExpense.status}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submission Date</label>
                    <p className="mt-2 text-slate-700 font-medium">
                      {selectedExpense.submissionDate ? new Date(selectedExpense.submissionDate).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedExpense.receiptUrl && (
                <div className="pt-8 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt Evidence</label>
                  <div className="mt-4 relative group">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                      <img 
                        src={selectedExpense.receiptUrl} 
                        alt="Receipt" 
                        className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://picsum.photos/seed/error/800/1000?grayscale';
                        }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-xs text-slate-500 italic">Click the image or link to view full size</p>
                      <a 
                        href={selectedExpense.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors text-sm bg-blue-50 px-4 py-2 rounded-xl"
                      >
                        <Download className="w-4 h-4" />
                        View Full Document
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedExpense.description}
                </div>
              </div>

              {selectedExpense.violation && selectedExpense.violationDetails && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Policy Violation Flagged</span>
                  </div>
                  <p className="text-sm text-amber-600 ml-7">{selectedExpense.violationDetails}</p>
                </div>
              )}

              {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <XCircle className="w-5 h-5" />
                    <span>Rejection Reason</span>
                  </div>
                  <p className="text-sm text-rose-600 ml-7">{selectedExpense.rejectionReason}</p>
                </div>
              )}

              {isRejecting && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-100"
                >
                  <label className="text-sm font-bold text-slate-700">Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Explain why this expense is being rejected..."
                    rows={3}
                    className="w-full p-4 bg-rose-50/50 border border-rose-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {!isRejecting && user?.role !== 'employee' && selectedExpense.status === 'pending' && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-6 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all"
                >
                  Reject Expense
                </button>
                <button
                  onClick={() => {
                    onApprove(selectedExpense.id);
                    setSelectedExpense(null);
                  }}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Approve Expense
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
