import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarCheck, 
  Receipt, 
  Megaphone, 
  LogOut, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);

  // Stats States
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceRate: 85,
    totalFeesCollected: 0,
    activeNoticesCount: 0
  });

  // Data Lists
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Loading & Operations States
  const [globalLoading, setGlobalLoading] = useState(true);
  const [opLoading, setOpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // Null if adding, Student object if editing
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: 'Grade 9',
    section: 'A',
    parentEmail: '',
    phone: '',
    address: ''
  });

  // Fee Generation Modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    month: 'June 2026',
    amount: '3500',
    dueDate: '2026-06-10',
    feeType: 'tuition'
  });

  // Notice Board Form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    targetAudience: 'all'
  });

  // Attendance Sheet States
  const [attClass, setAttClass] = useState('Grade 9');
  const [attSection, setAttSection] = useState('A');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStudents, setAttStudents] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: 'present' | 'absent' | 'late' }
  const [sheetLoaded, setSheetLoaded] = useState(false);

  // Load Initial Session Details
  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    setAdminUser(user);
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    setGlobalLoading(true);
    try {
      // 1. Fetch Students
      const fetchedStudents = await api.students.list();
      setStudents(fetchedStudents);

      // 2. Fetch Notices
      const fetchedNotices = await api.notices.list();
      setNotices(fetchedNotices);

      // 3. Fetch Fee Invoices
      const fetchedInvoices = await api.fees.list();
      setInvoices(fetchedInvoices);

      // 4. Calculate Stats
      const paidInvoices = fetchedInvoices.filter(i => i.status === 'paid');
      const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      
      setStats({
        totalStudents: fetchedStudents.length,
        attendanceRate: 92, // Seed or mock avg
        totalFeesCollected: totalCollected,
        activeNoticesCount: fetchedNotices.length
      });

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard components.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate('/');
  };

  // --- CRUD STUDENT OPERATIONS ---
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({
      name: '',
      email: '',
      rollNumber: `PMS-2026-0${students.length + 101}`,
      class: 'Grade 9',
      section: 'A',
      parentEmail: '',
      phone: '',
      address: ''
    });
    setShowStudentModal(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      parentEmail: student.parentEmail,
      phone: student.phone || '',
      address: student.address || ''
    });
    setShowStudentModal(true);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setErrorMsg('');
    try {
      if (editingStudent) {
        // Edit student
        const id = editingStudent.id || editingStudent._id;
        await api.students.update(id, studentForm);
      } else {
        // Create student
        await api.students.create(studentForm);
      }
      setShowStudentModal(false);
      await loadAllDashboardData();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this student and their associated mappings?')) return;
    try {
      await api.students.delete(id);
      await loadAllDashboardData();
    } catch (err) {
      alert(err.message || 'Delete operation failed');
    }
  };

  // --- ATTENDANCE MANAGEMENT ---
  const handleLoadAttendanceSheet = async () => {
    setSheetLoaded(false);
    setOpLoading(true);
    try {
      // 1. Get all students of this class and section
      const filtered = students.filter(s => s.class === attClass && s.section === attSection);
      setAttStudents(filtered);

      // 2. Fetch already recorded attendance for this class/section/date
      const recorded = await api.attendance.list(attClass, attSection, attDate);
      
      const sheet = {};
      // Preset all to 'present' initially
      filtered.forEach(s => {
        sheet[s.id || s._id] = 'present';
      });

      // Override with recorded statuses if they exist
      recorded.forEach(rec => {
        sheet[rec.studentId] = rec.status;
      });

      setAttendanceSheet(sheet);
      setSheetLoaded(true);
    } catch (err) {
      alert('Failed to load class sheet');
    } finally {
      setOpLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet({
      ...attendanceSheet,
      [studentId]: status
    });
  };

  const handleSaveAttendance = async () => {
    setOpLoading(true);
    try {
      const records = attStudents.map(s => {
        const id = s.id || s._id;
        return {
          studentId: id,
          studentName: s.name,
          rollNumber: s.rollNumber,
          class: attClass,
          section: attSection,
          date: attDate,
          status: attendanceSheet[id]
        };
      });

      await api.attendance.markBulk(records);
      alert('Daily attendance logged successfully!');
      loadAllDashboardData();
    } catch (err) {
      alert('Failed to save attendance logs.');
    } finally {
      setOpLoading(false);
    }
  };

  // --- FEE BILLING OPERATIONS ---
  const handleCreateFeeInvoice = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setErrorMsg('');
    try {
      await api.fees.create(feeForm);
      setShowFeeModal(false);
      await loadAllDashboardData();
      alert('Fee invoice generated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Billing generation failed');
    } finally {
      setOpLoading(false);
    }
  };

  // --- NOTICE ANNOUNCEMENT BOARD ---
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    try {
      await api.notices.create(noticeForm);
      setNoticeForm({ title: '', content: '', targetAudience: 'all' });
      await loadAllDashboardData();
      alert('Announcement posted successfully!');
    } catch (err) {
      alert('Failed to post announcement.');
    } finally {
      setOpLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.notices.delete(id);
      await loadAllDashboardData();
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  // Filter lists based on searches
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredInvoices = invoices.filter(i => 
    i.studentName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.rollNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    i.month.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  // Recharts Mock Datasets
  const chartData = [
    { name: 'May 2026', Paid: 25000, Pending: 8000 },
    { name: 'June 2026', Paid: stats.totalFeesCollected, Pending: invoices.filter(i => i.status === 'unpaid').reduce((s, iv) => s + iv.amount, 0) }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 font-sans flex transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-8 text-left">
          {/* Institution Header Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center p-2 shadow-lg">
              <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-none stroke-[2.5]" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-outfit font-black text-lg tracking-tight text-white block">PMS Portal</span>
              <span className="text-[9px] font-bold text-brand-400 block tracking-widest uppercase">Admin System</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 block">Control Panel</h4>
            
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'overview' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4.5 h-4.5" />
              Dashboard Overview
            </button>

            <button 
              onClick={() => setActiveTab('students')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'students' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Manage Students
            </button>

            <button 
              onClick={() => setActiveTab('attendance')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'attendance' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4.5 h-4.5" />
              Daily Attendance
            </button>

            <button 
              onClick={() => setActiveTab('fees')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'fees' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4.5 h-4.5" />
              Billing & Fees
            </button>

            <button 
              onClick={() => setActiveTab('notices')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'notices' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Megaphone className="w-4.5 h-4.5" />
              Notice Board
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="space-y-4 text-left">
          {adminUser && (
            <div className="px-3">
              <span className="text-xs font-bold text-white block truncate">{adminUser.name}</span>
              <span className="text-[10px] text-slate-500 block truncate">{adminUser.email}</span>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 hover:bg-rose-950/30 hover:text-rose-400 text-slate-500 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout System
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 text-left">
          <div>
            <h1 className="font-outfit font-black text-3xl tracking-tight text-slate-900 dark:text-white uppercase">
              {activeTab === 'overview' && 'System Dashboard'}
              {activeTab === 'students' && 'Students Registry'}
              {activeTab === 'attendance' && 'Daily Attendance Panel'}
              {activeTab === 'fees' && 'Fees Invoice Registry'}
              {activeTab === 'notices' && 'Official Notice Board'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Pakhtunkhwa Model School • Zangali Branch Peshawar</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold bg-brand-100 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900 px-3.5 py-1.5 rounded-full text-brand-700 dark:text-brand-400 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              System Online
            </span>
          </div>
        </header>

        {globalLoading ? (
          <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            <p className="text-sm font-semibold text-slate-400">Loading Dashboard Components...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 text-left">
                {/* Stats Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Students Enrolled</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{stats.totalStudents}</span>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Attendance Rate</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{stats.attendanceRate}%</span>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                      <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Fees Collected</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">PKR {stats.totalFeesCollected}</span>
                    </div>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Announcements</span>
                      <span className="text-2xl font-black text-slate-800 dark:text-white font-outfit">{stats.activeNoticesCount} Notices</span>
                    </div>
                  </div>
                </div>

                {/* Charts Area */}
                <div className="grid lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm">
                    <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-6">Financial Analytics (Monthly Fee collections)</h3>
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                          <Legend />
                          <Bar dataKey="Paid" fill="#0d9488" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Pending" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* System Info & Seed Profiles */}
                  <div className="lg:col-span-4 bg-white dark:bg-slateCustom-900 rounded-3xl p-6 border border-slate-200/50 dark:border-slateCustom-800 shadow-sm space-y-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-3">Database Connection</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        The school management system operates a dual database connection layer. When MongoDB Atlas or Local URI is not detected, it falls back to secure JSON file repository mode safely.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slateCustom-950 p-3 rounded-xl border border-slate-200/30">
                          <span className="text-xs font-semibold text-slate-500">Database Engine</span>
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                            {api.auth.getToken() ? 'Fallback JSON' : 'MongoDB Local'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slateCustom-950 p-3 rounded-xl border border-slate-200/30">
                          <span className="text-xs font-semibold text-slate-500">Seed Status</span>
                          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/60 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-2">School Motto</h4>
                      <p className="text-xs text-brand-900/70 dark:text-brand-300 leading-relaxed font-medium italic">
                        "Nurturing wisdom, cultivating integrity, and preparing outstanding future leaders for KP and Pakistan."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE STUDENTS TAB */}
            {activeTab === 'students' && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                  {/* Search Student */}
                  <div className="relative max-w-sm w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Search className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Search students by name, roll, email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <button 
                    onClick={openAddStudent}
                    className="px-5 h-11 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    Enroll New Student
                  </button>
                </div>

                {/* Students Registry Table */}
                <div className="bg-white dark:bg-slateCustom-900 rounded-3xl border border-slate-200/50 dark:border-slateCustom-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                        <tr>
                          <th className="px-6 py-4">Roll Number</th>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Class & Section</th>
                          <th className="px-6 py-4">Parent Email</th>
                          <th className="px-6 py-4">Contact Phone</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map(student => (
                            <tr key={student.id || student._id} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit">{student.rollNumber}</td>
                              <td className="px-6 py-4 font-semibold">{student.name}</td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slateCustom-950 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                  {student.class} - {student.section}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{student.parentEmail}</td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{student.phone || 'N/A'}</td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <button 
                                  onClick={() => openEditStudent(student)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slateCustom-950 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-950 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteStudent(student.id || student._id)}
                                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slateCustom-950 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No students matched search filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* DAILY ATTENDANCE SHEET */}
            {activeTab === 'attendance' && (
              <div className="space-y-6 text-left">
                {/* Filters Row */}
                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 flex flex-wrap gap-5 items-end shadow-sm">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class/Grade</label>
                    <select 
                      value={attClass}
                      onChange={(e) => { setAttClass(e.target.value); setSheetLoaded(false); }}
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Section</label>
                    <select 
                      value={attSection}
                      onChange={(e) => { setAttSection(e.target.value); setSheetLoaded(false); }}
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Date</label>
                    <input 
                      type="date"
                      value={attDate}
                      onChange={(e) => { setAttDate(e.target.value); setSheetLoaded(false); }}
                      className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <button 
                    onClick={handleLoadAttendanceSheet}
                    className="px-6 h-11 bg-slate-900 dark:bg-slateCustom-800 hover:bg-slate-800 dark:hover:bg-slateCustom-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    Load Class Roll Sheet
                  </button>
                </div>

                {/* Class Attendance Roll */}
                {sheetLoaded ? (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-slateCustom-900 rounded-3xl border border-slate-200/50 dark:border-slateCustom-800 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                            <tr>
                              <th className="px-6 py-4">Roll Number</th>
                              <th className="px-6 py-4">Student Name</th>
                              <th className="px-6 py-4">Class</th>
                              <th className="px-6 py-4 text-center">Mark Attendance Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                            {attStudents.length > 0 ? (
                              attStudents.map(student => {
                                const id = student.id || student._id;
                                const status = attendanceSheet[id] || 'present';
                                return (
                                  <tr key={id} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit">{student.rollNumber}</td>
                                    <td className="px-6 py-4 font-semibold">{student.name}</td>
                                    <td className="px-6 py-4">{student.class} - {student.section}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex justify-center items-center gap-2 max-w-xs mx-auto bg-slate-100 dark:bg-slateCustom-950 p-1 rounded-xl border border-slate-200/50">
                                        <button 
                                          onClick={() => handleStatusChange(id, 'present')}
                                          className={`flex-1 h-8 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${
                                            status === 'present' 
                                              ? 'bg-emerald-500 text-white shadow-sm' 
                                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                                          }`}
                                        >
                                          Present
                                        </button>
                                        <button 
                                          onClick={() => handleStatusChange(id, 'late')}
                                          className={`flex-1 h-8 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${
                                            status === 'late' 
                                              ? 'bg-amber-500 text-white shadow-sm' 
                                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                                          }`}
                                        >
                                          Late
                                        </button>
                                        <button 
                                          onClick={() => handleStatusChange(id, 'absent')}
                                          className={`flex-1 h-8 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${
                                            status === 'absent' 
                                              ? 'bg-rose-500 text-white shadow-sm' 
                                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'
                                          }`}
                                        >
                                          Absent
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="4" className="text-center py-12 text-slate-400 font-medium">No students enrolled in {attClass} - {attSection}.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {attStudents.length > 0 && (
                      <div className="flex justify-end">
                        <button 
                          onClick={handleSaveAttendance}
                          disabled={opLoading}
                          className="px-8 h-12 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg shadow-brand-500/20"
                        >
                          {opLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                          Confirm & Log Daily Attendance
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-80 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Calendar className="w-12 h-12 text-slate-300" />
                    <h4 className="font-outfit font-bold text-slate-700 dark:text-white text-lg">Class Sheet Not Loaded</h4>
                    <p className="text-xs text-slate-400 max-w-sm">Select a specific grade, section and target date above, then click 'Load Class Roll Sheet' to start marking daily attendance.</p>
                  </div>
                )}
              </div>
            )}

            {/* BILLING & FEES TAB */}
            {activeTab === 'fees' && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
                  {/* Search Invoice */}
                  <div className="relative max-w-sm w-full">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Search className="w-4.5 h-4.5" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Search invoices by student name, roll..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (students.length === 0) {
                        alert('Enroll students first before generating fee bills!');
                        return;
                      }
                      setFeeForm({
                        studentId: students[0].id || students[0]._id,
                        month: 'June 2026',
                        amount: '3500',
                        dueDate: '2026-06-10',
                        feeType: 'tuition'
                      });
                      setShowFeeModal(true);
                    }}
                    className="px-5 h-11 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-500/10"
                  >
                    <Plus className="w-5 h-5" />
                    Generate Fee Invoice
                  </button>
                </div>

                {/* Invoices List */}
                <div className="bg-white dark:bg-slateCustom-900 rounded-3xl border border-slate-200/50 dark:border-slateCustom-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                        <tr>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Roll Number</th>
                          <th className="px-6 py-4">Fee Category</th>
                          <th className="px-6 py-4">Billing Month</th>
                          <th className="px-6 py-4">Amount (PKR)</th>
                          <th className="px-6 py-4">Due Date</th>
                          <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                        {filteredInvoices.length > 0 ? (
                          filteredInvoices.map(invoice => (
                            <tr key={invoice._id || invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors">
                              <td className="px-6 py-4 font-semibold">{invoice.studentName}</td>
                              <td className="px-6 py-4 font-bold font-outfit">{invoice.rollNumber}</td>
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
                              <td className="px-6 py-4 text-slate-500">{invoice.month}</td>
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">PKR {invoice.amount}</td>
                              <td className="px-6 py-4 text-slate-400 text-xs">{invoice.dueDate}</td>
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
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">No invoices created.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* NOTICE BOARD TAB */}
            {activeTab === 'notices' && (
              <div className="grid lg:grid-cols-12 gap-8 text-left">
                {/* Form Col */}
                <div className="lg:col-span-5">
                  <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-6">Create New Announcement</h3>
                    
                    <form onSubmit={handleNoticeSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Notice Title *</label>
                        <input 
                          type="text"
                          required
                          value={noticeForm.title}
                          onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                          placeholder="e.g. Parents-Teacher Meeting"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Audience</label>
                        <select 
                          value={noticeForm.targetAudience}
                          onChange={(e) => setNoticeForm({ ...noticeForm, targetAudience: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        >
                          <option value="all">Everyone (All)</option>
                          <option value="students">Students Only</option>
                          <option value="parents">Parents Only</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Announcement details *</label>
                        <textarea 
                          required
                          rows="4"
                          value={noticeForm.content}
                          onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                          placeholder="Type notices info..."
                          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 resize-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={opLoading}
                        className="w-full h-12 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-500/20"
                      >
                        {opLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Megaphone className="w-5 h-5" />}
                        Broadcast Notice Announcement
                      </button>
                    </form>
                  </div>
                </div>

                {/* Notices List Col */}
                <div className="lg:col-span-7 space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                  <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-2">Live Board History</h3>
                  
                  {notices.length > 0 ? (
                    notices.map(notice => (
                      <div key={notice._id || notice.id} className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 p-6 rounded-3xl relative shadow-sm text-left space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              notice.targetAudience === 'all' ? 'bg-slate-100 text-slate-500' :
                              notice.targetAudience === 'students' ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400' :
                              'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              Audience: {notice.targetAudience}
                            </span>
                            <h4 className="font-outfit font-bold text-slate-800 dark:text-white text-base mt-2">{notice.title}</h4>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteNotice(notice._id || notice.id)}
                            className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slateCustom-950 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{notice.content}</p>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slateCustom-800/80">
                          <span>Posted by: <strong className="text-slate-600 dark:text-slate-300">{notice.createdBy}</strong></span>
                          <span>{notice.date ? new Date(notice.date).toLocaleDateString() : 'Today'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-12 text-center text-slate-400 font-medium">No announcements published.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* --- ADD/EDIT STUDENT REGISTRATION DIALOG --- */}
      <AnimatePresence>
        {showStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStudentModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[650px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[32px] shadow-2xl overflow-hidden relative z-10 text-left"
            >
              <div className="h-16 px-8 bg-slate-50 dark:bg-slateCustom-950 flex items-center justify-between border-b border-slate-100 dark:border-slateCustom-800">
                <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">
                  {editingStudent ? 'Edit Student File' : 'Enroll New Student Profile'}
                </h3>
                <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStudentSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Name *</label>
                    <input 
                      type="text" 
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      placeholder="e.g. Farhan Khan"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Email (System Login) *</label>
                    <input 
                      type="email" 
                      required
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="student@pms.edu"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Roll Number *</label>
                    <input 
                      type="text" 
                      required
                      value={studentForm.rollNumber}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                      placeholder="PMS-2026-091"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grade/Class *</label>
                    <select 
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Section *</label>
                    <select 
                      value={studentForm.section}
                      onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Parent/Guardian Email *</label>
                    <input 
                      type="email" 
                      required
                      value={studentForm.parentEmail}
                      onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                      placeholder="parent@pms.edu"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Contact Telephone Phone</label>
                    <input 
                      type="tel" 
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="+92 333 1234567"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Home Residential Address</label>
                  <input 
                    type="text" 
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                    placeholder="Zangali, Peshawar, KP"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slateCustom-800/80">
                  <button 
                    type="button" 
                    onClick={() => setShowStudentModal(false)}
                    className="px-5 h-11 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 text-slate-600 dark:border-slateCustom-800 dark:text-slate-400 dark:hover:bg-slateCustom-850"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={opLoading}
                    className="px-6 h-11 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md"
                  >
                    {opLoading ? 'Saving changes...' : editingStudent ? 'Update Details' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GENERATE FEE INVOICE DIALOG --- */}
      <AnimatePresence>
        {showFeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeeModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[450px] bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[32px] shadow-2xl overflow-hidden relative z-10 text-left"
            >
              <div className="h-16 px-8 bg-slate-50 dark:bg-slateCustom-950 flex items-center justify-between border-b border-slate-100 dark:border-slateCustom-800">
                <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Generate Fee Invoice</h3>
                <button onClick={() => setShowFeeModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateFeeInvoice} className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Student Profile *</label>
                  <select 
                    value={feeForm.studentId}
                    onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                  >
                    {students.map(s => (
                      <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fee Category / Type *</label>
                  <select 
                    value={feeForm.feeType}
                    onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                  >
                    <option value="tuition">Monthly Tuition Fee</option>
                    <option value="admission">Admission Fee</option>
                    <option value="fine">Fine / Academic Penalty</option>
                    <option value="other">Other Charges</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Billing Month *</label>
                    <select 
                      value={feeForm.month}
                      onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    >
                      <option value="May 2026">May 2026</option>
                      <option value="June 2026">June 2026</option>
                      <option value="July 2026">July 2026</option>
                      <option value="August 2026">August 2026</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Invoice Amount (PKR) *</label>
                    <input 
                      type="number"
                      required
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment Due Date *</label>
                  <input 
                    type="date"
                    required
                    value={feeForm.dueDate}
                    onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slateCustom-800/80">
                  <button 
                    type="button" 
                    onClick={() => setShowFeeModal(false)}
                    className="px-5 h-11 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 text-slate-600 dark:border-slateCustom-800 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={opLoading}
                    className="px-6 h-11 bg-gradient-brand text-white font-semibold rounded-xl text-sm shadow-md"
                  >
                    {opLoading ? 'Creating invoice...' : 'Generate Bill Invoice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
