import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const loginFn = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const autofillCredentials = () => {
    setEmail('admin@pms.edu');
    setPassword('admin123');
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (!twoFactorRequired) {
        const res = await loginFn(email, password, 'admin');
        if (res?.twoFactorRequired) {
          setTwoFactorRequired(true);
        } else {
          navigate('/admin');
        }
      } else {
        await loginFn(email, password, 'admin', otp);
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Incorrect credentials or unauthorized access');
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
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[450px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[36px] shadow-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 to-brand-700" />

          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h1 className="font-outfit font-black text-2xl tracking-tight text-slate-900 dark:text-white block">
              {twoFactorRequired ? '2FA Verification' : 'Admin Portal'}
            </h1>
            <p className="text-slate-400 text-xs font-semibold">Pakhtunkhwa Model School Zangali Branch</p>
          </div>

          {!twoFactorRequired && (
            <div className="mb-6 flex justify-center">
              <button 
                type="button"
                onClick={autofillCredentials}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slateCustom-950 dark:hover:bg-slateCustom-800 border border-slate-200 dark:border-slateCustom-800 rounded-2xl flex items-center gap-2 transition-all group"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white">
                  Demo Auto-Fill Credentials
                </span>
              </button>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {!twoFactorRequired ? (
              <>
                <div className="space-y-2 text-left">
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
                      placeholder="admin@pms.edu"
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
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
                      className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
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
              </>
            ) : (
              <div className="space-y-2 text-left">
                <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 rounded-2xl text-teal-700 dark:text-teal-400 text-xs font-semibold mb-4">
                  🔑 A 6-digit verification code has been simulated and sent to the administrator outbox logs. Enter it below to complete sign-in.
                </div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">2FA One-Time Code</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all tracking-[0.25em] font-mono text-center font-bold"
                  />
                </div>
              </div>
            )}

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
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-brand shadow-brand-500/20 hover:shadow-brand-500/30 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all pt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {twoFactorRequired ? 'Confirming Code...' : 'Verifying Admin Credentials...'}
                </>
              ) : (
                twoFactorRequired ? 'Confirm Code & Enter' : 'Enter Admin Dashboard'
              )}
            </button>
          </form>
        </motion.div>
      </main>

      <footer className="h-16 flex items-center justify-center text-xs text-slate-400 z-10 px-6 text-center">
        <span>© {new Date().getFullYear()} Pakhtunkhwa Model School. Secure Admin Authentication.</span>
      </footer>
    </div>
  );
}
