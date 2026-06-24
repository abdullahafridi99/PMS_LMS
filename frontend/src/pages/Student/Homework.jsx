import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, BookOpen, Clock, FileText, Send, CheckCircle2 } from 'lucide-react';

export default function StudentHomework() {
  const user = useAuthStore((state) => state.user);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [selectedHw, setSelectedHw] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      // Filter by student's class
      const data = await api.homework.list(user.class);
      setHomeworks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!selectedHw || !fileUrl) return;
    setOpLoading(true);
    setMessage('');
    setError('');

    try {
      await api.homework.submit(selectedHw._id || selectedHw.id, { fileUrl });
      setMessage('🎉 Homework assignment submitted successfully!');
      setFileUrl('');
      setSelectedHw(null);
      fetchHomework();
    } catch (err) {
      setError(err.message || 'Failed to submit homework');
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
        <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-600" />
          Active Homework Assignments
        </h3>

        {message && (
          <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 rounded-xl text-teal-700 dark:text-teal-400 text-xs font-semibold mb-4">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
        ) : homeworks.length === 0 ? (
          <p className="p-12 text-center text-slate-400 text-sm italic">No homework assignments posted for your class yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {homeworks.map((hw) => {
              const studentId = user.studentId || user._id || user.id;
              const submission = (hw.submissions || []).find(s => String(s.studentId) === String(studentId));
              const isSubmitted = !!submission;
              const isGraded = isSubmitted && submission.grade;

              return (
                <div key={hw._id || hw.id} className="p-5 border border-slate-100 dark:border-slateCustom-850 rounded-[28px] bg-slate-50/40 dark:bg-slateCustom-950/20 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-outfit font-bold text-sm text-slate-850 dark:text-white">{hw.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hw.subject}</span>
                      </div>
                      
                      {/* Status Badges */}
                      <div>
                        {isGraded ? (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                            Graded: {submission.grade}
                          </span>
                        ) : isSubmitted ? (
                          <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase">
                            Submitted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{hw.description}</p>
                    
                    {hw.fileUrl && (
                      <a 
                        href={hw.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        Download Assignment PDF
                      </a>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slateCustom-850/50 flex justify-between items-center gap-4">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {hw.deadline ? new Date(hw.deadline).toLocaleDateString() : 'N/A'}
                    </span>

                    {!isSubmitted && (
                      <button
                        onClick={() => setSelectedHw(hw)}
                        className="px-3 h-8 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Send className="w-3 h-3" />
                        Submit Homework
                      </button>
                    )}

                    {isSubmitted && (
                      <div className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {isGraded && submission.feedback && (
                    <div className="mt-3 p-3 bg-slate-100 dark:bg-slateCustom-900 rounded-xl text-[11px] text-slate-500">
                      💡 <strong>Teacher Feedback:</strong> {submission.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Homework Submission Modal */}
      {selectedHw && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slateCustom-900 rounded-[32px] p-6 shadow-2xl space-y-4">
            <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Submit Homework Assignment</h3>
            <p className="text-xs text-slate-400">Assignment: <strong>{selectedHw.title}</strong></p>
            
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitHomework} className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-xs font-semibold text-slate-500">Document File URL (or local mock link)</label>
                <input 
                  type="text"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="e.g. /uploads/completed_hw.pdf"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setSelectedHw(null)}
                  className="px-4 h-10 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-slate-500 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={opLoading}
                  className="px-5 h-10 bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {opLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
