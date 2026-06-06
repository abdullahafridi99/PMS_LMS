import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  Award, 
  Receipt, 
  Megaphone, 
  LogOut, 
  Sparkles, 
  Clock, 
  FileText,
  Percent,
  TrendingUp,
  GraduationCap,
  CreditCard,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [studentUser, setStudentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Lists
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    attendancePercentage: 100
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notices, setNotices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Fee payment states
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/29',
    cvc: '***',
    cardName: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('hbl');
  const [mobileNumber, setMobileNumber] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [showChallan, setShowChallan] = useState(false);

  useEffect(() => {
    if (studentUser) {
      setCardForm(prev => ({ ...prev, cardName: studentUser.name }));
    }
  }, [studentUser]);

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPayModal(true);
  };

  const handleProcessPaymentSubmit = async (e) => {
    e.preventDefault();
    setPayLoading(true);

    try {
      const invoiceId = selectedInvoice._id || selectedInvoice.id;
      await api.fees.pay(invoiceId, paymentMethod);

      setTimeout(() => {
        setPayLoading(false);
        setShowPayModal(false);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        alert('Transaction successful! Fee invoice has been marked as Paid.');
        
        if (studentUser) {
          loadStudentData(studentUser.id || studentUser._id);
        }
      }, 1500);

    } catch (err) {
      alert(err.message || 'Payment simulation failed');
      setPayLoading(false);
    }
  };

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    setStudentUser(user);
    loadStudentData(user.id || user._id);
  }, []);

  const loadStudentData = async (studentId) => {
    setLoading(true);
    try {
      // 1. Fetch Attendance Logs
      const att = await api.attendance.getStudentStats(studentId);
      setAttendanceStats(att.summary);
      setAttendanceRecords(att.records);

      // 2. Fetch School Announcements
      const fetchedNotices = await api.notices.list();
      setNotices(fetchedNotices);

      // 3. Fetch Student Invoices
      const fetchedInvoices = await api.fees.list(studentId);
      setInvoices(fetchedInvoices);

    } catch (err) {
      console.error('Failed to load student dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  // Mock Timetable Data for Pakhtunkhwa School
  const timetable = [
    { period: '1st Period', time: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacher: 'Sir Niamat Ullah' },
    { period: '2nd Period', time: '08:45 AM - 09:30 AM', subject: 'English Grammar', teacher: 'Miss Palwasha' },
    { period: '3rd Period', time: '09:30 AM - 10:15 AM', subject: 'Physics', teacher: 'Dr. Tariq Zaman' },
    { period: 'Break Time', time: '10:15 AM - 10:45 AM', subject: 'Tiffin Break & Assembly', teacher: 'School Staff' },
    { period: '4th Period', time: '10:45 AM - 11:30 AM', subject: 'Chemistry', teacher: 'Sir Kamran Shah' },
    { period: '5th Period', time: '11:30 AM - 12:15 PM', subject: 'Computer Science', teacher: 'Miss Spozhmai' },
    { period: '6th Period', time: '12:15 PM - 01:00 PM', subject: 'Pashto Literature', teacher: 'Sir Khan Zada' },
  ];

  // Subject Grades Report Card Mock Data
  const reportCard = [
    { subject: 'Mathematics', classTest: 23, midTerm: 42, finalExam: 88, total: 88, grade: 'A', remarks: 'Excellent logical skills' },
    { subject: 'English Literature', classTest: 21, midTerm: 44, finalExam: 92, total: 92, grade: 'A+', remarks: 'Outstanding vocabulary' },
    { subject: 'Physics (Theory & Lab)', classTest: 24, midTerm: 39, finalExam: 85, total: 85, grade: 'A', remarks: 'Strong conceptual clarity' },
    { subject: 'Chemistry', classTest: 19, midTerm: 37, finalExam: 78, total: 78, grade: 'B', remarks: 'Good, work on equations' },
    { subject: 'Computer Programming', classTest: 25, midTerm: 45, finalExam: 96, total: 96, grade: 'A+', remarks: 'Exceptionally brilliant' },
    { subject: 'Islamic Studies', classTest: 24, midTerm: 43, finalExam: 90, total: 90, grade: 'A+', remarks: 'Excellent moral understanding' },
    { subject: 'Pakistan Studies', classTest: 22, midTerm: 41, finalExam: 83, total: 83, grade: 'A', remarks: 'Good historical knowledge' },
  ];

  const overallAverage = Math.round(reportCard.reduce((sum, item) => sum + item.total, 0) / reportCard.length);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 font-sans flex transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-8 text-left">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center p-2 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-[2.5]" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-outfit font-black text-lg tracking-tight text-white block">PMS Portal</span>
              <span className="text-[9px] font-bold text-cyan-400 block tracking-widest uppercase">Student Panel</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">My Dashboard</h4>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'overview' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              My Overview
            </button>

            <button 
              onClick={() => setActiveTab('attendance')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'attendance' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4.5 h-4.5" />
              Attendance logs
            </button>

            <button 
              onClick={() => setActiveTab('grades')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'grades' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
              Report Card
            </button>

            <button 
              onClick={() => setActiveTab('fees')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'fees' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4.5 h-4.5" />
              Fees & Payments
            </button>

            <button 
              onClick={() => setActiveTab('notices')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'notices' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Megaphone className="w-4.5 h-4.5" />
              Notice Feed
            </button>
          </div>
        </div>

        {/* LOGOUT / STUDENT PROFILE INFO */}
        <div className="space-y-4 text-left">
          {studentUser && (
            <div className="px-3">
              <span className="text-xs font-bold text-white block truncate">{studentUser.name}</span>
              <span className="text-[10px] text-cyan-400 block font-semibold">{studentUser.rollNumber}</span>
              <span className="text-[9px] text-slate-500 block truncate">{studentUser.class} - {studentUser.section}</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 hover:bg-rose-950/30 hover:text-rose-400 text-slate-500 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout Portal
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 text-left">
          <div>
            <h1 className="font-outfit font-black text-3xl tracking-tight text-slate-900 dark:text-white uppercase">
              {activeTab === 'overview' && 'My Academic Hub'}
              {activeTab === 'attendance' && 'Daily Attendance Summary'}
              {activeTab === 'grades' && 'Subject Report Card'}
              {activeTab === 'notices' && 'Official Notice Board'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, {studentUser ? studentUser.name.split(' ')[0] : 'Student'}!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold bg-cyan-100 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 px-3.5 py-1.5 rounded-full text-cyan-700 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Student Profile Active
            </span>
          </div>
        </header>

        {loading ? (
          <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-10 w-10 text-cyan-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-semibold text-slate-400">Loading student profiles...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* STATS ROW */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center shrink-0">
                  <Percent className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Attendance %</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{attendanceStats.attendancePercentage}%</span>
                </div>
              </div>
              
              {/* Stat 2 */}
              <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Academic Grade</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{overallAverage}% (A+)</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Pending Bills</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">
                    {invoices.filter(i => i.status === 'unpaid').length} Invoices
                  </span>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Notices Posted</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{notices.length} Alerts</span>
                </div>
              </div>
            </div>

            {/* TAB OVERVIEW CONTENT */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-12 gap-8 text-left">
                {/* Weekly Timetable */}
                <div className="lg:col-span-8 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-5.5 h-5.5 text-cyan-500" />
                    <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Daily Subjects Timetable</h3>
                  </div>

                  <div className="space-y-3">
                    {timetable.map((t, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                          t.subject === 'Break Time' 
                            ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40 text-amber-800 dark:text-amber-400' 
                            : 'bg-slate-50 border-slate-100 dark:bg-slateCustom-950/40 dark:border-slateCustom-850 text-slate-800 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 ${
                            t.subject === 'Break Time' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400' : 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400'
                          }`}>
                            {t.period.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">{t.subject}</span>
                            <span className="text-xs text-slate-400 font-medium">{t.teacher}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-white dark:bg-slateCustom-900 px-3 py-1.5 rounded-full border border-slate-200/40 w-fit">
                          <Clock className="w-3.5 h-3.5" />
                          {t.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Notice board widget */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white rounded-3xl p-6 shadow-lg shadow-cyan-500/10 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-cyan-200" />
                      <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Academic Standings</span>
                    </div>

                    <div className="space-y-1 my-6">
                      <h4 className="text-xs text-cyan-100 font-medium">Cumulated Score</h4>
                      <h3 className="font-outfit font-black text-3xl">{overallAverage}% Avg</h3>
                      <p className="text-[11px] text-cyan-100/80">Calculated across 7 standard board-approved subjects.</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-cyan-100 font-semibold pt-2 border-t border-white/25">
                      <Award className="w-4 h-4" /> Position: #2 in Zangali Section
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-cyan-500" /> Latest Announcement
                    </h4>
                    
                    {notices.length > 0 ? (
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold bg-cyan-100 text-cyan-600 dark:bg-cyan-950 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                          {notices[0].targetAudience}
                        </span>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-white">{notices[0].title}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{notices[0].content}</p>
                        <button onClick={() => setActiveTab('notices')} className="text-xs font-semibold text-cyan-500 hover:underline">Read notice details</button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">No announcements published.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB ATTENDANCE DETAILS */}
            {activeTab === 'attendance' && (
              <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 text-left shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slateCustom-800 pb-4">
                  <Clock className="w-5.5 h-5.5 text-cyan-500" />
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Daily Attendance Sheet History</h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="bg-slate-50 dark:bg-slateCustom-950 p-4 rounded-2xl border border-slate-200/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Days Logged</span>
                    <strong className="text-base text-slate-800 dark:text-white font-outfit">{attendanceStats.totalDays} Days</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slateCustom-950 p-4 rounded-2xl border border-slate-200/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Days Present / Late</span>
                    <strong className="text-base text-emerald-600 dark:text-emerald-400 font-outfit">{attendanceStats.presentDays} / {attendanceStats.lateDays}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slateCustom-950 p-4 rounded-2xl border border-slate-200/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Days Absent</span>
                    <strong className="text-base text-rose-500 font-outfit">{attendanceStats.absentDays}</strong>
                  </div>
                </div>

                <div className="border border-slate-100 dark:border-slateCustom-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 border-b border-slate-100 dark:border-slateCustom-800">
                      <tr>
                        <th className="px-6 py-4">Logged Date</th>
                        <th className="px-6 py-4">Grade & Section</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map(rec => (
                          <tr key={rec._id || rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                            <td className="px-6 py-4 font-bold font-outfit">{rec.date}</td>
                            <td className="px-6 py-4">{rec.class} - {rec.section}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                                  rec.status === 'present' 
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                                    : rec.status === 'late'
                                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                                      : 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    rec.status === 'present' ? 'bg-emerald-500' :
                                    rec.status === 'late' ? 'bg-amber-500' : 'bg-rose-500'
                                  }`} />
                                  {rec.status}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-12 text-slate-400 font-medium">No recorded daily attendance sheet entries found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB REPORT CARD GRADES */}
            {activeTab === 'grades' && (
              <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 text-left shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slateCustom-800 pb-4">
                  <Award className="w-5.5 h-5.5 text-cyan-500" />
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Annual Report Card sheet</h3>
                </div>

                <div className="border border-slate-100 dark:border-slateCustom-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 border-b border-slate-100 dark:border-slateCustom-800">
                      <tr>
                        <th className="px-6 py-4">Subject Name</th>
                        <th className="px-6 py-4 text-center">Class Tests (25)</th>
                        <th className="px-6 py-4 text-center">Mid Terms (50)</th>
                        <th className="px-6 py-4 text-center">Annual Finals (100)</th>
                        <th className="px-6 py-4 text-center">Total Score (100)</th>
                        <th className="px-6 py-4 text-center">Grade Letter</th>
                        <th className="px-6 py-4">Instructor Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800 text-slate-700 dark:text-slate-300">
                      {reportCard.map((card, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                          <td className="px-6 py-4 font-bold">{card.subject}</td>
                          <td className="px-6 py-4 text-center font-semibold font-outfit">{card.classTest}</td>
                          <td className="px-6 py-4 text-center font-semibold font-outfit">{card.midTerm}</td>
                          <td className="px-6 py-4 text-center font-semibold font-outfit">{card.finalExam}</td>
                          <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white font-outfit">{card.total}%</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-outfit shadow-sm ${
                              card.grade.includes('A') 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                                : 'bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400'
                            }`}>
                              {card.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs italic">{card.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB SCHOOL NOTICES FEED */}
            {activeTab === 'notices' && (
              <div className="space-y-6 text-left max-w-4xl">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-5.5 h-5.5 text-cyan-500" />
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Announcements Board Feed</h3>
                </div>

                {notices.length > 0 ? (
                  notices.map(notice => (
                    <div key={notice._id || notice.id} className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 p-6 rounded-3xl relative shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slateCustom-950 text-slate-500">
                          Audience: {notice.targetAudience}
                        </span>
                        <span className="text-[10px] text-slate-400">{notice.date ? new Date(notice.date).toLocaleDateString() : 'Today'}</span>
                      </div>

                      <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base">{notice.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{notice.content}</p>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slateCustom-800/80">
                        <span>Notice issued by: <strong className="text-slate-600 dark:text-slate-300">{notice.createdBy}</strong></span>
                        <span className="text-emerald-500 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Official PMS Zangali</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-12 text-center text-slate-400 font-medium">No announcements published.</div>
                )}
              </div>
            )}

            {/* TAB FEES & PAYMENTS */}
            {activeTab === 'fees' && (
              <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 text-left shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slateCustom-800 pb-4">
                  <Receipt className="w-5.5 h-5.5 text-cyan-500" />
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Fees Ledger & Invoices</h3>
                </div>

                <div className="border border-slate-100 dark:border-slateCustom-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 border-b border-slate-100 dark:border-slateCustom-800">
                      <tr>
                        <th className="px-6 py-4">Billing Month</th>
                        <th className="px-6 py-4">Fee Category</th>
                        <th className="px-6 py-4">Amount Due (PKR)</th>
                        <th className="px-6 py-4">Invoice Due Date</th>
                        <th className="px-6 py-4">Paid Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Payment Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                      {invoices.length > 0 ? (
                        invoices.map(invoice => (
                          <tr key={invoice._id || invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                            <td className="px-6 py-4 font-semibold">{invoice.month}</td>
                            <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                              <span className={`px-2 py-1 rounded-lg ${
                                invoice.feeType === 'admission' ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' :
                                invoice.feeType === 'fine' ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                                invoice.feeType === 'other' ? 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400' :
                                'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400' // tuition
                              }`}>
                                {invoice.feeType || 'tuition'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit">PKR {invoice.amount}</td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{invoice.dueDate}</td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{invoice.paidDate || '—'}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                                  invoice.status === 'paid' 
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${invoice.status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  {invoice.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {invoice.status === 'unpaid' ? (
                                <button 
                                  onClick={() => handleOpenPayment(invoice)}
                                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 ml-auto pt-2"
                                >
                                  <CreditCard className="w-3.5 h-3.5" /> Pay Now
                                </button>
                              ) : (
                                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 justify-end"><CheckCircle className="w-4 h-4" /> Cleared</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No recorded fee invoices found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- MOCK SECURE CREDIT CARD GATEWAY DIALOG --- */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[480px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[32px] shadow-2xl overflow-hidden relative z-10 text-left"
            >
              <div className="h-16 px-8 bg-slate-50 dark:bg-slateCustom-950 flex items-center justify-between border-b border-slate-100 dark:border-slateCustom-800">
                <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-500" /> PMS Secure Payment Gateway
                </h3>
                <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProcessPaymentSubmit} className="p-8 space-y-6">
                
                {/* Payment Method Selector Grid */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 block mb-2.5 uppercase tracking-wider">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'easypaisa', label: 'EasyPaisa', color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20' },
                      { id: 'jazzcash', label: 'JazzCash', color: 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/20' },
                      { id: 'hbl', label: 'HBL Bank', color: 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20' },
                      { id: 'ubl', label: 'UBL Bank', color: 'border-blue-700 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20' },
                      { id: 'allied', label: 'Allied Bank', color: 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20' },
                      { id: 'cash', label: 'Paper Money', color: 'border-amber-600 text-amber-600 dark:text-amber-450 bg-amber-50/30 dark:bg-amber-950/20' }
                    ].map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`h-9 rounded-xl border text-[9px] font-black uppercase tracking-tight text-center transition-all ${
                          paymentMethod === method.id 
                            ? `${method.color} border-2 scale-[1.03] shadow-sm` 
                            : 'border-slate-200 dark:border-slateCustom-800 hover:bg-slate-50 dark:hover:bg-slateCustom-850 text-slate-500'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Mock Card/Wallet Rendering */}
                <div className="transition-all duration-300">
                  {['easypaisa', 'jazzcash'].includes(paymentMethod) ? (
                    /* Mobile Wallet */
                    <div className={`w-full h-44 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden text-white ${
                      paymentMethod === 'easypaisa' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-yellow-500 via-red-600 to-slate-950'
                    }`}>
                      <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <span className="font-outfit font-black text-lg tracking-wider">
                          {paymentMethod === 'easypaisa' ? 'EASYPAISA WALLET' : 'JAZZCASH WALLET'}
                        </span>
                        <div className="w-10 h-6 bg-white/20 rounded-md shadow-sm flex items-center justify-center text-[8px] font-black uppercase tracking-widest">
                          M-Wallet
                        </div>
                      </div>

                      <div className="font-outfit font-bold text-lg tracking-widest">
                        {mobileNumber ? mobileNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3') : '03XX-XXXXXXX'}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-white/70 block font-medium">Account Owner</span>
                          <strong className="tracking-wide">{studentUser ? studentUser.name : 'Student Profile'}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/70 block font-medium">Platform</span>
                          <strong className="uppercase">{paymentMethod}</strong>
                        </div>
                      </div>
                    </div>
                  ) : paymentMethod === 'cash' ? (
                    /* Paper Money/Challan Banner */
                    <div className="w-full h-44 rounded-3xl p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 text-white flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300">
                      <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <span className="font-outfit font-black text-lg tracking-wider">PAPER MONEY (CASH)</span>
                        <div className="w-12 h-6 bg-white/20 rounded-md shadow-sm flex items-center justify-center text-[8px] font-black uppercase tracking-widest">
                          Challan
                        </div>
                      </div>

                      <div className="font-outfit font-bold text-base leading-snug">
                        Submit Cash via School Challan Form at Counter or Bank
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-amber-100 block font-medium">Fee Category</span>
                          <strong className="uppercase">{selectedInvoice ? selectedInvoice.feeType : 'Tuition'}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-amber-100 block font-medium">Institution Code</span>
                          <strong>PMS-ZANGALI-91</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Bank Debit Card */
                    <div className={`w-full h-44 rounded-3xl text-white p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 ${
                      paymentMethod === 'hbl' 
                        ? 'bg-gradient-to-br from-teal-700 via-teal-600 to-teal-850' 
                        : paymentMethod === 'ubl' 
                          ? 'bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900' 
                          : 'bg-gradient-to-br from-orange-600 via-amber-700 to-blue-800'
                    }`}>
                      <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <span className="font-outfit font-black text-lg tracking-wider">
                          {paymentMethod === 'hbl' ? 'HBL DEBIT CARD' : paymentMethod === 'ubl' ? 'UBL DEBIT CARD' : 'ABL DEBIT CARD'}
                        </span>
                        <div className="w-10 h-6 bg-amber-400/80 rounded-md shadow-sm border border-amber-300" />
                      </div>

                      <div className="font-outfit font-bold text-lg tracking-widest">{cardForm.cardNumber}</div>

                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[10px] text-white/70 block font-medium">Cardholder Name</span>
                          <strong className="tracking-wide">{cardForm.cardName}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-white/70 block font-medium">Expires</span>
                          <strong>{cardForm.expiry}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slateCustom-950 border border-slate-200/50 dark:border-slateCustom-800 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Payment Target Invoice</span>
                    <strong className="text-slate-700 dark:text-slate-300">{selectedInvoice ? `${selectedInvoice.month} ${selectedInvoice.feeType || 'Fees'}` : 'Billing'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block font-medium">Amount Due</span>
                    <strong className="text-cyan-500 font-bold font-outfit text-sm">PKR {selectedInvoice ? selectedInvoice.amount : '0.00'}</strong>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 dark:border-slateCustom-800 pt-4">
                  {paymentMethod === 'cash' ? (
                    <div className="space-y-4 text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        To pay via **Paper Money (Cash)**, you must generate the three-part bank challan form, print it, and submit it at the school billing desk or the local HBL branch.
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => setShowChallan(true)}
                        className="w-full h-11 border border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors pt-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        Generate & Print Challan Slip
                      </button>
                    </div>
                  ) : ['easypaisa', 'jazzcash'].includes(paymentMethod) ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mobile Wallet Number (11 Digits)</label>
                        <input 
                          type="tel"
                          required
                          pattern="03[0-9]{9}"
                          maxLength="11"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 03001234567"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">5-Digit Wallet Secure PIN / OTP</label>
                        <input 
                          type="password"
                          required
                          maxLength="5"
                          value={walletPin}
                          onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••••"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-2 col-span-2">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cardholder Full Name</label>
                          <input 
                            type="text"
                            required
                            value={cardForm.cardName}
                            onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                            placeholder="e.g. Farhan Jamil Khan"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Debit Card Number (16 Digits)</label>
                          <input 
                            type="text"
                            required
                            maxLength="19"
                            placeholder="4242 4242 4242 4242"
                            value={cardForm.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()}
                            onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Expiry Date</label>
                          <input 
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength="5"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">CVC Code / CVV</label>
                          <input 
                            type="password"
                            required
                            placeholder="•••"
                            maxLength="3"
                            value={cardForm.cvc}
                            onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value.replace(/\D/g, '') })}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 h-12 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 text-slate-600 dark:border-slateCustom-800 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={payLoading}
                    className="flex-grow h-12 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 pt-1"
                  >
                    {payLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Authorizing Secure Vault...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'cash' ? 'Confirm Counter Cash Deposit' : 'Confirm Simulated Payment'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PRINTABLE CHALLAN SLIP OVERLAY --- */}
      <AnimatePresence>
        {showChallan && selectedInvoice && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slateCustom-950 overflow-y-auto p-8 flex flex-col items-center">
            
            {/* Header control bar (not visible when printing) */}
            <div className="max-w-[1100px] w-full flex justify-between items-center mb-6 pb-4 border-b dark:border-slateCustom-800 print:hidden">
              <h3 className="font-outfit font-black text-xl text-slate-850 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-500" /> Printable Bank Challan Slip
              </h3>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-md transition-all pt-1"
                >
                  Print Challan Form
                </button>
                <button
                  onClick={() => setShowChallan(false)}
                  className="px-5 h-11 border border-slate-200 dark:border-slateCustom-800 hover:bg-slate-50 dark:hover:bg-slateCustom-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-all"
                >
                  Close Challan
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div id="challan-print-area" className="max-w-[1150px] w-full bg-white text-black p-6 border border-slate-350 rounded-[24px] print:border-none print:shadow-none print:p-0 flex flex-row divide-x-2 divide-dashed divide-slate-400">
              
              {/* Challan Copy Part Helper function */}
              {[
                { title: 'BANK COPY', note: 'Deposit in HBL A/C # 1209-3489012-307' },
                { title: 'SCHOOL COPY', note: 'Submit at counter' },
                { title: 'STUDENT COPY', note: 'Keep for your record' }
              ].map((copy, copyIdx) => (
                <div key={copyIdx} className="flex-1 px-5 space-y-4 text-xs font-sans text-left">
                  
                  {/* Copy Header */}
                  <div className="text-center border-b pb-2">
                    <h4 className="font-black text-sm tracking-tight text-slate-900">PAKHTUNKHWA MODEL SCHOOL</h4>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Zangali Branch, Kohat Road Peshawar</p>
                    <span className="text-[10px] font-black text-amber-700 block mt-2.5 uppercase border border-amber-400 bg-amber-50 px-2 py-0.5 rounded-md w-fit mx-auto">{copy.title}</span>
                  </div>

                  {/* Bank info */}
                  <div className="text-[9px] bg-slate-50 p-2 rounded-lg border">
                    <span className="font-bold block text-slate-800">HABIB BANK LIMITED</span>
                    <span className="block text-slate-500">Branch Code: 0091 • Kohat Road Branch</span>
                    <strong className="block text-slate-700 font-black mt-0.5">Account # 1209-3489012-307</strong>
                  </div>

                  {/* Challan Info */}
                  <div className="grid grid-cols-2 gap-y-1.5 text-[10px] border-b pb-3">
                    <div>
                      <span className="text-slate-500 block">Challan Slip No:</span>
                      <strong className="text-slate-850 font-black">PMS-CH-{(selectedInvoice._id || selectedInvoice.id || '00000').slice(-6).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Due Date:</span>
                      <strong className="text-slate-850 font-black">{selectedInvoice.dueDate}</strong>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-slate-500 block">Student ID / Roll No:</span>
                      <strong className="text-slate-855 font-black">{studentUser?.studentId} / {studentUser?.rollNumber}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Student Full Name:</span>
                      <strong className="text-slate-855 font-black uppercase">{studentUser?.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Class - Section:</span>
                      <strong className="text-slate-855 font-black">{studentUser?.class} - {studentUser?.section}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Issue Date:</span>
                      <strong className="text-slate-855 font-black">{new Date().toISOString().split('T')[0]}</strong>
                    </div>
                  </div>

                  {/* Charges table */}
                  <div className="space-y-1.5 text-[10px]">
                    <span className="font-bold text-slate-700 block uppercase">Particulars of Fees:</span>
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-50 border-b font-bold text-[9px] p-1.5 text-slate-600">
                        <div className="col-span-2">Description</div>
                        <div className="text-right">Amount (PKR)</div>
                      </div>
                      
                      <div className="grid grid-cols-3 p-1.5 text-[9px]">
                        <div className="col-span-2 capitalize font-semibold">{selectedInvoice.feeType || 'tuition'} Fee ({selectedInvoice.month})</div>
                        <div className="text-right font-bold">{selectedInvoice.amount}.00</div>
                      </div>

                      <div className="grid grid-cols-3 bg-slate-50 font-bold p-1.5 text-[9px] border-t">
                        <div className="col-span-2">Total Amount Due:</div>
                        <div className="text-right text-slate-900 font-black">PKR {selectedInvoice.amount}.00</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[8px] text-slate-400 leading-normal italic pt-2">
                    Note: {copy.note}. Verification signature is mandatory upon cash deposit.
                  </p>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-4 pt-8 text-[8px]">
                    <div className="border-t border-slate-300 text-center pt-1 text-slate-500">
                      Depositor Signature
                    </div>
                    <div className="border-t border-slate-300 text-center pt-1 text-slate-500">
                      Officer / Cashier Sign
                    </div>
                  </div>

                </div>
              ))}

            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #challan-print-area, #challan-print-area * {
                  visibility: visible !important;
                }
                #challan-print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  border: none !important;
                }
              }
            `}} />

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
