import React from 'react';
import { motion } from 'motion/react';
import { Upload, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, UserProfile, Policy, Department } from '../types';

interface ExpenseFormProps {
  user: UserProfile | null;
  policies: Policy[];
  department: Department | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function ExpenseForm({ user, policies, department, onSubmit, onClose }: ExpenseFormProps) {
  const [formData, setFormData] = React.useState({
    category: '',
    amount: '',
    description: '',
    receiptUrl: ''
  });
  const [violations, setViolations] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const checkPolicies = (category: string, amount: number) => {
    const newViolations: string[] = [];
    const policy = policies.find(p => p.category === category);
    
    if (policy && amount > policy.maxAmount) {
      newViolations.push(`Policy Violation: ${category} budget exceeded by ₹${((amount - policy.maxAmount) || 0).toLocaleString()}.`);
    }

    if (department && (department.spent + amount) > department.budget) {
      newViolations.push(`Policy Violation: Department total budget exceeded by ₹${((department.spent + amount - department.budget) || 0).toLocaleString()}.`);
    }

    setViolations(newViolations);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setFormData({ ...formData, amount: e.target.value });
    if (formData.category) checkPolicies(formData.category, amount);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setFormData({ ...formData, category });
    const amount = parseFloat(formData.amount) || 0;
    checkPolicies(category, amount);
  };

  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        receiptFile,
        submissionDate: new Date(),
        status: 'pending',
        employeeId: user?.uid,
        employeeName: user?.name,
        department: user?.department
      });
      onClose();
    } catch (err) {
      setError('Failed to submit expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Submit New Expense</h2>
            <p className="text-sm text-slate-500">Fill in the details for your reimbursement request.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Expense Category</label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Amount (₹)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about the expense..."
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Receipt / Bill Upload</label>
            <div className="relative">
              <input
                type="file"
                onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
                id="receipt-upload"
                accept="image/*,.pdf"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center gap-3 w-full p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-blue-300 transition-all cursor-pointer"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">
                    {receiptFile ? receiptFile.name : 'Click to upload receipt'}
                  </p>
                  <p className="text-xs text-slate-400">PDF or Image (Max 5MB)</p>
                </div>
              </label>
            </div>
          </div>

          {violations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Policy Violations Detected</span>
              </div>
              {violations.map((v, i) => (
                <p key={i} className="text-xs text-amber-600 ml-6">{v}</p>
              ))}
            </motion.div>
          )}

          {formData.category && formData.amount && violations.length === 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Expense complies with college policies.</span>
            </div>
          )}
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 font-semibold hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Expense'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
