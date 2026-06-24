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
  Sparkles,
  Settings,
  QrCode,
  MessageSquare,
  Send,
  Smartphone,
  Volume2,
  VolumeX,
  Scan,
  GraduationCap,
  HelpCircle,
  Mail,
  BookOpen,
  Award,
  Bus,
  Box,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../utils/api';

import AdminExams from './Admin/Exams';
import AdminLMSManager from './Admin/LMSManager';
import AdminTransport from './Admin/Transport';
import AdminInventory from './Admin/Inventory';
import AdminAuditLogs from './Admin/AuditLogs';

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

  // CMS Settings States
  const [cmsSettings, setCmsSettings] = useState({
    schoolBuildingUrl: '',
    principalMessage: '',
    principalName: 'Principal Tariq Zaman',
    principalUrl: '',
    staffList: []
  });
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    bio: '',
    url: '',
    cnic: ''
  });
  const [cmsSuccess, setCmsSuccess] = useState('');

  // Inquiries and Email Logs
  const [inquiries, setInquiries] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedEmailBody, setSelectedEmailBody] = useState(null);

  // Scanner & SMS Logs States
  const [attendanceSubTab, setAttendanceSubTab] = useState('roll'); // 'roll', 'scanner', 'excel'
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvPreviewLoaded, setCsvPreviewLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scannerRole, setScannerRole] = useState('student'); // 'student' or 'teacher'
  const [scannedUser, setScannedUser] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [staffLogs, setStaffLogs] = useState([]);
  const [showCheckInSimulatorModal, setShowCheckInSimulatorModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

      // 5. Fetch CMS settings
      try {
        const fetchedSettings = await api.settings.get();
        if (fetchedSettings) {
          setCmsSettings(fetchedSettings);
        }
      } catch (cmsErr) {
        console.error('Failed to load CMS settings:', cmsErr);
      }

      // 6. Fetch Parent SMS alert logs
      try {
        const fetchedLogs = await api.smsLogs.list();
        setSmsLogs(fetchedLogs);
      } catch (smsErr) {
        console.error('Failed to load SMS logs:', smsErr);
      }

      // 7. Fetch Staff Attendance logs
      try {
        const fetchedStaffLogs = await api.attendance.listStaff();
        setStaffLogs(fetchedStaffLogs);
      } catch (staffErr) {
        console.error('Failed to load staff attendance logs:', staffErr);
      }

      // 8. Fetch Admission Inquiries
      try {
        const fetchedInquiries = await api.inquiries.list();
        setInquiries(fetchedInquiries);
      } catch (inqErr) {
        console.error('Failed to load admission inquiries:', inqErr);
      }

      // 9. Fetch Email Logs
      try {
        const fetchedEmailLogs = await api.emailLogs.list();
        setEmailLogs(fetchedEmailLogs);
      } catch (mailErr) {
        console.error('Failed to load email logs:', mailErr);
      }

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

  const handleStudentNameChange = (nameVal) => {
    const cleanName = nameVal.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    const suffix = students.length + 101;
    
    setStudentForm(prev => {
      const updates = { name: nameVal };
      
      if (!prev.email || prev.email.endsWith('@pms.edu') || prev.email === '') {
        updates.email = nameVal ? `${cleanName}.${suffix}@pms.edu` : '';
      }
      
      if (!prev.parentEmail || prev.parentEmail.endsWith('@pms.edu') || prev.parentEmail === '') {
        updates.parentEmail = nameVal ? `parent.${cleanName}.${suffix}@pms.edu` : '';
      }
      
      return { ...prev, ...updates };
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setErrorMsg('');

    // Phone validation
    if (studentForm.phone) {
      const cleanPhone = studentForm.phone.trim().replace(/[-\s]/g, '');
      const phoneRegex = /^((\+92)|(0092)|(92))?3\d{9}$|^03\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setErrorMsg('Invalid phone number. Must be a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).');
        setOpLoading(false);
        return;
      }
    }

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

  const handleResolveInquiry = async (id) => {
    if (!window.confirm('Mark this inquiry as resolved and remove it from active records?')) return;
    setOpLoading(true);
    try {
      await api.inquiries.delete(id);
      await loadAllDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to resolve inquiry');
    } finally {
      setOpLoading(false);
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

  // --- EXCEL ATTENDANCE IMPORT ---
  const handleDownloadCsvTemplate = () => {
    // Filter active students for the selected class/section
    const filtered = students.filter(s => s.class === attClass && s.section === attSection);
    
    if (filtered.length === 0) {
      alert(`No students found enrolled in ${attClass} - ${attSection}. Please add students first.`);
      return;
    }

    // CSV structure: Roll Number,Student Name,Class,Section,Status
    const headers = ['Roll Number', 'Student Name', 'Class', 'Section', 'Status'];
    const rows = filtered.map(s => [
      s.rollNumber,
      s.name,
      s.class,
      s.section,
      'present' // Pre-filled default status
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `PMS_Attendance_Template_${attClass.replace(/\s+/g, '_')}_Section_${attSection}_${attDate}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCsvFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.slice(-4).toLowerCase() !== '.csv') {
      alert('Please upload a valid CSV file.');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.name.slice(-4).toLowerCase() !== '.csv') {
      alert('Please upload a valid CSV file.');
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (text) => {
    // Split by newlines, filtering out empty lines
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      alert('CSV file is empty or does not contain header and data rows.');
      return;
    }

    // A helper to split CSV lines, supporting simple double-quoted fields
    const parseCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      // Clean quotes and handle escaped quotes
      return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const headers = parseCsvLine(lines[0]);
    
    // Find column indexes (case-insensitive, checking if columns match)
    const rollIndex = headers.findIndex(h => h.toLowerCase().includes('roll'));
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const classIndex = headers.findIndex(h => h.toLowerCase().includes('class'));
    const sectionIndex = headers.findIndex(h => h.toLowerCase().includes('section'));
    const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'));

    if (rollIndex === -1 || statusIndex === -1) {
      alert('Required columns "Roll Number" and "Status" were not found in the CSV file headers.');
      return;
    }

    const parsedRows = [];
    const errors = [];

    // Filter active students for the selected class/section to do cross-validation
    const filteredClassStudents = students.filter(s => s.class === attClass && s.section === attSection);
    
    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i]);
      if (cells.length < Math.max(rollIndex, statusIndex) + 1) {
        if (cells.join('').trim() === '') continue;
        errors.push(`Row ${i + 1}: Missing values`);
        continue;
      }

      const rollNumberStr = cells[rollIndex]?.trim();
      if (!rollNumberStr) continue;

      let rawStatus = cells[statusIndex]?.trim() || '';
      
      // Standardize status: present/absent/late
      let status = 'present';
      let statusWarning = null;
      const lowerStatus = rawStatus.toLowerCase();
      
      if (lowerStatus.includes('absent') || lowerStatus === 'a' || lowerStatus === 'abs') {
        status = 'absent';
      } else if (lowerStatus.includes('late') || lowerStatus === 'l') {
        status = 'late';
      } else if (lowerStatus.includes('present') || lowerStatus === 'p' || lowerStatus === 'pres') {
        status = 'present';
      } else {
        status = 'present';
        statusWarning = `Unrecognized status "${rawStatus}". Substituted with "present".`;
      }

      // Check if student exists in database under current class & section or globally
      let matchedStudent = filteredClassStudents.find(s => String(s.rollNumber).toLowerCase() === rollNumberStr.toLowerCase());
      let warning = null;
      let isValid = true;

      if (!matchedStudent) {
        // Search globally across all students to see if it is a class mismatch or non-existent
        const globalMatch = students.find(s => String(s.rollNumber).toLowerCase() === rollNumberStr.toLowerCase());
        if (globalMatch) {
          warning = `Student registered in ${globalMatch.class} - ${globalMatch.section}, but uploaded to ${attClass} - ${attSection}`;
          matchedStudent = globalMatch;
        } else {
          isValid = false;
          warning = `Roll number "${rollNumberStr}" not found in database.`;
        }
      }

      parsedRows.push({
        id: matchedStudent ? (matchedStudent.id || matchedStudent._id) : `temp-${i}`,
        rollNumber: rollNumberStr,
        name: matchedStudent ? matchedStudent.name : (cells[nameIndex] || 'Unknown Student'),
        class: matchedStudent ? matchedStudent.class : (cells[classIndex] || attClass),
        section: matchedStudent ? matchedStudent.section : (cells[sectionIndex] || attSection),
        status: status,
        isValid: isValid,
        warning: warning || statusWarning,
        isWarning: !!warning || !!statusWarning,
        originalRowIndex: i + 1
      });
    }

    setCsvData(parsedRows);
    setCsvPreviewLoaded(true);
  };

  const handleSaveCsvAttendance = async () => {
    // Filter out rows that are invalid (e.g. roll number not found in database)
    const validRows = csvData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      alert('No valid student records to save. Please review errors.');
      return;
    }

    setOpLoading(true);
    try {
      const records = validRows.map(row => ({
        studentId: row.id,
        studentName: row.name,
        rollNumber: row.rollNumber,
        class: row.class,
        section: row.section,
        date: attDate,
        status: row.status
      }));

      await api.attendance.markBulk(records);
      alert(`Successfully saved ${records.length} attendance records!`);
      
      resetExcelState();
      loadAllDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save excel attendance.');
    } finally {
      setOpLoading(false);
    }
  };

  const resetExcelState = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvPreviewLoaded(false);
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

  // --- CMS CONFIGURATION HANDLERS ---
  const handleSaveCmsSettings = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setCmsSuccess('');
    try {
      await api.settings.update(cmsSettings);
      setCmsSuccess('School settings updated successfully!');
      setTimeout(() => setCmsSuccess(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setOpLoading(false);
    }
  };

  const handleAddStaffMember = (e) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.title) {
      alert('Please fill staff name and title.');
      return;
    }
    
    // Phone validation
    if (newStaffForm.phone) {
      const cleanPhone = newStaffForm.phone.trim().replace(/[-\s]/g, '');
      const phoneRegex = /^((\+92)|(0092)|(92))?3\d{9}$|^03\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        alert('Invalid phone number. Must be a valid Pakistani mobile number (e.g., 03001234567 or +923001234567).');
        return;
      }
    }

    const updatedStaffList = [...(cmsSettings.staffList || []), newStaffForm];
    setCmsSettings({ ...cmsSettings, staffList: updatedStaffList });
    setNewStaffForm({ name: '', title: '', phone: '', email: '', bio: '', url: '', cnic: '' });
  };

  const handleRemoveStaffMember = (idx) => {
    const updatedStaffList = (cmsSettings.staffList || []).filter((_, i) => i !== idx);
    setCmsSettings({ ...cmsSettings, staffList: updatedStaffList });
  };

  const handleSimulateCheckIn = async (identifier) => {
    setOpLoading(true);
    try {
      const res = await api.attendance.checkIn({
        role: scannerRole,
        identifier,
        status: 'present'
      });

      // Play Beep Sound using Web Audio API
      if (soundEnabled) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          console.warn('Audio feedback failed:', e);
        }
      }

      setScannedUser(res.data);
      setRecentScans(prev => [res.data, ...prev].slice(0, 10)); // keep last 10 scans
      setShowCheckInSimulatorModal(false);
      
      // Reload dashboard logs (staff logs, student logs, etc.)
      await loadAllDashboardData();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setOpLoading(false);
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

            <button 
              onClick={() => setActiveTab('cms')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'cms' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              School Settings (CMS)
            </button>

            <button 
              onClick={() => setActiveTab('inquiries')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'inquiries' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4.5 h-4.5" />
              Admission Inquiries
            </button>

            <button 
              onClick={() => setActiveTab('emailLogs')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'emailLogs' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Mail className="w-4.5 h-4.5" />
              Email Notifications Log
            </button>

            <button 
              onClick={() => setActiveTab('exams')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'exams' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4.5 h-4.5" />
              Exams & Grades
            </button>

            <button 
              onClick={() => setActiveTab('lms')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'lms' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
              LMS Manager
            </button>

            <button 
              onClick={() => setActiveTab('transport')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'transport' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Bus className="w-4.5 h-4.5" />
              Transport Bus Routes
            </button>

            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'inventory' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Box className="w-4.5 h-4.5" />
              Asset Inventory
            </button>

            <button 
              onClick={() => setActiveTab('auditLogs')}
              className={`w-full h-11 px-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-colors ${
                activeTab === 'auditLogs' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              Security Audit Logs
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
              {activeTab === 'cms' && 'School CMS Portal'}
              {activeTab === 'inquiries' && 'Student Admission Inquiries'}
              {activeTab === 'emailLogs' && 'Email Notification Audit Logs'}
              {activeTab === 'exams' && 'Exams Results Portal'}
              {activeTab === 'lms' && 'LMS Curriculum Manager'}
              {activeTab === 'transport' && 'Bus Routes Tracker'}
              {activeTab === 'inventory' && 'Asset Inventory Manager'}
              {activeTab === 'auditLogs' && 'Security Audit Logs'}
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
                {/* Attendance Navigation Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slateCustom-800 pb-px mb-6 gap-6">
                  <button
                    onClick={() => setAttendanceSubTab('roll')}
                    className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 px-1 ${
                      attendanceSubTab === 'roll' 
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Roll Call Register
                  </button>
                  <button
                    onClick={() => setAttendanceSubTab('scanner')}
                    className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 px-1 flex items-center gap-2 ${
                      attendanceSubTab === 'scanner' 
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    QR Scanner Station
                  </button>
                  <button
                    onClick={() => setAttendanceSubTab('excel')}
                    className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 px-1 flex items-center gap-2 ${
                      attendanceSubTab === 'excel' 
                        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Import Excel/CSV
                  </button>
                </div>

                {attendanceSubTab === 'roll' && (
                  <div className="space-y-6">
                    {/* Filters Row */}
                    <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 flex flex-wrap gap-5 items-end shadow-sm">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Class/Grade</label>
                        <select 
                          value={attClass}
                          onChange={(e) => { setAttClass(e.target.value); setSheetLoaded(false); }}
                          className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        >
                          <option value="Grade 1">Grade 1</option>
                          <option value="Grade 2">Grade 2</option>
                          <option value="Grade 3">Grade 3</option>
                          <option value="Grade 4">Grade 4</option>
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8</option>
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

                {attendanceSubTab === 'scanner' && (
                  /* QR Scanner Station View */
                  <div className="grid lg:grid-cols-12 gap-8 text-left">
                    {/* Camera Scanner Viewport Card */}
                    <div className="lg:col-span-5 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slateCustom-800">
                        <div>
                          <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white">QR Scanning Feed</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Peshawar Zangali Campus Entrance Terminal #1</p>
                        </div>
                        {/* Beep sound toggle */}
                        <button
                          type="button"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                            soundEnabled
                              ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800'
                              : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slateCustom-800 dark:border-slateCustom-700'
                          }`}
                        >
                          {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                        </button>
                      </div>

                      {/* Simulator Screen viewport */}
                      <div className="my-6 aspect-video bg-slate-950 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border-4 border-slateCustom-800 shadow-inner group">
                        <style>{`
                          @keyframes scanLaser {
                            0% { top: 10%; }
                            50% { top: 90%; }
                            100% { top: 10%; }
                          }
                          .animate-laser {
                            animation: scanLaser 4s infinite linear;
                          }
                        `}</style>
                        
                        {/* Pulsing Scanning lines */}
                        <div className="absolute left-[15%] right-[15%] top-[10%] bottom-[10%] border-2 border-dashed border-cyan-400/30 rounded-xl flex items-center justify-center pointer-events-none">
                          {/* Corner focus brackets */}
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                        </div>

                        <div className="absolute left-0 w-full h-[2px] bg-cyan-400/80 animate-laser shadow-[0_0_12px_#22d3ee] pointer-events-none" />

                        {/* Camera simulation text */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-600/90 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          Live Feed
                        </div>

                        <div className="absolute bottom-4 right-4 bg-slate-900/85 px-2.5 py-1 rounded-md text-[9px] text-slate-400 font-mono tracking-wider">
                          CAM_01_INPUT
                        </div>

                        {/* Icon or Scanned state overlay */}
                        {scannedUser ? (
                          <div className="text-center space-y-3 z-10 p-4 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/25 max-w-[85%]">
                            <div className="w-14 h-14 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 mx-auto flex items-center justify-center font-black text-xl font-outfit uppercase">
                              {scannedUser.name.slice(0, 2)}
                            </div>
                            <div>
                              <h5 className="font-outfit font-black text-sm text-white tracking-wide">{scannedUser.name}</h5>
                              <p className="text-[10px] text-cyan-400 font-semibold">{scannedUser.rollNumber || scannedUser.title}</p>
                              <p className="text-[9px] text-slate-400 mt-1">{scannedUser.class ? `${scannedUser.class} • ${scannedUser.section}` : 'Staff Directory'}</p>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <CheckCircle className="w-3 h-3" />
                              Checked In at {scannedUser.time}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2 pointer-events-none">
                            <Scan className="w-10 h-10 text-slate-600 animate-pulse mx-auto" />
                            <p className="text-xs text-slate-500 font-medium font-outfit uppercase tracking-widest">Awaiting Scanner Input</p>
                          </div>
                        )}
                      </div>

                      {/* Actions buttons */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setScannerRole('student'); setShowCheckInSimulatorModal(true); }}
                            className={`h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                              scannerRole === 'student'
                                ? 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200 dark:bg-slateCustom-950 dark:border-slateCustom-850'
                            }`}
                          >
                            <QrCode className="w-4 h-4" />
                            Scan Student QR
                          </button>
                          <button
                            type="button"
                            onClick={() => { setScannerRole('teacher'); setShowCheckInSimulatorModal(true); }}
                            className={`h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                              scannerRole === 'teacher'
                                ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 shadow-sm'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200 dark:bg-slateCustom-950 dark:border-slateCustom-850'
                            }`}
                          >
                            <QrCode className="w-4 h-4" />
                            Scan Teacher QR
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setShowCheckInSimulatorModal(true)}
                          className="w-full h-11 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-500/20 text-sm"
                        >
                          <Scan className="w-4.5 h-4.5" />
                          Simulate Scanner Check-in
                        </button>
                      </div>
                    </div>

                    {/* Scan History / Logs table list */}
                    <div className="lg:col-span-7 space-y-6">
                      {/* Student Recent Check-ins */}
                      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm">
                        <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-cyan-500" />
                          Recent Scans History (Today)
                        </h4>
                        
                        {recentScans.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">Name</th>
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">Role</th>
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">ID / Title</th>
                                  <th className="py-2 text-center font-bold uppercase tracking-wider">Time</th>
                                  <th className="py-2 text-right font-bold uppercase tracking-wider">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recentScans.map((scan, idx) => (
                                  <tr key={idx} className="border-b border-slate-50 dark:border-slateCustom-850/50 text-xs">
                                    <td className="py-3 font-bold text-slate-800 dark:text-white">{scan.name}</td>
                                    <td className="py-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        scan.rollNumber ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-600' : 'bg-teal-50 dark:bg-teal-950 text-teal-600'
                                      }`}>
                                        {scan.rollNumber ? 'Student' : 'Teacher'}
                                      </span>
                                    </td>
                                    <td className="py-3 font-medium text-slate-500">{scan.rollNumber || scan.title}</td>
                                    <td className="py-3 text-center text-slate-400 font-semibold">{scan.time}</td>
                                    <td className="py-3 text-right">
                                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                        {scan.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium py-6 text-center">No scans recorded in this session yet.</p>
                        )}
                      </div>

                      {/* Staff Registered Attendance History */}
                      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm">
                        <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-teal-500" />
                          Teacher Check-in Attendance Logs
                        </h4>

                        {staffLogs.length > 0 ? (
                          <div className="overflow-x-auto max-h-[220px] overflow-y-auto pr-2">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">Date</th>
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">Teacher Name</th>
                                  <th className="py-2 text-left font-bold uppercase tracking-wider">Designation</th>
                                  <th className="py-2 text-center font-bold uppercase tracking-wider">Check-in Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {staffLogs.slice(0, 10).map((log, idx) => (
                                  <tr key={log._id || log.id || idx} className="border-b border-slate-50 dark:border-slateCustom-850/50 text-xs">
                                    <td className="py-3 text-slate-400 font-medium">{log.date}</td>
                                    <td className="py-3 font-bold text-slate-800 dark:text-white">{log.name}</td>
                                    <td className="py-3 text-slate-500 font-medium">{log.title}</td>
                                    <td className="py-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">{log.time}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium py-6 text-center">No teacher attendance records saved yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {attendanceSubTab === 'excel' && (
                  /* Excel/CSV Import View */
                  <div className="space-y-6">
                    {/* Filter, Download & Upload Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Card A: Template Generator */}
                      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            1. Download Excel/CSV Template
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Generate and download a pre-filled Excel-compatible spreadsheet template containing the student roster for the selected class and section.
                          </p>
                        </div>

                        {/* Filters in Card A */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slateCustom-950 p-4 rounded-2xl border border-slate-100 dark:border-slateCustom-850">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Grade/Class</label>
                            <select 
                              value={attClass}
                              onChange={(e) => { setAttClass(e.target.value); resetExcelState(); }}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:border-brand-500"
                            >
                              <option value="Grade 1">Grade 1</option>
                              <option value="Grade 2">Grade 2</option>
                              <option value="Grade 3">Grade 3</option>
                              <option value="Grade 4">Grade 4</option>
                              <option value="Grade 5">Grade 5</option>
                              <option value="Grade 6">Grade 6</option>
                              <option value="Grade 7">Grade 7</option>
                              <option value="Grade 8">Grade 8</option>
                              <option value="Grade 9">Grade 9</option>
                              <option value="Grade 10">Grade 10</option>
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Section</label>
                            <select 
                              value={attSection}
                              onChange={(e) => { setAttSection(e.target.value); resetExcelState(); }}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:border-brand-500"
                            >
                              <option value="A">Section A</option>
                              <option value="B">Section B</option>
                            </select>
                          </div>

                          <div className="col-span-2 space-y-1 pt-1 font-outfit">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Attendance Date</label>
                            <input 
                              type="date"
                              value={attDate}
                              onChange={(e) => { setAttDate(e.target.value); resetExcelState(); }}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:border-brand-500 font-medium"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleDownloadCsvTemplate}
                          className="w-full h-11 bg-slate-900 dark:bg-slateCustom-800 hover:bg-slate-800 dark:hover:bg-slateCustom-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm text-xs"
                        >
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Excel Template
                        </button>
                      </div>

                      {/* Card B: Uploader Dropzone */}
                      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            2. Upload Completed Sheet
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Fill out student attendance statuses in Excel, save as CSV, and drag-and-drop the file here to parse and preview.
                          </p>
                        </div>

                        {/* Dropzone Area */}
                        <div 
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`flex-1 min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all relative group cursor-pointer ${
                            isDragging 
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20' 
                              : 'border-slate-200 dark:border-slateCustom-800 hover:border-brand-400 dark:hover:border-slateCustom-700 bg-slate-50/50 dark:bg-slateCustom-950/30'
                          }`}
                        >
                          <input 
                            type="file"
                            accept=".csv"
                            onChange={handleUploadCsvFile}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="text-center space-y-2 pointer-events-none">
                            <svg className="w-10 h-10 text-slate-400 group-hover:text-brand-500 transition-colors mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-white">
                                {csvFile ? csvFile.name : 'Choose or drag Excel/CSV file'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">Supports standard comma-separated text files (.csv)</p>
                            </div>
                          </div>
                        </div>

                        {csvFile && (
                          <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slateCustom-950 px-4 py-2 rounded-xl border border-slate-200/50">
                            <span className="truncate max-w-[70%] font-semibold text-slate-700 dark:text-slate-300 font-mono text-[10px]">{csvFile.name}</span>
                            <button 
                              onClick={resetExcelState}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider"
                            >
                              Clear File
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Preview Table */}
                    {csvPreviewLoaded && csvData.length > 0 && (
                      <div className="space-y-6">
                        {/* Summary Bar */}
                        <div className="bg-slate-50 dark:bg-slateCustom-950 border border-slate-200/50 dark:border-slateCustom-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <div className="flex gap-4">
                            <span>Total Parsed: <strong className="text-slate-800 dark:text-white">{csvData.length}</strong></span>
                            <span>Valid Rows: <strong className="text-emerald-500">{csvData.filter(r => r.isValid).length}</strong></span>
                            <span>Warnings/Errors: <strong className={csvData.some(r => r.warning) ? 'text-amber-500' : 'text-slate-400'}>{csvData.filter(r => r.warning).length}</strong></span>
                          </div>
                          <button 
                            onClick={resetExcelState}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-wider text-[10px] font-bold"
                          >
                            Reset Upload
                          </button>
                        </div>

                        {/* Spreadsheet Grid preview */}
                        <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 font-bold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slateCustom-800 sticky top-0 z-10">
                                <tr>
                                  <th className="px-6 py-4">Row</th>
                                  <th className="px-6 py-4">Roll Number</th>
                                  <th className="px-6 py-4">Student Name</th>
                                  <th className="px-6 py-4">Class/Section</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4">Validation Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-800/60 text-slate-700 dark:text-slate-300">
                                {csvData.map((row, idx) => (
                                  <tr key={idx} className={`hover:bg-slate-50/50 dark:hover:bg-slateCustom-950/20 transition-colors ${!row.isValid ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                                    <td className="px-6 py-4 text-xs font-semibold font-mono text-slate-400">{row.originalRowIndex}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-outfit">{row.rollNumber}</td>
                                    <td className="px-6 py-4 font-semibold">{row.name}</td>
                                    <td className="px-6 py-4 text-xs">{row.class} - {row.section}</td>
                                    <td className="px-6 py-4">
                                      <select
                                        value={row.status}
                                        onChange={(e) => {
                                          const updated = [...csvData];
                                          updated[idx].status = e.target.value;
                                          setCsvData(updated);
                                        }}
                                        className={`h-8 px-2 rounded-lg font-bold text-[11px] uppercase tracking-wide outline-none border transition-all ${
                                          row.status === 'present' 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                                            : row.status === 'late'
                                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                                        }`}
                                      >
                                        <option value="present">Present</option>
                                        <option value="late">Late</option>
                                        <option value="absent">Absent</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4">
                                      {row.isValid ? (
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${row.isWarning ? 'text-amber-500' : 'text-emerald-500'}`}>
                                          {row.isWarning ? (
                                            <>
                                              <svg className="w-3.5 h-3.5 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                              </svg>
                                              <span className="truncate max-w-[180px]" title={row.warning}>{row.warning}</span>
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                              Valid Student
                                            </>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                                          <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                          </svg>
                                          <span className="truncate max-w-[180px]" title={row.warning}>{row.warning}</span>
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Save Excel Button */}
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={resetExcelState}
                            className="px-6 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slateCustom-950 dark:hover:bg-slateCustom-850 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
                          >
                            Cancel & Clear
                          </button>
                          
                          <button 
                            onClick={handleSaveCsvAttendance}
                            disabled={opLoading || csvData.filter(r => r.isValid).length === 0}
                            className="px-8 h-12 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {opLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Save Excel Attendance ({csvData.filter(r => r.isValid).length} Rows)
                          </button>
                        </div>
                      </div>
                    )}
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
              <>
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

              {/* Simulated Parent SMS Alert Logs Outbox */}
              <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm mt-8">
                <div className="border-b border-slate-100 dark:border-slateCustom-800 pb-3 mb-6">
                  <h4 className="font-outfit font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-cyan-500" />
                    Simulated Parent SMS Transmission Logs (Outbox)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    History of automatic notifications dispatched to parents for student absences or official announcements.
                  </p>
                </div>

                {smsLogs.length > 0 ? (
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                          <th className="py-2 text-left font-bold uppercase tracking-wider">Date & Time</th>
                          <th className="py-2 text-left font-bold uppercase tracking-wider">Parent Recipient</th>
                          <th className="py-2 text-left font-bold uppercase tracking-wider">Mobile Number</th>
                          <th className="py-2 text-left font-bold uppercase tracking-wider">SMS Alert Message Body</th>
                          <th className="py-2 text-left font-bold uppercase tracking-wider">Alert Type</th>
                          <th className="py-2 text-right font-bold uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smsLogs.map((log, idx) => (
                          <tr key={log._id || log.id || idx} className="border-b border-slate-50 dark:border-slateCustom-850/50 text-xs">
                            <td className="py-3 text-slate-400 font-medium whitespace-nowrap">
                              {log.date ? new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                            </td>
                            <td className="py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">{log.recipient}</td>
                            <td className="py-3 font-mono font-medium text-slate-500 whitespace-nowrap">{log.phone}</td>
                            <td className="py-3 text-slate-600 dark:text-slate-350 leading-relaxed font-normal">{log.message}</td>
                            <td className="py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                log.type === 'absentee_alert' 
                                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-450' 
                                  : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'
                              }`}>
                                {log.type === 'absentee_alert' ? 'Absent Alert' : 'Notice Broadcast'}
                              </span>
                            </td>
                            <td className="py-3 text-right whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                <Send className="w-2.5 h-2.5" />
                                {log.status || 'sent'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium py-8 text-center">No parent notifications logged yet.</p>
                )}
              </div>
            </>)}

            {/* SCHOOL CMS SETTINGS TAB */}
            {activeTab === 'cms' && (
              <div className="space-y-8 text-left">
                {cmsSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {cmsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveCmsSettings} className="space-y-8">
                  {/* Floating Action Bar */}
                  <div className="flex justify-between items-center bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-400 font-medium">
                      Configure custom campus pictures, staff database, and landing page content dynamically.
                    </p>
                    <button
                      type="submit"
                      disabled={opLoading}
                      className="px-6 h-11 bg-gradient-brand text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-brand-500/20"
                    >
                      {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                      Save School Settings
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* PRINCIPAL DESK SETTINGS */}
                    <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm space-y-5">
                      <div className="border-b border-slate-100 dark:border-slateCustom-800 pb-3">
                        <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Principal's Desk Configuration</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Control the message and picture of the principal shown on the landing page.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Principal Name *</label>
                        <input
                          type="text"
                          required
                          value={cmsSettings.principalName}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, principalName: e.target.value })}
                          placeholder="e.g. Principal Tariq Zaman"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Principal Photo URL</label>
                        <input
                          type="text"
                          value={cmsSettings.principalUrl}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, principalUrl: e.target.value })}
                          placeholder="https://example.com/principal.jpg"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        />
                        {cmsSettings.principalUrl && (
                          <div className="mt-2 w-20 h-20 rounded-full overflow-hidden border border-slate-200 dark:border-slateCustom-800">
                            <img src={cmsSettings.principalUrl} alt="Principal Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Principal Message *</label>
                        <textarea
                          required
                          rows="6"
                          value={cmsSettings.principalMessage}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, principalMessage: e.target.value })}
                          placeholder="Welcome to Pakhtunkhwa Model School. We believe in providing quality education..."
                          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 resize-none font-normal leading-relaxed text-slate-600 dark:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* CAMPUS CONFIGURATION */}
                    <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm space-y-5">
                      <div className="border-b border-slate-100 dark:border-slateCustom-800 pb-3">
                        <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Campus Media Configuration</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Configure image links for the school building display facade.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">School Building Photo URL</label>
                        <input
                          type="text"
                          value={cmsSettings.schoolBuildingUrl}
                          onChange={(e) => setCmsSettings({ ...cmsSettings, schoolBuildingUrl: e.target.value })}
                          placeholder="https://example.com/school-building.jpg"
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                        />
                        {cmsSettings.schoolBuildingUrl && (
                          <div className="mt-2 w-full h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slateCustom-800">
                            <img src={cmsSettings.schoolBuildingUrl} alt="Campus Building Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>

                {/* STAFF REGISTRY CARD */}
                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm mt-8">
                  <div className="border-b border-slate-100 dark:border-slateCustom-800 pb-3 mb-6">
                    <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Faculty & Staff Directory Registry</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Manage directory profiles of the school's teachers and administrative members.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-8">
                    {/* Add Staff form block */}
                    <div className="lg:col-span-5 border-r border-slate-100 dark:border-slateCustom-800/80 pr-0 lg:pr-8">
                      <h4 className="font-outfit font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Add Staff Profile</h4>
                      <form onSubmit={handleAddStaffMember} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={newStaffForm.name}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                            placeholder="e.g. Asma Khattak"
                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Title / Designation *</label>
                          <input
                            type="text"
                            required
                            value={newStaffForm.title}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, title: e.target.value })}
                            placeholder="e.g. Senior Science Teacher"
                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Photo URL</label>
                          <input
                            type="text"
                            value={newStaffForm.url}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, url: e.target.value })}
                            placeholder="https://example.com/staff1.jpg"
                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Email Address</label>
                            <input
                              type="email"
                              value={newStaffForm.email}
                              onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                              placeholder="asma@pms.edu"
                              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Phone Number</label>
                            <input
                              type="text"
                              value={newStaffForm.phone}
                              onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                              placeholder="+92-333-1234567"
                              className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">CNIC Number (For Teacher Signup Verification) *</label>
                          <input
                            type="text"
                            required
                            value={newStaffForm.cnic || ''}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, cnic: e.target.value })}
                            placeholder="e.g. 17301-1234567-1"
                            className="w-full h-10 px-3.5 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Short Bio</label>
                          <textarea
                            rows="2"
                            value={newStaffForm.bio}
                            onChange={(e) => setNewStaffForm({ ...newStaffForm, bio: e.target.value })}
                            placeholder="M.Sc Biology with 8 years teaching experience."
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500 resize-none text-slate-600 dark:text-slate-300"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full h-10 bg-slate-800 dark:bg-slateCustom-950 hover:bg-slate-900 dark:hover:bg-black text-white font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Stage Staff Member
                        </button>
                        <p className="text-[10px] text-slate-400 text-center italic">
                          Note: Adding/removing staff registers locally. You must click "Save School Settings" above to persist updates.
                        </p>
                      </form>
                    </div>

                    {/* Staged / Current staff lists block */}
                    <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      <h4 className="font-outfit font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Registered Faculty ({cmsSettings.staffList?.length || 0})</h4>
                      
                      {cmsSettings.staffList && cmsSettings.staffList.length > 0 ? (
                        <div className="grid gap-3">
                          {cmsSettings.staffList.map((staff, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-slateCustom-950 border border-slate-100 dark:border-slateCustom-850 p-4 rounded-2xl relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slateCustom-850 flex-shrink-0 flex items-center justify-center bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 font-bold text-lg uppercase">
                                {staff.url ? (
                                  <img src={staff.url} alt={staff.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                  staff.name.slice(0, 2)
                                )}
                              </div>
                              <div className="flex-grow space-y-1 text-left">
                                <h5 className="font-outfit font-bold text-sm text-slate-800 dark:text-white leading-tight">{staff.name}</h5>
                                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{staff.title}</p>
                                {staff.bio && <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{staff.bio}</p>}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium items-center">
                                  {staff.email && <span>📧 {staff.email}</span>}
                                  {staff.phone && <span>📞 {staff.phone}</span>}
                                  {staff.cnic && <span className="font-mono bg-slate-100 dark:bg-slateCustom-900 px-1.5 py-0.5 rounded text-[9px] border border-slate-200/40">ID: {staff.cnic}</span>}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveStaffMember(idx)}
                                className="w-8 h-8 rounded-lg bg-white dark:bg-slateCustom-900 text-slate-400 hover:text-rose-500 border border-slate-200/50 dark:border-slateCustom-800 flex items-center justify-center transition-colors absolute right-4 top-4"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slateCustom-950 border border-slate-200/50 dark:border-slateCustom-800 rounded-2xl p-12 text-center text-slate-400 text-sm font-medium">
                          No staff profiles registered yet. Stage profile items on the left and click save.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADMISSION INQUIRIES TAB */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">Active Admission Inquiries</h3>
                    <p className="text-xs text-slate-400 font-medium">Review and resolve inquiries submitted by parents from the public website.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Search inquiries..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[24px] shadow-sm p-6 overflow-hidden">
                  {inquiries.length > 0 ? (
                    (() => {
                      const filteredInquiries = inquiries.filter(inq => {
                        const s = inquirySearch.toLowerCase();
                        return (
                          inq.studentName?.toLowerCase().includes(s) ||
                          inq.parentName?.toLowerCase().includes(s) ||
                          inq.phone?.toLowerCase().includes(s) ||
                          inq.email?.toLowerCase().includes(s) ||
                          inq.address?.toLowerCase().includes(s) ||
                          inq.grade?.toLowerCase().includes(s)
                        );
                      });

                      if (filteredInquiries.length === 0) {
                        return <p className="text-xs text-slate-400 font-medium py-8 text-center">No matching inquiries found.</p>;
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slateCustom-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="pb-3 font-semibold px-4">Student & Grade</th>
                                <th className="pb-3 font-semibold px-4">Father / Guardian</th>
                                <th className="pb-3 font-semibold px-4">Contact Info</th>
                                <th className="pb-3 font-semibold px-4">Address</th>
                                <th className="pb-3 font-semibold px-4">Date Submitted</th>
                                <th className="pb-3 font-semibold text-right px-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredInquiries.map((inq, idx) => (
                                <tr key={idx} className="border-b last:border-b-0 border-slate-100 dark:border-slateCustom-800/40 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slateCustom-800/10 transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                                    {inq.studentName}
                                    <span className="block text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">{inq.grade}</span>
                                  </td>
                                  <td className="py-4 px-4 font-medium">{inq.parentName}</td>
                                  <td className="py-4 px-4">
                                    <span className="block font-mono text-[11px]">{inq.phone}</span>
                                    {inq.email && <span className="block text-[10px] text-slate-400 mt-0.5">{inq.email}</span>}
                                  </td>
                                  <td className="py-4 px-4 max-w-[200px] truncate" title={inq.address}>{inq.address || 'N/A'}</td>
                                  <td className="py-4 px-4 text-slate-400">{new Date(inq.date).toLocaleString()}</td>
                                  <td className="py-4 px-4 text-right">
                                    <button 
                                      onClick={() => handleResolveInquiry(inq.id || inq._id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Resolve
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-slate-400 font-medium py-8 text-center animate-pulse">No student inquiries received yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* EMAIL LOGS TAB */}
            {activeTab === 'emailLogs' && (
              <div className="space-y-6 text-left animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">Email Notification Audit Logs</h3>
                    <p className="text-xs text-slate-400 font-medium">View and audit automated notifications sent to administrative channels.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      placeholder="Search email logs..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[24px] shadow-sm p-6 overflow-hidden">
                  {emailLogs.length > 0 ? (
                    (() => {
                      const filteredEmails = emailLogs.filter(log => {
                        const s = emailSearch.toLowerCase();
                        return (
                          log.recipient?.toLowerCase().includes(s) ||
                          log.subject?.toLowerCase().includes(s) ||
                          log.body?.toLowerCase().includes(s)
                        );
                      });

                      if (filteredEmails.length === 0) {
                        return <p className="text-xs text-slate-400 font-medium py-8 text-center">No matching email notifications found.</p>;
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slateCustom-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="pb-3 font-semibold px-4">Recipient</th>
                                <th className="pb-3 font-semibold px-4">Subject Notification</th>
                                <th className="pb-3 font-semibold px-4">Transmission Date</th>
                                <th className="pb-3 font-semibold px-4">Status</th>
                                <th className="pb-3 font-semibold text-right px-4">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredEmails.map((log, idx) => (
                                <tr key={idx} className="border-b last:border-b-0 border-slate-100 dark:border-slateCustom-800/40 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slateCustom-800/10 transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{log.recipient}</td>
                                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-350">{log.subject}</td>
                                  <td className="py-4 px-4 text-slate-400">{new Date(log.date).toLocaleString()}</td>
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                                      <CheckCircle className="w-2.5 h-2.5" />
                                      {log.status || 'sent'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <button 
                                      onClick={() => setSelectedEmailBody(log.body)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 dark:border-slateCustom-800 hover:bg-slate-50 dark:hover:bg-slateCustom-950 text-slate-750 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                    >
                                      Preview
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-slate-400 font-medium py-8 text-center animate-pulse">No email notification records found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'exams' && <AdminExams />}
            {activeTab === 'lms' && <AdminLMSManager />}
            {activeTab === 'transport' && <AdminTransport />}
            {activeTab === 'inventory' && <AdminInventory />}
            {activeTab === 'auditLogs' && <AdminAuditLogs />}
          </>
        )}

      </main>

      {/* --- ADD/EDIT STUDENT REGISTRATION DIALOG --- */}
      {/* --- EMAIL PREVIEW DIALOG --- */}
      <AnimatePresence>
        {selectedEmailBody && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmailBody(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-[640px] bg-slate-50 dark:bg-slateCustom-950 border border-slate-200 dark:border-slateCustom-800 shadow-2xl rounded-[32px] overflow-hidden z-10 flex flex-col animate-fadeIn"
            >
              <div className="flex justify-between items-center bg-white dark:bg-slateCustom-900 border-b border-slate-200/50 dark:border-slateCustom-800 p-6">
                <h3 className="font-outfit font-black text-xl text-slate-900 dark:text-white">Email Content Preview</h3>
                <button 
                  onClick={() => setSelectedEmailBody(null)}
                  className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slateCustom-950 dark:hover:bg-slateCustom-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] flex justify-center">
                <div 
                  className="bg-white p-6 rounded-2xl shadow-inner border border-slate-350 w-full text-slate-800 text-left" 
                  dangerouslySetInnerHTML={{ __html: selectedEmailBody }} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                {errorMsg && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Name *</label>
                    <input 
                      type="text" 
                      required
                      value={studentForm.name}
                      onChange={(e) => handleStudentNameChange(e.target.value)}
                      placeholder="e.g. Farhan Khan"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Email (System Login) *</label>
                      <span className="text-[10px] text-slate-400 font-semibold font-outfit">(Auto-Generated)</span>
                    </div>
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
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
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
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Parent/Guardian Email *</label>
                      <span className="text-[10px] text-slate-400 font-semibold font-outfit">(Auto-Generated)</span>
                    </div>
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

      {/* --- QR CHECK-IN SIMULATOR MODAL --- */}
      <AnimatePresence>
        {showCheckInSimulatorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckInSimulatorModal(false)}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl z-10 text-left space-y-5"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-outfit font-black text-lg text-slate-800 dark:text-white uppercase tracking-wide">
                  Simulate QR Scanner
                </h3>
                <button onClick={() => setShowCheckInSimulatorModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select a registered {scannerRole === 'student' ? 'student' : 'staff member'} to simulate scanning their personalized entrance QR Check-in badge:
                </p>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {scannerRole === 'student' ? (
                    students.map(std => (
                      <button
                        key={std.id || std._id}
                        type="button"
                        onClick={() => handleSimulateCheckIn(std.studentId || std.rollNumber)}
                        className="w-full p-3 rounded-xl border border-slate-100 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 hover:bg-cyan-50/50 hover:border-cyan-200 dark:hover:bg-cyan-950/20 text-left transition-all flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">{std.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{std.class} • Section {std.section}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 px-2 py-0.5 rounded">
                          {std.studentId || std.rollNumber}
                        </span>
                      </button>
                    ))
                  ) : (
                    (cmsSettings.staffList || []).map((staff, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSimulateCheckIn(staff.email || staff.name)}
                        className="w-full p-3 rounded-xl border border-slate-100 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 hover:bg-teal-50/50 hover:border-teal-200 dark:hover:bg-teal-950/20 text-left transition-all flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">{staff.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{staff.title}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-200/50 dark:bg-slateCustom-800 text-slate-600 px-2 py-0.5 rounded">
                          Staff
                        </span>
                      </button>
                    ))
                  )}

                  {((scannerRole === 'student' && students.length === 0) || (scannerRole === 'teacher' && (!cmsSettings.staffList || cmsSettings.staffList.length === 0))) && (
                    <p className="text-xs text-slate-400 py-6 text-center italic">No records registered in the database yet.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
