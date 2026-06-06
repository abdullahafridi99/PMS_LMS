import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, HeartHandshake, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();

  const portals = [
    {
      title: 'Admin Portal',
      description: 'Institutional management workspace for school administrators & principals.',
      loginPath: '/admin-login',
      signupPath: '/admin-signup',
      icon: ShieldCheck,
      color: 'from-brand-500 to-brand-700',
      iconColor: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-950/20'
    },
    {
      title: 'Student Portal',
      description: 'Academic console for attendance tracking, grades sheet, timetables & notices.',
      loginPath: '/student-login',
      signupPath: '/student-signup',
      icon: UserCheck,
      color: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20'
    },
    {
      title: 'Parent Portal',
      description: 'Guardian tracking board to review progress, grades & pay monthly bills online.',
      loginPath: '/parent-login',
      signupPath: '/parent-signup',
      icon: HeartHandshake,
      color: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slateCustom-950 flex flex-col justify-between relative font-sans overflow-hidden transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[50%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold text-sm transition-colors animate-pulse"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </button>
      </header>

      {/* PORTALS LIST */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 z-10 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h1 className="font-outfit font-black text-4xl tracking-tight text-slate-900 dark:text-white block">Portal Selection Gateway</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto font-medium">
            Welcome to the digital gateway of **Pakhtunkhwa Model School Zangali Branch**. Select your role below to log in or register a new portal account.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full">
          {portals.map((portal, idx) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-slateCustom-900 border border-slate-200 dark:border-slateCustom-800 rounded-[32px] shadow-xl p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${portal.color}`} />
                
                <div className="space-y-5 text-left mb-8">
                  <div className={`w-14 h-14 rounded-2xl ${portal.bgColor} flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-7 h-7 ${portal.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-outfit font-bold text-2xl text-slate-900 dark:text-white mb-2">{portal.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">{portal.description}</p>
                  </div>
                </div>

                <div className="space-y-3 w-full">
                  <button
                    onClick={() => navigate(portal.loginPath)}
                    className={`w-full h-11 bg-gradient-to-r ${portal.color} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] transition-all uppercase tracking-wider pt-0.5`}
                  >
                    Log In to Account
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(portal.signupPath)}
                    className="w-full h-11 border border-slate-200 dark:border-slateCustom-800 hover:bg-slate-50 dark:hover:bg-slateCustom-950 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl flex items-center justify-center transition-all uppercase tracking-wider"
                  >
                    Self-Registration
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-16 flex items-center justify-center text-xs text-slate-400 z-10 px-6 text-center">
        <span>© {new Date().getFullYear()} Pakhtunkhwa Model School. Secure Multi-Role Portal Authentication Gateway.</span>
      </footer>
    </div>
  );
}
