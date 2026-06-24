import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Loader2, Plus, Sparkles, BookOpen } from 'lucide-react';

export default function AdminExams() {
  const [term, setTerm] = useState('First Term 2026');
  const [selectedClass, setSelectedClass] = useState('Grade 9');
  const [subject, setSubject] = useState('Physics');
  const [maxMarks, setMaxMarks] = useState(100);
  
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({}); // { studentId: score }
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const classes = Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`);
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Urdu', 'Islamiyat'];

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.students.list(selectedClass);
      setStudents(data);
      // Initialize scores
      const initialScores = {};
      data.forEach(s => {
        initialScores[s.studentId || s._id] = '';
      });
      setScores(initialScores);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId, val) => {
    setScores(prev => ({
      ...prev,
      [studentId]: val
    }));
  };

  const handleSubmitMarks = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setMessage('');
    setError('');

    const marksList = students.map(s => {
      const studentId = s.studentId || s._id || s.id;
      const score = scores[studentId];
      return {
        studentId,
        studentName: s.name,
        rollNumber: s.rollNumber,
        score: score === '' ? 0 : Number(score)
      };
    });

    try {
      await api.exams.upload({
        term,
        class: selectedClass,
        subject,
        maxMarks: Number(maxMarks),
        marks: marksList
      });
      setMessage('🎉 Exam scores uploaded and student rankings calculated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload exam scores');
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
        <h3 className="font-outfit font-bold text-xl text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" />
          Enter Subject Exam Scores
        </h3>

        <form onSubmit={handleSubmitMarks} className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Academic Term</label>
              <select 
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              >
                <option value="First Term 2026">First Term 2026</option>
                <option value="Mid Term 2026">Mid Term 2026</option>
                <option value="Final Term 2026">Final Term 2026</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Class / Grade</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">Maximum Marks</label>
              <input 
                type="number"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 rounded-xl text-teal-700 dark:text-teal-400 text-xs font-semibold">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No students found enrolled in {selectedClass} to assign marks.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 dark:border-slateCustom-800 rounded-2xl">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 text-slate-700 dark:text-slate-350">
                    <tr>
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4 w-40">Obtained Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-850">
                    {students.map((student) => {
                      const studentId = student.studentId || student._id || student.id;
                      return (
                        <tr key={studentId} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-850/40">
                          <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{student.rollNumber}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-350">{student.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-400 text-xs">{studentId}</td>
                          <td className="px-6 py-4">
                            <input 
                              type="number"
                              min={0}
                              max={maxMarks}
                              value={scores[studentId] || ''}
                              onChange={(e) => handleScoreChange(studentId, e.target.value)}
                              placeholder="e.g. 85"
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500 transition-all text-center"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={opLoading}
                  className="px-6 h-11 bg-gradient-brand shadow-brand-500/20 hover:shadow-brand-500/30 rounded-xl text-white font-bold text-sm flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {opLoading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Uploading Marks...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Publish Exam Scores
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
