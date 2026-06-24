import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Loader2, Plus, Sparkles, BookOpen, FileText, Video, Award, Clock } from 'lucide-react';

export default function AdminLMSManager() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Course Creation States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    courseName: '',
    class: 'Grade 9',
    subject: 'Physics'
  });

  // Adding resources states
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeResourceTab, setActiveResourceTab] = useState('lecture'); // 'lecture', 'notes', 'quiz'
  
  const [lectureForm, setLectureForm] = useState({ title: '', videoUrl: '', description: '' });
  const [notesForm, setNotesForm] = useState({ title: '', fileUrl: '' });
  
  // Timed MCQ Quiz States
  const [quizForm, setQuizForm] = useState({ quizTitle: '', durationMinutes: 15 });
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctOptionIdx: 0 }
  ]);

  const classes = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Urdu', 'Islamiyat'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.lms.list();
      setCourses(data);
      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0]._id || data[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setError('');
    setMessage('');
    try {
      const newCourse = await api.lms.create(courseForm);
      setMessage('🎉 New Course Syllabus folder created successfully!');
      setShowCourseModal(false);
      setCourseForm({ courseName: '', class: 'Grade 9', subject: 'Physics' });
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setOpLoading(false);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setOpLoading(true);
    setError('');
    setMessage('');
    try {
      await api.lms.addLecture(selectedCourseId, lectureForm);
      setMessage('🎥 Video Lecture added successfully!');
      setLectureForm({ title: '', videoUrl: '', description: '' });
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to add lecture');
    } finally {
      setOpLoading(false);
    }
  };

  const handleAddNotes = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setOpLoading(true);
    setError('');
    setMessage('');
    try {
      await api.lms.addNotes(selectedCourseId, notesForm);
      setMessage('📄 PDF Lecture Notes added successfully!');
      setNotesForm({ title: '', fileUrl: '' });
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to add notes');
    } finally {
      setOpLoading(false);
    }
  };

  const handleQuizQuestionChange = (qIndex, field, value) => {
    const updated = [...quizQuestions];
    updated[qIndex][field] = value;
    setQuizQuestions(updated);
  };

  const handleQuizOptionChange = (qIndex, optIdx, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[optIdx] = value;
    setQuizQuestions(updated);
  };

  const addQuizQuestionField = () => {
    setQuizQuestions(prev => [
      ...prev,
      { questionText: '', options: ['', '', '', ''], correctOptionIdx: 0 }
    ]);
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setOpLoading(true);
    setError('');
    setMessage('');
    try {
      await api.lms.addQuiz(selectedCourseId, {
        quizTitle: quizForm.quizTitle,
        durationMinutes: Number(quizForm.durationMinutes),
        questions: quizQuestions
      });
      setMessage('🏆 Timed MCQ Quiz added successfully to Course syllabus!');
      setQuizForm({ quizTitle: '', durationMinutes: 15 });
      setQuizQuestions([{ questionText: '', options: ['', '', '', ''], correctOptionIdx: 0 }]);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to add quiz');
    } finally {
      setOpLoading(false);
    }
  };

  const activeCourse = courses.find(c => (c._id || c.id) === selectedCourseId);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-outfit font-black text-2xl text-slate-800 dark:text-white">LMS & Curriculum Manager</h2>
          <p className="text-slate-400 text-xs font-semibold">Organize syllabus folders, video links, pdf files, and timed MCQ quizzes</p>
        </div>
        <button 
          onClick={() => setShowCourseModal(true)}
          className="px-4 h-11 bg-gradient-brand shadow-brand-500/20 hover:shadow-brand-500/30 rounded-xl text-white font-bold text-xs flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider pt-0.5"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Course Directory
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 rounded-2xl text-teal-700 dark:text-teal-400 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Select Course & View Syllabus */}
        <div className="lg:col-span-5 bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4">Course Folders</h3>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm italic">No courses created yet. Create one to get started.</div>
            ) : (
              <div className="space-y-3">
                {courses.map(c => {
                  const courseId = c._id || c.id;
                  return (
                    <button
                      key={courseId}
                      onClick={() => setSelectedCourseId(courseId)}
                      className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                        selectedCourseId === courseId
                          ? 'border-brand-500/50 bg-brand-50/40 dark:bg-brand-950/20 text-slate-800 dark:text-white'
                          : 'border-slate-100 dark:border-slateCustom-850 hover:bg-slate-50 dark:hover:bg-slateCustom-850/50 text-slate-650 dark:text-slate-400'
                      }`}
                    >
                      <div>
                        <span className="font-outfit font-bold text-sm block">{c.courseName}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{c.class} • {c.subject}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                          🎬 {c.lectures?.length || 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                          📄 {c.notes?.length || 0}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          🏆 {c.quizzes?.length || 0}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Resource Editor / Inserter */}
        <div className="lg:col-span-7 bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between">
          {!activeCourse ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-sm italic">
              Please select a Course Syllabus folder from the left pane to add resources.
            </div>
          ) : (
            <div>
              <div className="border-b border-slate-100 dark:border-slateCustom-850 pb-4 mb-6 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Active Directory</span>
                  <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">{activeCourse.courseName}</h3>
                </div>
                <div className="flex gap-2 bg-slate-50 dark:bg-slateCustom-950 p-1.5 rounded-xl">
                  {['lecture', 'notes', 'quiz'].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveResourceTab(t)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                        activeResourceTab === t
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-slate-550 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Forms */}
              {activeResourceTab === 'lecture' && (
                <form onSubmit={handleAddLecture} className="space-y-4">
                  <div className="text-left space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Lecture Title</label>
                    <input 
                      type="text" 
                      required
                      value={lectureForm.title}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Intro to Quantum Theory"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div className="text-left space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Video Link URL (Youtube/Cloudinary)</label>
                    <input 
                      type="url" 
                      required
                      value={lectureForm.videoUrl}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div className="text-left space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Lecture Description</label>
                    <textarea 
                      value={lectureForm.description}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed topics covered in this video lecture session..."
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all h-24 resize-none"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={opLoading}
                      className="px-5 h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4.5 h-4.5" />}
                      Add Video Lecture
                    </button>
                  </div>
                </form>
              )}

              {activeResourceTab === 'notes' && (
                <form onSubmit={handleAddNotes} className="space-y-4">
                  <div className="text-left space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Document Title</label>
                    <input 
                      type="text" 
                      required
                      value={notesForm.title}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Chapter 2 Notes PDF"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div className="text-left space-y-2">
                    <label className="text-xs font-semibold text-slate-500">File Attachment URL</label>
                    <input 
                      type="text" 
                      required
                      value={notesForm.fileUrl}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                      placeholder="e.g. /uploads/notes.pdf or Cloudinary URL"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={opLoading}
                      className="px-5 h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4.5 h-4.5" />}
                      Add PDF Notes
                    </button>
                  </div>
                </form>
              )}

              {activeResourceTab === 'quiz' && (
                <form onSubmit={handleAddQuiz} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Quiz Title</label>
                      <input 
                        type="text" 
                        required
                        value={quizForm.quizTitle}
                        onChange={(e) => setQuizForm(prev => ({ ...prev, quizTitle: e.target.value }))}
                        placeholder="e.g. Chapters 1-3 Quiz"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                    <div className="text-left space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Duration (Minutes)</label>
                      <input 
                        type="number" 
                        required
                        value={quizForm.durationMinutes}
                        onChange={(e) => setQuizForm(prev => ({ ...prev, durationMinutes: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slateCustom-850">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-550">Multiple Choice Questions list</h4>
                      <button
                        type="button"
                        onClick={addQuizQuestionField}
                        className="px-3 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slateCustom-950 dark:hover:bg-slateCustom-850 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slateCustom-800 transition-all"
                      >
                        + Add Question
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {quizQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 bg-slate-50/50 dark:bg-slateCustom-950/40 border border-slate-200/30 dark:border-slateCustom-850 rounded-2xl space-y-3">
                          <div className="text-left space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 block uppercase">Question {qIdx + 1}</label>
                            <input 
                              type="text" 
                              required
                              value={q.questionText}
                              onChange={(e) => handleQuizQuestionChange(qIdx, 'questionText', e.target.value)}
                              placeholder="Enter the question text..."
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <input 
                                key={oIdx}
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleQuizOptionChange(qIdx, oIdx, e.target.value)}
                                placeholder={`Option ${oIdx + 1}`}
                                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                              />
                            ))}
                          </div>

                          <div className="text-left space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block">Correct Option Index</label>
                            <select
                              value={q.correctOptionIdx}
                              onChange={(e) => handleQuizQuestionChange(qIdx, 'correctOptionIdx', Number(e.target.value))}
                              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-white dark:bg-slateCustom-900 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slateCustom-850">
                    <button
                      type="submit"
                      disabled={opLoading}
                      className="px-5 h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4.5 h-4.5" />}
                      Publish Timed MCQ Quiz
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Folder Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slateCustom-900 rounded-[32px] p-6 shadow-2xl space-y-4">
            <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white">Create Course Syllabus Folder</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-xs font-semibold text-slate-500">Course Syllabus Name</label>
                <input 
                  type="text"
                  required
                  value={courseForm.courseName}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, courseName: e.target.value }))}
                  placeholder="e.g. Physics Grade 9 Valley Syllabus"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Class / Grade</label>
                  <select 
                    value={courseForm.class}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="text-left space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Subject</label>
                  <select 
                    value={courseForm.subject}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 h-10 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-slate-500 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={opLoading}
                  className="px-5 h-10 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  {opLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
