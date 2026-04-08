import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Loader2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { Expense, Policy, UserProfile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AuditAssistantProps {
  selectedExpense: Expense | null;
  policies: Policy[];
  user: UserProfile | null;
  onClose: () => void;
}

export default function AuditAssistant({ selectedExpense, policies, user, onClose }: AuditAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const auditorInstruction = `
You are a Secure AI Audit Assistant embedded in the LEFT NAVIGATION BAR of a financial auditing system.

INTERFACE CONTEXT:
- You appear when the auditor clicks a robot/chat icon in the left navbar
- When opened, you must greet with:
  "May I help you?"
- You provide responses inside a chat panel with an input/search bar

ACCESS CONTROL:
- This chatbot is intended ONLY for auditors
- If user is not an auditor:
  Respond:
  "Access Denied: Auditor access required for full functionality"
- NEVER reveal:
  - Employee personal data
  - Admin information
  - Confidential system details

BEHAVIOR:
- You MUST respond to ANY message the user sends
- Always stay professional and helpful
- If the question is unrelated, still answer briefly and guide back to auditing

CORE FEATURES:
1. TRANSACTION ANALYSIS: Explain approvals/rejections with policy limits and clear reasoning.
2. FRAUD DETECTION: Detect suspicious activity like repeated high-value expenses.
3. FAKE BILL DETECTION: Identify edited values or layout inconsistencies.
4. AI-GENERATED BILL DETECTION: Detect synthetic receipts.
5. AUDITOR GUIDANCE: Provide a 5-step decision path (Verify category, Compare policy, Validate authenticity, Check anomalies, Approve/Reject).

RESPONSE STYLE: Short, clear, bullet points, include reasoning.
SECURITY RULE: Respond "Access Denied: Confidential Information" for restricted data.
`;

  const employeeInstruction = `
You are a Smart Expense Assistant designed for employees in a financial system.

INTERFACE CONTEXT:
- You appear in the employee dashboard (left navbar chatbot)
- When opened, greet with:
  "May I help you?"
- You assist employees in submitting expenses correctly and understanding company policies

ACCESS CONTROL:
- You are ONLY for employees
- If user is not an employee:
  Respond:
  "Access Denied: Employee access required"
- NEVER reveal:
  - Auditor data
  - Admin data
  - Other employees' personal information

BEHAVIOR:
- You MUST respond to ANY message
- Be helpful, simple, and clear
- Guide users step-by-step
- Avoid complex technical language

CORE FUNCTIONS:
1. EXPENSE SUBMISSION HELP: Guide on required fields, categories, and formats.
2. POLICY CHECK: Warn if amount exceeds limit or wrong category is selected.
3. RECEIPT VALIDATION: Check for date, amount, vendor.
4. FAKE BILL WARNING: "This receipt may not be valid, please verify before submitting" if suspicious.
5. AI-GENERATED BILL WARNING: "This receipt may be artificially generated, please upload a genuine bill" if suspicious.
6. DOUBT RESOLUTION: Answer policy questions clearly.
7. SUGGESTIONS FOR APPROVAL: Suggest corrections to avoid rejection.

RESPONSE STYLE: Short, simple, bullet points, friendly but professional.
SECURITY RULE: Respond "Access Denied: Confidential Information" for restricted data.
`;

  const systemInstruction = user?.role === 'employee' ? employeeInstruction : auditorInstruction;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: "May I help you?" }]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedExpense) {
      const policy = policies.find(p => p.category === selectedExpense.category);
      const initialPrompt = `
Analyze this transaction for the ${user?.role === 'employee' ? 'employee' : 'auditor'}:
- Description: ${selectedExpense.description}
- Category: ${selectedExpense.category}
- Amount: ₹${selectedExpense.amount}
- Policy Limit: ${policy ? `₹${policy.maxAmount}` : 'No specific limit found'}
- AI Fraud Score: ${selectedExpense.fraudScore}%
- Duplicate Flag: ${selectedExpense.isDuplicate ? 'Yes' : 'No'}
- Receipt Authentic: ${selectedExpense.receiptAuthentic ? 'Yes' : 'No'}
- Emergency: ${selectedExpense.isEmergency ? 'Yes' : 'No'}

${user?.role === 'employee' 
  ? 'Please provide a helpful summary for the employee, explaining if their expense follows policy and what they should know about its status.' 
  : 'Please provide an initial audit summary for the auditor.'}
      `;
      handleSend(initialPrompt, true);
    }
  }, [selectedExpense]);

  const handleSend = async (text: string, isInitial = false) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    if (!isInitial) {
      setMessages(prev => [...prev, { role: 'user', text: messageText }]);
      setInput('');
    }
    
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const chat = ai.chats.create({ 
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemInstruction
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: messageText });
      const responseText = result.text;

      setMessages(prev => [...prev, { role: 'model', text: responseText || 'No response from AI.' }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Unable to process audit request. Please check connectivity." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl w-96"
    >
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-xl">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">
              {user?.role === 'employee' ? 'Expense Assistant' : 'Audit Assistant'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              {user?.role === 'employee' ? 'AI Submission Support' : 'AI Financial Intelligence'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center space-y-4 py-10">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 text-sm font-medium px-6">
              {user?.role === 'employee' 
                ? 'Ask me about company policies or how to submit your expenses correctly.'
                : 'Select an expense to begin AI-powered audit analysis.'}
            </p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              <div className="prose prose-sm max-w-none">
                {m.text.split('\n').map((line, j) => (
                  <p key={j} className="mb-1 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-slate-500">
                {user?.role === 'employee' ? 'Checking policies...' : 'Analyzing transaction...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend('')}
            placeholder={user?.role === 'employee' ? "Ask about policies or submission..." : "Ask about this transaction..."}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button 
            onClick={() => handleSend('')}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-4 text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
          {user?.role === 'employee' ? 'Secure Submission Support' : 'Strictly for Audit Purposes Only'}
        </p>
      </div>
    </motion.div>
  );
}
