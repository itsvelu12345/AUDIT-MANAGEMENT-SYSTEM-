import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, Plus, Trash2, Edit2, 
  Save, X, Building2, Tag, DollarSign, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Policy, Department, EXPENSE_CATEGORIES, DEPARTMENTS } from '../types';

interface AdminPanelProps {
  policies: Policy[];
  departments: Department[];
  onUpdatePolicy: (policy: Policy) => Promise<void>;
  onAddPolicy: (policy: Omit<Policy, 'id'>) => Promise<void>;
  onDeletePolicy: (id: string) => Promise<void>;
  onUpdateDepartment: (dept: Department) => Promise<void>;
  hidePolicies?: boolean;
  hideDepartments?: boolean;
}

export default function AdminPanel({ 
  policies, 
  departments, 
  onUpdatePolicy, 
  onAddPolicy, 
  onDeletePolicy, 
  onUpdateDepartment,
  hidePolicies = false,
  hideDepartments = false
}: AdminPanelProps) {
  const [isAddingPolicy, setIsAddingPolicy] = React.useState(false);
  const [newPolicy, setNewPolicy] = React.useState({ category: '', maxAmount: 0, department: '' });
  const [editingPolicy, setEditingPolicy] = React.useState<string | null>(null);
  const [editingDept, setEditingDept] = React.useState<string | null>(null);

  return (
    <div className="space-y-12 pb-20">
      {/* Policy Management */}
      {!hidePolicies && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Financial Policies</h2>
            </div>
            <button
              onClick={() => setIsAddingPolicy(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Policy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAddingPolicy && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-50 p-6 rounded-2xl border-2 border-dashed border-blue-200 space-y-4"
              >
                <h3 className="font-bold text-blue-800">New Policy</h3>
                <div className="space-y-3">
                  <select
                    value={newPolicy.category}
                    onChange={e => setNewPolicy({ ...newPolicy, category: e.target.value })}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Max Amount (₹)"
                    value={newPolicy.maxAmount || ''}
                    onChange={e => setNewPolicy({ ...newPolicy, maxAmount: parseFloat(e.target.value) })}
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        onAddPolicy(newPolicy);
                        setIsAddingPolicy(false);
                        setNewPolicy({ category: '', maxAmount: 0, department: '' });
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAddingPolicy(false)}
                      className="flex-1 py-2 bg-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {policies.map((policy, index) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Tag className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingPolicy(policy.id)}
                      className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeletePolicy(policy.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {editingPolicy === policy.id ? (
                  <div className="space-y-4">
                    <input
                      type="number"
                      defaultValue={policy.maxAmount}
                      onBlur={(e) => {
                        onUpdatePolicy({ ...policy, maxAmount: parseFloat(e.target.value) });
                        setEditingPolicy(null);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                    <p className="text-xs text-slate-400">Press Enter or click away to save</p>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-slate-800 mb-1">{policy.category}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Limit:</span>
                      <span className="text-xl font-black text-slate-900">₹{(policy.maxAmount || 0).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Department Management */}
      {!hideDepartments && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Department Budgets</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">{dept.name}</h3>
                  <button 
                    onClick={() => setEditingDept(dept.id)}
                    className="p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Budget</label>
                      {editingDept === dept.id ? (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={dept.budget}
                            onBlur={(e) => {
                              onUpdateDepartment({ ...dept, budget: parseFloat(e.target.value) });
                              setEditingDept(null);
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-2xl font-black text-slate-900">₹{(dept.budget || 0).toLocaleString()}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spent Amount</label>
                      <p className="mt-1 text-2xl font-black text-emerald-600">₹{(dept.spent || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-slate-500">Budget Utilization</span>
                      <span className={`${(dept.spent / dept.budget) > 0.9 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {Math.round((dept.spent / dept.budget) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (dept.spent / dept.budget) * 100)}%` }}
                        className={`h-full rounded-full ${
                          (dept.spent / dept.budget) > 0.9 ? 'bg-rose-500' : 
                          (dept.spent / dept.budget) > 0.7 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  {(dept.spent / dept.budget) > 0.9 && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      CRITICAL: Budget nearly exhausted!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
