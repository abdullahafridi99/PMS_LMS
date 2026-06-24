import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Loader2, ShieldCheck, Clock, User, MessageSquare } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.logs.listAudit();
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
        <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          Administration Audit Trail Logs
        </h3>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm italic">No administrative actions logged yet.</div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div 
                key={log._id || log.id}
                className="p-4 border border-slate-100 dark:border-slateCustom-850 rounded-2xl bg-slate-50/40 dark:bg-slateCustom-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-950 text-[10px] text-brand-700 dark:text-brand-400 font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-start gap-1.5 pt-1">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-slateCustom-900 border border-slate-200/40 dark:border-slateCustom-800 px-3 py-1.5 rounded-xl">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-350">{log.userRole?.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
