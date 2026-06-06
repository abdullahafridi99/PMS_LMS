import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff, User, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

export default function AdminSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.auth.signupAdmin({ name, email, password, adminKey });
      setSuccessMessage('Administrator registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Registration failed. Verify your Authorization Key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 flex flex-col justify-between relative font-sans overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[50%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/admin-login')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Login
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[36px] shadow-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 to-brand-600" />

          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="font-outfit font-black text-2xl tracking-tight text-slate-900 dark:text-white block">Admin Signup</h1>
            <p className="text-slate-400 text-xs font-semibold">Register New Institution Administrator</p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Zaman"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin2@pms.edu"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-11 pr-12 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Authorization Key *</label>
                <span className="text-[10px] text-amber-500 font-semibold font-outfit uppercase">Demo Key: PMS-ZANGALI-ADMIN-KEY</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  required
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter system key"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold text-left"
                >
                  {errorMessage}
                </motion.div>
              )}
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-left"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-brand shadow-brand-500/20 hover:shadow-brand-500/30 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all pt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Admin File...
                </>
              ) : (
                'Submit Registration'
              )}
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="h-16 flex items-center justify-center text-xs text-slate-400 z-10 px-6 text-center">
        <span>© {new Date().getFullYear()} Pakhtunkhwa Model School. Secure Admin Signup.</span>
      </footer>
    </div>
  );
}
