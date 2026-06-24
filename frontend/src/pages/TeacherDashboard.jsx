import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Calendar, 
  Megaphone, 
  LogOut, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Loader2, 
  QrCode, 
  User, 
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, API_BASE_URL } from '../utils/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherUser, setTeacherUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Lists
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (!user || user.role !== 'teacher') {
      navigate('/teacher-login');
      return;
    }
    setTeacherUser(user);
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // 1. Fetch own logs
      const token = localStorage.getItem('token');
      const attRes = await fetch(`${API_BASE_URL}/attendance/teacher/my-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (attRes.ok) {
        const attLogs = await attRes.json();
        setAttendanceRecords(attLogs);
      }

      // 2. Fetch notices
      const noticesData = await api.notices.list();
      setNotices(noticesData.filter(n => n.targetAudience === 'all' || n.targetAudience === 'parents'));
    } catch (err) {
      console.error('Error loading teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    navigate('/login');
  };

  if (loading || !teacherUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-bold font-outfit text-sm">Loading Teacher Dashboard Portal...</p>
      </div>
    );
  }

  // Calculate attendance rates
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const lateDays = attendanceRecords.filter(r => r.status === 'late').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalDays = attendanceRecords.length;
  const rate = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 flex flex-col lg:flex-row text-slate-700 dark:text-slate-350 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-full lg:w-72 bg-white dark:bg-slateCustom-900 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slateCustom-800 flex flex-col justify-between p-6 flex-shrink-0 z-20">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <h2 className="font-outfit font-black text-slate-900 dark:text-white leading-tight text-base tracking-wide">PMS Portal</h2>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Faculty Desk</span>
            </div>
          </div>

          {/* Profile Quick Card */}
          <div className="p-4 bg-teal-50/50 dark:bg-teal-950/15 border border-teal-100/50 dark:border-teal-900/30 rounded-2xl flex gap-3.5 items-center text-left">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-bold flex items-center justify-center uppercase font-outfit shadow-sm">
              {teacherUser.name.slice(0, 2)}
            </div>
            <div className="truncate">
              <h4 className="font-outfit font-bold text-sm text-slate-800 dark:text-white truncate leading-tight">{teacherUser.name}</h4>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{teacherUser.address || 'Academic Faculty'}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-left">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-slate-900 dark:bg-slateCustom-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slateCustom-850/50'
              }`}
            >
              <User className="w-4.5 h-4.5" />
              Overview Control
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${
                activeTab === 'attendance'
                  ? 'bg-slate-900 dark:bg-slateCustom-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slateCustom-850/50'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('notices')}
              className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 font-semibold text-sm transition-all ${
                activeTab === 'notices'
                  ? 'bg-slate-900 dark:bg-slateCustom-800 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slateCustom-850/50'
              }`}
            >
              <Megaphone className="w-4.5 h-4.5" />
              Announcements
            </button>
          </nav>
        </div>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full h-11 px-4 border border-slate-200 dark:border-slateCustom-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-wider mt-8"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Portal
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* HEADER BAR */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-6 border-b border-slate-200/50 dark:border-slateCustom-800">
          <div className="text-left space-y-1">
            <h1 className="font-outfit font-black text-2xl lg:text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Assalam-o-Alaikum, {teacherUser.name.split(' ')[0]}!
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Welcome back to the Pakhtunkhwa Model School faculty terminal.</p>
          </div>
          <div className="text-xs font-semibold px-4 py-2 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-xl flex items-center gap-2 shadow-sm font-outfit">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* CONTENT VIEWPORTS */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Overview grid stats */}
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Attendance Rate</h4>
                    <p className="font-outfit font-black text-xl text-slate-900 dark:text-white mt-0.5">{rate}%</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Records</h4>
                    <p className="font-outfit font-black text-xl text-slate-900 dark:text-white mt-0.5">{totalDays} days</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Designation</h4>
                    <p className="font-outfit font-bold text-sm text-slate-900 dark:text-white mt-1.5 truncate max-w-[150px]">{teacherUser.address || 'Senior Faculty'}</p>
                  </div>
                </div>
              </div>

              {/* QR and Calendar Row */}
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Visual Identity Scan Card */}
                <div className="lg:col-span-5 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[32px] p-8 shadow-sm flex flex-col justify-between items-center text-center space-y-6">
                  <div>
                    <h3 className="font-outfit font-bold text-base text-slate-800 dark:text-white">Entrance QR Identity Card</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Scan this at the entrance terminal station for check-in.</p>
                  </div>

                  {/* Pulsing Scan Viewport */}
                  <div className="w-56 h-56 bg-slate-950 border-[6px] border-slateCustom-800 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner group">
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
                    <div className="absolute inset-[10%] border border-dashed border-teal-400/20 rounded-xl" />
                    <div className="absolute left-0 w-full h-[2px] bg-teal-400 animate-laser shadow-[0_0_8px_#2dd4bf]" />
                    
                    {/* Generates a dummy QR icon visually representing the ID */}
                    <div className="w-36 h-36 bg-white rounded-xl p-3 flex items-center justify-center relative">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty CNIC</span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white tracking-wider">{teacherUser.studentId || 'CNIC Pending'}</h4>
                  </div>
                </div>

                {/* Recent Logs Table */}
                <div className="lg:col-span-7 bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between text-left">
                  <div className="space-y-4">
                    <h3 className="font-outfit font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      Recent Attendance Records
                    </h3>

                    {attendanceRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slateCustom-800">
                              <th className="py-2.5 text-left font-semibold">Date</th>
                              <th className="py-2.5 text-center font-semibold">Check-in Time</th>
                              <th className="py-2.5 text-right font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendanceRecords.slice(0, 5).map((log, idx) => (
                              <tr key={log._id || log.id || idx} className="border-b border-slate-50 dark:border-slateCustom-850/30 text-xs">
                                <td className="py-3 font-semibold text-slate-600 dark:text-slate-400">{log.date}</td>
                                <td className="py-3 text-center font-mono font-bold text-teal-600 dark:text-teal-400">{log.time}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                    log.status === 'present' 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                                      : log.status === 'late'
                                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                                      : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium py-12 text-center">No attendance logs logged yet for this CNIC profile.</p>
                    )}
                  </div>
                  
                  {attendanceRecords.length > 5 && (
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-bold text-center mt-4 w-full"
                    >
                      View All Attendance Records →
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[32px] p-6 lg:p-8 shadow-sm text-left"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Full Attendance Logs</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Chronological list of all daily scan entries matching your name in administrative settings.</p>
                </div>

                {attendanceRecords.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-100 dark:border-slateCustom-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slateCustom-950 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 border-b border-slate-100 dark:border-slateCustom-800">
                        <tr>
                          <th className="px-6 py-4 text-left">Target Date</th>
                          <th className="px-6 py-4 text-center">Designation Reference</th>
                          <th className="px-6 py-4 text-center">Entrance Terminal time</th>
                          <th className="px-6 py-4 text-right">Status Badge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-850/30 text-slate-600 dark:text-slate-350">
                        {attendanceRecords.map((log, idx) => (
                          <tr key={log._id || log.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-955/20 transition-colors">
                            <td className="px-6 py-4 font-semibold">{log.date}</td>
                            <td className="px-6 py-4 text-center font-medium text-slate-400">{log.title || 'Faculty Member'}</td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-teal-600 dark:text-teal-400">{log.time}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                                log.status === 'present' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250/20' 
                                  : log.status === 'late'
                                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-250/20'
                                  : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 font-medium bg-slate-50 dark:bg-slateCustom-955 rounded-2xl">
                    No attendance files found in MERN system logs.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'notices' && (
            <motion.div
              key="notices"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="text-left">
                <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Notice Board Announcements</h3>
                <p className="text-xs text-slate-400 mt-0.5">Critical broadcast messages sent by the administrator desk.</p>
              </div>

              {notices.length > 0 ? (
                <div className="grid gap-6">
                  {notices.map((notice, idx) => (
                    <div 
                      key={notice._id || notice.id || idx} 
                      className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden group hover:shadow-md transition-all"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500" />
                      <div className="space-y-3.5 pl-2">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-outfit font-black text-slate-850 dark:text-white text-base leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{notice.title}</h4>
                          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap bg-slate-50 dark:bg-slateCustom-950 px-2 py-0.5 rounded-lg border border-slate-200/40">
                            {new Date(notice.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{notice.content}</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slateCustom-850/50 text-[10px] text-slate-400 font-semibold font-outfit uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                          Target: {notice.targetAudience} Notice
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/50 dark:border-slateCustom-800 rounded-[32px] py-16 text-center text-slate-450 font-medium">
                  Notice board is empty.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
