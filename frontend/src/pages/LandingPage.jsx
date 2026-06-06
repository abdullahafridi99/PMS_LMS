import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Award, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  FileSpreadsheet, 
  CreditCard, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const [admissionForm, setAdmissionForm] = useState({
    studentName: '',
    grade: 'Grade 9',
    parentName: '',
    phone: '',
    email: '',
    address: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    setAdmissionForm({
      ...admissionForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAdmissionSubmit = (e) => {
    e.preventDefault();
    // Simulate admission inquiry request
    setShowSuccessModal(true);
    setAdmissionForm({
      studentName: '',
      grade: 'Grade 9',
      parentName: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-between p-2 shadow-md shadow-brand-500/20">
              {/* PMS Crest Icon */}
              <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-[2.5]" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-outfit font-black text-xl tracking-tight text-slate-800 dark:text-white block leading-none">PMS</span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 block tracking-widest mt-0.5 uppercase">Zangali Branch</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Features</a>
            <a href="#admissions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Admissions</a>
            <a href="#contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contact</a>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="px-6 h-11 bg-gradient-brand text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center gap-2"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-brand-50/50 via-slate-50 to-slate-50 dark:from-brand-950/20 dark:via-slateCustom-950 dark:to-slateCustom-950">
        {/* Ambient Blurred Backgrounds */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 rounded-full text-brand-700 dark:text-brand-400 font-semibold text-xs uppercase tracking-widest"
            >
              <Award className="w-4 h-4" />
              Empowering Tomorrow's Leaders Today
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-outfit font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Pakhtunkhwa <br/>
              <span className="text-gradient-brand">Model School</span> <br/>
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-sans text-slate-600 dark:text-slate-400">Zangali Branch, Peshawar</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl font-normal leading-relaxed"
            >
              A premium institute committed to academic excellence, innovative learning, moral training, and professional leadership. Step into our state-of-the-art campus and witness bright futures unfold.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <a 
                href="#admissions"
                className="px-8 h-13 bg-gradient-brand text-white font-semibold rounded-xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Enroll Your Child Now
                <ChevronRight className="w-5 h-5" />
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="px-8 h-13 bg-white dark:bg-slateCustom-900 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 font-semibold rounded-xl shadow-md border border-slate-200 dark:border-slateCustom-800 hover:border-brand-200 dark:hover:border-brand-900 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Access Portal
              </button>
            </motion.div>
          </div>

          {/* Right Side Illustration / Image Grid */}
          <div className="md:col-span-5 relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-[400px] h-[400px] flex items-center justify-center"
            >
              {/* Graphic Design of School badge/shield overlaying beautiful cards */}
              <div className="absolute inset-0 bg-gradient-brand rounded-[40px] opacity-10 blur-xl animate-pulse-slow" />
              
              <div className="absolute top-10 left-4 w-72 h-80 rounded-[32px] bg-gradient-brand shadow-2xl overflow-hidden flex flex-col justify-between p-8 text-white rotate-[-6deg] z-10">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold bg-white/25 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Admissions Active</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-outfit font-black text-2xl leading-tight">Pakhtunkhwa Model School</h3>
                  <p className="text-xs text-brand-100">Quality education that shapes tomorrow.</p>
                </div>
              </div>

              {/* Floating Stat Card */}
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-6 right-0 bg-white dark:bg-slateCustom-900 shadow-2xl border border-slate-100 dark:border-slateCustom-800 rounded-2xl p-5 flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 block">Total Enrolled</h4>
                  <span className="text-xl font-bold text-slate-800 dark:text-white font-outfit">1,250+ Students</span>
                </div>
              </motion.div>

              {/* Floating Stat Card 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-slateCustom-900 shadow-2xl border border-slate-100 dark:border-slateCustom-800 rounded-2xl p-4 flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-400 block">Top Results</h4>
                  <span className="text-sm font-bold text-slate-800 dark:text-white font-outfit">98% A+ Grades</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* PORTALS ACCESS GRID */}
      <section id="features" className="py-20 bg-white dark:bg-slateCustom-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              One Unified Portal. Infinite Potential.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base">
              Pakhtunkhwa Model School offers highly specialized interfaces designed for every member of the school ecosystem to operate seamlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Admin Portal Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-50 dark:bg-slateCustom-950 rounded-3xl p-8 border border-slate-100 dark:border-slateCustom-800/80 shadow-md group transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-7 h-7 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-3">Admin Dashboard</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Complete institutional power. Handle admissions, add/edit/delete student files, record bulk daily attendance sheets, generate monthly bill sheets, and post immediate notifications.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Student CRUD</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Attendance Panel</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Fee Generator</span>
              </div>
              <button 
                onClick={() => navigate('/admin-login')}
                className="text-sm font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
              >
                Access Admin Portal <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Parent Portal Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-50 dark:bg-slateCustom-950 rounded-3xl p-8 border border-slate-100 dark:border-slateCustom-800/80 shadow-md group transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-3">Parent Portal</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Direct eyes on child progress. View live daily attendance calendars, review subject report cards, look at notices, and pay outstanding fee invoices online securely.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Attendance Calendar</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Simulated Payments</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Progress Cards</span>
              </div>
              <button 
                onClick={() => navigate('/parent-login')}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                Access Parent Portal <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Student Portal Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-slate-50 dark:bg-slateCustom-950 rounded-3xl p-8 border border-slate-100 dark:border-slateCustom-800/80 shadow-md group transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-3">Student Dashboard</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Your educational hub. Keep track of your academic attendance percentage, check subjects and grade cards, consult weekly class timetables, and download notices.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Attendance Statistics</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Grade Sheets</span>
                <span className="text-[11px] font-semibold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">Notice Feeds</span>
              </div>
              <button 
                onClick={() => navigate('/student-login')}
                className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
              >
                Access Student Portal <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ADMISSION INQUIRY FORM */}
      <section id="admissions" className="py-20 bg-slate-100 dark:bg-slateCustom-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5 text-left space-y-6">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block">Join the Legacy</span>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
              Admissions Open for <br/>Academic Session 2026-27
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Applying to Pakhtunkhwa Model School is the first step toward unlocking your child's highest future potential. Fill in this quick registration form, and our admissions committee will contact you within 24 business hours to arrange a campus tour and basic entry assessment.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Registered with Board of Intermediate & Secondary Education Peshawar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Highly qualified, experienced, and moral teachers</span>
              </div>
            </div>
          </div>

          {/* Admission Registration Form */}
          <div className="md:col-span-7 bg-white dark:bg-slateCustom-900 rounded-[32px] border border-slate-200 dark:border-slateCustom-800 shadow-xl p-8 sm:p-10 relative">
            <h3 className="font-outfit font-bold text-2xl text-slate-800 dark:text-white mb-6">Admission Inquiry Form</h3>
            
            <form onSubmit={handleAdmissionSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Full Name *</label>
                  <input 
                    type="text" 
                    name="studentName"
                    value={admissionForm.studentName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Farooq Shah"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Desired Grade/Class *</label>
                  <select 
                    name="grade"
                    value={admissionForm.grade}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Father/Guardian Full Name *</label>
                <input 
                  type="text" 
                  name="parentName"
                  value={admissionForm.parentName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Muhammad Shah"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mobile Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={admissionForm.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. +92 333 1234567"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={admissionForm.email}
                    onChange={handleInputChange}
                    placeholder="e.g. info@pms.com"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Residential Address</label>
                <input 
                  type="text" 
                  name="address"
                  value={admissionForm.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Zangali Village, Kohat Road, Peshawar"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-13 bg-gradient-brand text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 pt-1"
              >
                Submit Registration Inquiry
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <section id="contact" className="py-20 bg-slate-900 text-slate-300 relative border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center p-2 shadow-lg">
                <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-[2.5]" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <span className="font-outfit font-black text-xl tracking-tight text-white block">Pakhtunkhwa Model School</span>
                <span className="text-[10px] font-bold text-brand-400 block tracking-widest uppercase">Zangali Branch</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              We stand as a premier educational establishment providing academic opportunities driven by strong moral foundations and cutting-edge resources.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campus Address</h4>
                  <p className="text-sm text-slate-400 mt-1">Zangali Branch, Main Kohat Road near Police Station, Peshawar, Khyber Pakhtunkhwa, Pakistan.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-brand-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Phone Lines</h4>
                  <p className="text-sm text-slate-400 mt-1">+92 333 9123456 / +92 91 5821234</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-brand-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Official Email</h4>
                  <p className="text-sm text-slate-400 mt-1">zangali.branch@pms.edu.pk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7">
            {/* Vector Simulated Google Map in sleek Dark Mode theme */}
            <div className="w-full h-80 rounded-[32px] bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <div className="flex justify-between items-start z-10">
                <span className="text-xs font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">Interactive Locator</span>
                <span className="text-xs font-semibold text-brand-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Peshawar (Zangali), Pakistan</span>
              </div>
              
              {/* Graphic Vector Representation of Map */}
              <div className="w-full flex flex-col items-center justify-center flex-grow py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-500/20 border-2 border-brand-500 animate-bounce flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <MapPin className="w-8 h-8 text-brand-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-outfit font-bold text-white text-base">Zangali Branch Campus Map</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Right next to main Kohat Road highway. Convenient parking and double-secured entrances.</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800 z-10">
                <span>© {new Date().getFullYear()} Pakhtunkhwa Model School. All Rights Reserved.</span>
                <span className="hover:underline cursor-pointer text-brand-400 font-semibold" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to Top</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMISSION SUCCESS DIALOG */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-[450px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-3xl p-8 text-center shadow-2xl relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center mx-auto mb-6 shadow-md border-2 border-brand-500">
                <CheckCircle2 className="w-9 h-9 text-brand-600 dark:text-brand-400" />
              </div>

              <h3 className="font-outfit font-black text-2xl text-slate-900 dark:text-white tracking-tight mb-2">
                Inquiry Submitted!
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Thank you for choosing **Pakhtunkhwa Model School Zangali Branch**. Your admission inquiry has been logged in our administration system. An educational counselor will call you shortly to schedules interviews.
              </p>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all flex items-center justify-center"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
