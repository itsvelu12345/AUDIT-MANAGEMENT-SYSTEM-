import React from 'react';
import { motion } from 'motion/react';
import { LogOut, User, LayoutDashboard, FileText, Settings, ShieldCheck, Menu, X, CheckCircle, Bot } from 'lucide-react';
import { UserProfile, Policy } from '../types';
import { AnimatePresence } from 'motion/react';
import AuditAssistant from './AuditAssistant';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  policies: Policy[];
  onLogout: () => void;
}

export default function Layout({ children, user, policies, onLogout }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [showAIAssistant, setShowAIAssistant] = React.useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', roles: ['admin', 'auditor', 'employee'] },
    { icon: FileText, label: 'Expenses', id: 'expenses', roles: ['admin', 'auditor', 'employee'] },
    { icon: CheckCircle, label: 'Audit', id: 'audit', roles: ['admin', 'auditor'] },
    { icon: ShieldCheck, label: 'Policies', id: 'policies', roles: ['admin', 'auditor'] },
    { icon: Settings, label: 'Admin Panel', id: 'admin', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  // Scroll Spy Logic
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100; // Offset for header

      sections.forEach((section, index) => {
        if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
          setActiveSection(navItems[index].id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-[#0F172A] text-white flex flex-col transition-all duration-300 ease-in-out fixed h-full z-50"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <img 
                src="/logo.jpeg" 
                alt="NCT Logo" 
                className="w-8 h-8 object-contain rounded-lg shadow-lg border border-white/10"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-lg tracking-tight">NCT Auditing</span>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                activeSection === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${
                activeSection === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
              }`} />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`font-medium transition-colors ${
                    activeSection === item.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}

          {/* AI Assistant Toggle */}
          <button
            onClick={() => setShowAIAssistant(true)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group hover:bg-blue-500/10 text-slate-400 hover:text-blue-400`}
          >
            <Bot className="w-5 h-5 transition-colors group-hover:text-blue-400" />
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium"
              >
                {user?.role === 'employee' ? 'Expense Assistant' : 'Audit Assistant'}
              </motion.span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-4 p-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="text-sm font-semibold truncate max-w-[140px]">{user?.name || 'User'}</span>
                <span className="text-xs text-slate-400 capitalize">{user?.role || 'Role'}</span>
              </motion.div>
            )}
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-3 mt-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-slate-800">Nandha College of Technology</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.department || 'Department'}</p>
              <p className="text-xs text-slate-500">Academic Year 2025-26</p>
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* AI Assistant Sidebar Overlay */}
      <AnimatePresence>
        {showAIAssistant && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIAssistant(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <div className="relative z-10 h-full">
              <AuditAssistant 
                selectedExpense={null}
                policies={policies}
                user={user}
                onClose={() => setShowAIAssistant(false)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
