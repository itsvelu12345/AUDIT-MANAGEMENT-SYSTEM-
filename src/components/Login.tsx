import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Lock, 
  ArrowRight, Loader2, 
  ShieldCheck, Briefcase
} from 'lucide-react';
import { UserRole } from '../types';
import { AuthUser } from '../authData';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRoleGroup, setSelectedRoleGroup] = React.useState<'admin_auditor' | 'employee' | null>(null);
  const [role, setRole] = React.useState<UserRole>('employee');
  const [userId, setUserId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // The actual validation happens in App.tsx via handleLogin which calls the mock API
      await onLogin({ userId, password, role, name: userId });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (group: 'admin_auditor' | 'employee') => {
    setSelectedRoleGroup(group);
    setRole(group === 'admin_auditor' ? 'admin' : 'employee');
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans">
      {/* Background Image Placeholder with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: 'url("/enchanced_image.jpg")',
          filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
          imageRendering: 'auto'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* College Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 text-white flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <img 
              src="/logo.jpeg" 
              alt="NCT Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-xl shadow-lg border-2 border-white/20"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg text-left">
              Nandha College of Technology
            </h1>
          </div>
          <p className="text-xl md:text-2xl font-medium text-blue-400 drop-shadow-md">
            Auditing system
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-10">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => handleRoleSelect('admin_auditor')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${
                  selectedRoleGroup === 'admin_auditor'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-[#D2B48C]/30 hover:bg-[#D2B48C]/5 hover:text-[#D2B48C]'
                }`}
              >
                <ShieldCheck className={`w-8 h-8 mb-3 transition-all duration-300 ${selectedRoleGroup === 'admin_auditor' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-bold uppercase tracking-wider">Admin / Auditor</span>
              </button>

              <button
                onClick={() => handleRoleSelect('employee')}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 group ${
                  selectedRoleGroup === 'employee'
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-[#D2B48C]/30 hover:bg-[#D2B48C]/5 hover:text-[#D2B48C]'
                }`}
              >
                <Briefcase className={`w-8 h-8 mb-3 transition-all duration-300 ${selectedRoleGroup === 'employee' ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-bold uppercase tracking-wider">Employee</span>
              </button>
            </div>

            {/* Login Form */}
            <AnimatePresence mode="wait">
              {selectedRoleGroup && (
                <motion.form
                  key={selectedRoleGroup}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">User ID</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="text"
                          value={userId}
                          onChange={e => setUserId(e.target.value)}
                          placeholder="Enter your User ID"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-800"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Login
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {!selectedRoleGroup && (
              <div className="text-center py-8">
                <p className="text-slate-400 font-medium italic">Please select your role to continue</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-white/60 text-sm font-medium"
        >
          © 2026 Nandha College of Technology. All rights reserved.
        </motion.p>
      </div>
    </div>
  );
}
