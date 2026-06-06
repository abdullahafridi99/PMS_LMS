import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff, User, Phone, MapPin, Hash, CheckCircle2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';

export default function StudentSignup() {
  const navigate = useNavigate();
  
  // Form values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [className, setClassName] = useState('Grade 9');
  const [section, setSection] = useState('A');
  const [parentEmail, setParentEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null); // stores the registered student details including studentId

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const studentData = {
        name,
        email,
        password,
        rollNumber,
        class: className,
        section,
        parentEmail,
        phone,
        address
      };
      const response = await api.auth.signupStudent(studentData);
      setCreatedStudent(response);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Registration failed. Try checking your parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 flex flex-col justify-between relative font-sans overflow-hidden transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[50%] h-[60%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/student-login')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Login
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[600px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[36px] shadow-2xl p-8 sm:p-10 relative overflow-hidden text-left"
        >
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 to-blue-600" />

          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center mx-auto mb-3 shadow-md">
              <UserCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h1 className="font-outfit font-black text-2xl tracking-tight text-slate-900 dark:text-white block">Student Signup</h1>
            <p className="text-slate-400 text-xs font-semibold">Self-Register Student Account Profile</p>
          </div>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Farhan Khan"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@pms.edu"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Roll Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="PMS-2026-095"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grade/Class *</label>
                <select 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Section *</label>
                <select 
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Parent/Guardian Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@pms.edu"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 333 1234567"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Home Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Zangali, Peshawar"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Account Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-12 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
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
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-cyan-500/20 hover:shadow-cyan-500/30 rounded-xl font-semibold text-white flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all pt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Student ID...
                </>
              ) : (
                'Register Student Account'
              )}
            </button>
          </form>
        </motion.div>
      </main>

      {/* --- SUCCESS REGISTRATION MODAL --- */}
      <AnimatePresence>
        {createdStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[450px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-3xl p-8 text-center shadow-2xl relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center mx-auto mb-6 shadow-md border-2 border-cyan-500">
                <CheckCircle2 className="w-9 h-9 text-cyan-600 dark:text-cyan-400" />
              </div>

              <h3 className="font-outfit font-black text-2xl text-slate-900 dark:text-white tracking-tight mb-1">
                Signup Successful!
              </h3>
              <p className="text-slate-400 text-xs mb-6">Write down your Login ID immediately:</p>

              <div className="bg-slate-50 dark:bg-slateCustom-950 border border-slate-200/50 dark:border-slateCustom-800 p-5 rounded-2xl mb-6 relative overflow-hidden">
                <Bookmark className="absolute right-4 top-4 w-4 h-4 text-cyan-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Your Unique Student Login ID:</span>
                <span className="font-outfit font-black text-3xl text-cyan-600 dark:text-cyan-400 block tracking-wider mt-1">{createdStudent.studentId}</span>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                You will need this **Unique Student ID** to log in to the student dashboard. Do not share your login credentials with anyone.
              </p>

              <button 
                onClick={() => navigate('/student-login')}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg"
              >
                Proceed to Login Page
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="h-16 flex items-center justify-center text-xs text-slate-400 z-10 px-6 text-center">
        <span>© {new Date().getFullYear()} Pakhtunkhwa Model School. Student Self-Registration.</span>
      </footer>
    </div>
  );
}
