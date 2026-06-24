import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { Loader2, BookOpen, Video, FileText, Award, Clock } from 'lucide-react';
import canvasConfetti from 'canvas-confetti';

export default function StudentLMSPortal() {
  const user = useAuthStore((state) => state.user);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Timed Quiz taking states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionIdx: optionIdx }
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Timer loop
  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) {
      if (activeQuiz && timeLeft === 0) {
        handleAutoSubmitQuiz();
      }
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.lms.list(user.class);
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setQuizScore(null);
    setTimeLeft(quiz.durationMinutes * 60);
  };

  const handleSelectOption = (qIdx, optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleAutoSubmitQuiz = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIdx) {
        correctCount++;
      }
    });

    setQuizScore({
      correct: correctCount,
      total: activeQuiz.questions.length,
      percentage: Math.round((correctCount / activeQuiz.questions.length) * 100)
    });

    if (correctCount === activeQuiz.questions.length) {
      canvasConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
        <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-600" />
          LMS Curriculum & Timed Quizzes
        </h3>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
        ) : courses.length === 0 ? (
          <p className="p-12 text-center text-slate-400 text-sm italic">No course folders posted for your class yet.</p>
        ) : (
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course._id || course.id} className="p-6 border border-slate-100 dark:border-slateCustom-850 rounded-[32px] bg-slate-50/20 dark:bg-slateCustom-950/20 space-y-6">
                <div>
                  <h4 className="font-outfit font-bold text-lg text-slate-850 dark:text-white">{course.courseName}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.class} • {course.subject}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Lectures */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Video className="w-4 h-4 text-teal-500" />
                      Recorded Lectures
                    </h5>
                    {(course.lectures || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No videos uploaded.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.lectures.map((l, idx) => (
                          <a 
                            key={idx} 
                            href={l.videoUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block p-3 rounded-xl border border-slate-100 dark:border-slateCustom-850 bg-white dark:bg-slateCustom-900 hover:border-teal-500/40 transition-all"
                          >
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-200 block truncate">{l.title}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{l.description || 'Watch class video lecture'}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Syllabus Notes PDF
                    </h5>
                    {(course.notes || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No notes uploaded.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.notes.map((n, idx) => (
                          <a 
                            key={idx} 
                            href={n.fileUrl} 
                            download
                            className="block p-3 rounded-xl border border-slate-100 dark:border-slateCustom-850 bg-white dark:bg-slateCustom-900 hover:border-purple-500/40 transition-all"
                          >
                            <span className="font-bold text-xs text-slate-700 dark:text-slate-200 block truncate">{n.title}</span>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block pt-1 text-[9px] uppercase tracking-wider">Download PDF</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quizzes */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      Academic Quizzes
                    </h5>
                    {(course.quizzes || []).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No active quizzes.</p>
                    ) : (
                      <div className="space-y-2">
                        {course.quizzes.map((q, idx) => (
                          <div 
                            key={idx} 
                            className="p-3 rounded-xl border border-slate-100 dark:border-slateCustom-850 bg-white dark:bg-slateCustom-900 flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-200 block truncate">{q.quizTitle}</span>
                              <span className="text-[10px] text-slate-400 block truncate">⏳ {q.durationMinutes} mins • {q.questions?.length || 0} MCQs</span>
                            </div>
                            <button
                              onClick={() => handleStartQuiz(q)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-all"
                            >
                              Start Timed Quiz
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slateCustom-900 rounded-[36px] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slateCustom-850 pb-4">
              <div>
                <h3 className="font-outfit font-black text-xl text-slate-800 dark:text-white">{activeQuiz.quizTitle}</h3>
                <span className="text-xs text-slate-400">Total Questions: {activeQuiz.questions.length}</span>
              </div>
              
              {!quizScore && (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 font-mono font-bold text-sm">
                  <Clock className="w-4.5 h-4.5 animate-pulse" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Quiz Body */}
            {!quizScore ? (
              <div className="space-y-6">
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3 text-left">
                    <p className="font-bold text-sm text-slate-850 dark:text-slate-200">
                      Q{qIdx + 1}. {q.questionText}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(qIdx, oIdx)}
                          className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            answers[qIdx] === oIdx
                              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-slate-800 dark:text-white'
                              : 'border-slate-100 dark:border-slateCustom-850 hover:bg-slate-50 dark:hover:bg-slateCustom-850/50 text-slate-650 dark:text-slate-450'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-6 h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              // Quiz Results Screen
              <div className="py-8 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="font-outfit font-black text-2xl text-slate-800 dark:text-white">Quiz Completed!</h4>
                  <p className="text-slate-400 text-xs mt-1">Syllabus test assessment score overview</p>
                </div>

                <div className="bg-slate-50 dark:bg-slateCustom-950 p-6 rounded-3xl border border-slate-200/50 dark:border-slateCustom-850 max-w-sm mx-auto space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Correct Answers</span>
                    <span className="text-slate-800 dark:text-white">{quizScore.correct} / {quizScore.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Percentage Score</span>
                    <span className="text-brand-600 dark:text-brand-400">{quizScore.percentage}%</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-6 h-10 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-slate-550 font-bold text-xs transition-all uppercase tracking-wider"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
