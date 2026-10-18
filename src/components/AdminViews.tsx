import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject, Examination, Question, BcaYear, ExamCategory } from '../types';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Award,
  Activity,
} from 'lucide-react';
import { isAuthorizedAdmin, PRIMARY_ADMIN_EMAIL } from '../utils/adminAuth';

export const AdminViews: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    users,
    profiles,
    subjects,
    tasks,
    examinations,
    questions,
    attempts,
    toggleUserStatus,
    deleteUser,
    addSubject,
    updateSubject,
    deleteSubject,
    addExam,
    updateExam,
    deleteExam,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useApp();

  // Filter students
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('all');

  // Subject Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subYear, setSubYear] = useState<BcaYear>('First Year');
  const [subSem, setSubSem] = useState(1);
  const [subDesc, setSubDesc] = useState('');

  // Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examSubId, setExamSubId] = useState(subjects[0]?.id || 1);
  const [examDuration, setExamDuration] = useState(20);
  const [examTotalMarks, setExamTotalMarks] = useState(20);
  const [examPassMarks, setExamPassMarks] = useState(8);
  const [examNegMarks, setExamNegMarks] = useState(0.5);
  const [examCat, setExamCat] = useState<ExamCategory>('Practice Test');
  const [examDesc, setExamDesc] = useState('');
  const [examStartAt, setExamStartAt] = useState('');

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedExamForQuestions, setSelectedExamForQuestions] = useState(examinations[0]?.id || 1);
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState(2);
  const [qNegMarks, setQNegMarks] = useState(0.5);
  const [qExplanation, setQExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Filter students
  const studentsList = users.filter((u) => u.role === 'student');
  const filteredStudents = studentsList.filter((s) => {
    const prof = profiles[s.id];
    if (selectedYearFilter !== 'all' && prof?.bcaYear !== selectedYearFilter) return false;
    if (studentSearch) {
      const match =
        s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  // Calculate live database statistics
  const totalStudents = studentsList.length;
  const activeStudents = studentsList.filter((s) => s.accountStatus === 'active').length;
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.resultStatus === 'passed').length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  // CSV Exporter
  const exportCsv = (type: 'students' | 'attempts') => {
    let csvContent = '';
    let filename = '';

    if (type === 'students') {
      filename = 'bca_registered_students_report.csv';
      csvContent = 'ID,Full Name,Email,Role,College,BCA Year,Semester,Account Status,Created At\n';
      studentsList.forEach((s) => {
        const prof = profiles[s.id];
        csvContent += `"${s.id}","${s.fullName}","${s.email}","${s.role}","${prof?.collegeName || 'N/A'}","${prof?.bcaYear || 'N/A'}","${prof?.semester || 1}","${s.accountStatus}","${s.createdAt}"\n`;
      });
    } else {
      filename = 'bca_online_examination_attempts_report.csv';
      csvContent = 'Attempt ID,Student Name,Exam Title,Score,Total Marks,Percentage,Result,Submitted At\n';
      attempts.forEach((a) => {
        const student = users.find((u) => u.id === a.userId);
        const exam = examinations.find((e) => e.id === a.examinationId);
        csvContent += `"${a.id}","${student?.fullName || 'N/A'}","${exam?.title || 'Exam'}","${a.score}","${a.totalMarks}","${a.percentage}%","${a.resultStatus}","${a.submittedAt}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Subject Handlers
  const openSubjectModal = (sub?: Subject) => {
    if (sub) {
      setEditingSub(sub);
      setSubName(sub.subjectName);
      setSubCode(sub.subjectCode);
      setSubYear(sub.bcaYear);
      setSubSem(sub.semester);
      setSubDesc(sub.description);
    } else {
      setEditingSub(null);
      setSubName('');
      setSubCode(`BCA-${Math.floor(Math.random() * 800 + 100)}`);
      setSubYear('First Year');
      setSubSem(1);
      setSubDesc('');
    }
    setIsSubModalOpen(true);
  };

  const saveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSub) {
      updateSubject({
        ...editingSub,
        subjectName: subName,
        subjectCode: subCode,
        bcaYear: subYear,
        semester: Number(subSem),
        description: subDesc,
      });
    } else {
      addSubject({
        subjectName: subName,
        subjectCode: subCode,
        bcaYear: subYear,
        semester: Number(subSem),
        description: subDesc,
      });
    }
    setIsSubModalOpen(false);
  };

  // Exam Handlers
  const openExamModal = (exam?: Examination) => {
    if (exam) {
      setEditingExam(exam);
      setExamTitle(exam.title);
      setExamSubId(exam.subjectId);
      setExamDuration(exam.durationMinutes);
      setExamTotalMarks(exam.totalMarks);
      setExamPassMarks(exam.passingMarks);
      setExamNegMarks(exam.negativeMarking);
      setExamCat(exam.examCategory);
      setExamDesc(exam.description);
      setExamStartAt(exam.startAt ? new Date(exam.startAt).toISOString().slice(0, 16) : '');
    } else {
      setEditingExam(null);
      setExamTitle('');
      setExamSubId(subjects[0]?.id || 1);
      setExamDuration(20);
      setExamTotalMarks(20);
      setExamPassMarks(8);
      setExamNegMarks(0.5);
      setExamCat('Practice Test');
      setExamDesc('');
      const defaultFuture = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      defaultFuture.setHours(10, 0, 0, 0);
      setExamStartAt(defaultFuture.toISOString().slice(0, 16));
    }
    setIsExamModalOpen(true);
  };

  const saveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const selSub = subjects.find((s) => s.id === examSubId);
    const startIso = examStartAt ? new Date(examStartAt).toISOString() : undefined;

    if (editingExam) {
      updateExam({
        ...editingExam,
        title: examTitle,
        subjectId: examSubId,
        bcaYear: selSub?.bcaYear || 'First Year',
        semester: selSub?.semester || 1,
        durationMinutes: Number(examDuration),
        totalMarks: Number(examTotalMarks),
        passingMarks: Number(examPassMarks),
        negativeMarking: Number(examNegMarks),
        examCategory: examCat,
        description: examDesc,
        startAt: startIso,
        scheduledAt: startIso,
      });
    } else {
      addExam({
        title: examTitle,
        subjectId: examSubId,
        bcaYear: selSub?.bcaYear || 'First Year',
        semester: selSub?.semester || 1,
        durationMinutes: Number(examDuration),
        totalMarks: Number(examTotalMarks),
        passingMarks: Number(examPassMarks),
        negativeMarking: Number(examNegMarks),
        examCategory: examCat,
        status: 'published',
        description: examDesc,
        startAt: startIso,
        scheduledAt: startIso,
      });
    }
    setIsExamModalOpen(false);
  };

  // Question Handlers
  const openQuestionModal = () => {
    setQText('');
    setQMarks(2);
    setQNegMarks(0.5);
    setQExplanation('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectOpt('A');
    setIsQuestionModalOpen(true);
  };

  const saveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newOptions = [
      { id: Date.now() + 1, letter: 'A', optionText: optA, isCorrect: correctOpt === 'A' },
      { id: Date.now() + 2, letter: 'B', optionText: optB, isCorrect: correctOpt === 'B' },
      { id: Date.now() + 3, letter: 'C', optionText: optC, isCorrect: correctOpt === 'C' },
      { id: Date.now() + 4, letter: 'D', optionText: optD, isCorrect: correctOpt === 'D' },
    ];

    addQuestion({
      examinationId: selectedExamForQuestions,
      questionText: qText,
      marks: Number(qMarks),
      negativeMarks: Number(qNegMarks),
      explanation: qExplanation,
      displayOrder: questions.filter((q) => q.examinationId === selectedExamForQuestions).length + 1,
      options: newOptions,
    });

    setIsQuestionModalOpen(false);
  };

  if (!isAuthorizedAdmin(currentUser)) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-100 text-purple-800">
              Administrator Security Level
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Super Admin: {currentUser?.email || PRIMARY_ADMIN_EMAIL}</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Academic Administration Console</h1>
          <p className="text-xs text-slate-500">
            Comprehensive management controls over student accounts, course subjects, online examinations, and question banks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportCsv('students')}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Students CSV</span>
          </button>
          <button
            onClick={() => exportCsv('attempts')}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Exam Results CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setCurrentView('admin_dashboard')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            currentView === 'admin_dashboard'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>
        <button
          onClick={() => setCurrentView('admin_students')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            currentView === 'admin_students'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Records ({studentsList.length})</span>
        </button>
        <button
          onClick={() => setCurrentView('admin_subjects')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            currentView === 'admin_subjects'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>
        <button
          onClick={() => setCurrentView('admin_exams')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            currentView === 'admin_exams'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Examinations &amp; Questions</span>
        </button>
        <button
          onClick={() => setCurrentView('admin_reports')}
          className={`pb-3 transition flex items-center space-x-1.5 ${
            currentView === 'admin_reports'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics Reports</span>
        </button>
      </div>

      {/* 1. ADMIN DASHBOARD OVERVIEW */}
      {currentView === 'admin_dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Registered Students</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalStudents}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {activeStudents} active student accounts
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Active BCA Subjects</span>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{subjects.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Covering Semesters 1-6</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Exams &amp; Tests</span>
              <h3 className="text-3xl font-extrabold text-purple-600 mt-2">{examinations.length}</h3>
              <p className="text-xs text-slate-500 mt-1">{questions.length} total questions in bank</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Overall Pass Rate</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">{passRate}%</h3>
              <p className="text-xs text-slate-500 mt-1">From {totalAttempts} student attempts</p>
            </div>
          </div>

          {/* Recent Exam Attempts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Live Student Exam Attempts</h3>
              <button
                onClick={() => exportCsv('attempts')}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                Download CSV Report &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Examination</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Time Taken</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempts.map((att) => {
                    const student = users.find((u) => u.id === att.userId);
                    const exam = examinations.find((e) => e.id === att.examinationId);

                    return (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {student?.fullName || 'Student'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{exam?.title || 'BCA Exam'}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {att.score} / {att.totalMarks}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-600">{att.percentage}%</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              att.resultStatus === 'passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {att.resultStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {att.timeTakenSeconds
                            ? `${Math.floor(att.timeTakenSeconds / 60)}m ${att.timeTakenSeconds % 60}s`
                            : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {att.submittedAt?.split(' ')[0] || 'Today'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDENT RECORDS MANAGEMENT */}
      {currentView === 'admin_students' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs w-64 bg-white"
                />
              </div>

              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All BCA Years</option>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
              </select>
            </div>

            <button
              onClick={() => exportCsv('students')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
            >
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student &amp; Email</th>
                  <th className="py-3 px-4">College &amp; University</th>
                  <th className="py-3 px-4">BCA Year &amp; Sem</th>
                  <th className="py-3 px-4">Roll No &amp; Registered</th>
                  <th className="py-3 px-4">Activity &amp; Exams</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No registered students found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Students who register on the portal will appear here with their academic details.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const prof = profiles[s.id];
                    const isActive = s.accountStatus === 'active';
                    const studentAttempts = attempts.filter((a) => a.userId === s.id);
                    const studentTasks = tasks.filter((t) => t.userId === s.id);
                    const avgScore =
                      studentAttempts.length > 0
                        ? Math.round(
                            studentAttempts.reduce((acc, curr) => acc + (curr.percentage ?? 0), 0) /
                              studentAttempts.length
                          )
                        : null;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <p>{s.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{s.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p className="font-medium text-slate-800">{prof?.collegeName || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400">{prof?.universityName}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">
                            {prof?.bcaYear || 'BCA'} (Sem {prof?.semester || 1})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <p className="font-semibold text-slate-800">{prof?.rollNumber || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            {s.createdAt ? s.createdAt.split(' ')[0] : 'Recently'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 font-semibold text-slate-700">
                              <FileText className="w-3 h-3 text-purple-600" />
                              <span>{studentAttempts.length} exams</span>
                              {avgScore !== null && (
                                <span className="text-[10px] text-blue-600 font-bold">
                                  ({avgScore}% avg)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                              <Calendar className="w-3 h-3 text-blue-500" />
                              <span>{studentTasks.length} study tasks</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {s.accountStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleUserStatus(s.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                                isActive
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteUser(s.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SUBJECT MANAGEMENT */}
      {currentView === 'admin_subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">BCA Subject Catalogue</h3>
            <button
              onClick={() => openSubjectModal()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Subject</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Year &amp; Semester</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {sub.subjectCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{sub.subjectName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sub.bcaYear} (Sem {sub.semester})
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{sub.description}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openSubjectModal(sub)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteSubject(sub.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EXAMINATIONS & QUESTION BANK */}
      {currentView === 'admin_exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage BCA Examinations</h3>
              <p className="text-xs text-slate-500">Configure timer limits, pass thresholds, and negative markings</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={openQuestionModal}
                className="px-3.5 py-2 border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold"
              >
                + Add Question to Bank
              </button>
              <button
                onClick={() => openExamModal()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Examination</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examinations.map((exam) => {
              const sub = subjects.find((s) => s.id === exam.subjectId);
              const qCount = questions.filter((q) => q.examinationId === exam.id).length;

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 uppercase">
                        {exam.examCategory}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600">
                        {exam.durationMinutes} Mins
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {sub?.subjectCode}: {sub?.subjectName}
                    </p>
                    <p className="text-[11px] text-purple-700 font-semibold mt-1">
                      📅 Scheduled:{' '}
                      {exam.startAt || exam.scheduledAt
                        ? new Date(exam.startAt || exam.scheduledAt || '').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'On Demand'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 my-3 p-2 bg-slate-50 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Marks</span>
                        <span className="font-bold">{exam.totalMarks}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Pass</span>
                        <span className="font-bold">{exam.passingMarks}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Questions</span>
                        <span className="font-bold text-purple-700">{qCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedExamForQuestions(exam.id);
                        openQuestionModal();
                      }}
                      className="text-xs font-bold text-purple-600 hover:underline"
                    >
                      + Add Question ({qCount})
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openExamModal(exam)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. STUDENT SIGNUPS & ACTIVITY ANALYTICS */}
      {currentView === 'admin_reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Sign-ups &amp; Engagement Activity</h3>
              <p className="text-xs text-slate-500">
                Track newly registered students, planner usage, and online examination scores
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportCsv('students')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Students CSV</span>
              </button>
              <button
                onClick={() => exportCsv('attempts')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Activity CSV</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Total Registered</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{totalStudents}</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {activeStudents} active student accounts
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Exam Attempts</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{totalAttempts}</h3>
              <p className="text-xs text-slate-500 mt-1">{passedAttempts} passed successfully</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Study Tasks</span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-indigo-600 mt-2">{tasks.length}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {tasks.filter((t) => t.status === 'Completed').length} completed in planner
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">Overall Pass Rate</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">{passRate}%</h3>
              <p className="text-xs text-slate-500 mt-1">Average score threshold</p>
            </div>
          </div>

          {/* Detailed Student Activity Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Student Sign-Up Roster &amp; Activity Summary</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Registered Date &amp; Time</th>
                    <th className="py-3 px-4">College &amp; Semester</th>
                    <th className="py-3 px-4">Exams Taken</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4">Tasks Scheduled</th>
                    <th className="py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        No registered students yet. New user signups will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    studentsList.map((st) => {
                      const prof = profiles[st.id];
                      const stAttempts = attempts.filter((a) => a.userId === st.id);
                      const stTasks = tasks.filter((t) => t.userId === st.id);
                      const avg =
                        stAttempts.length > 0
                          ? Math.round(
                              stAttempts.reduce((acc, curr) => acc + (curr.percentage ?? 0), 0) /
                                stAttempts.length
                            )
                          : null;
                      const lastAttempt = stAttempts[stAttempts.length - 1];

                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <p>{st.fullName}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{st.email}</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {st.createdAt || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <p className="font-medium">{prof?.collegeName || 'N/A'}</p>
                            <p className="text-[11px] text-slate-400">
                              {prof?.bcaYear || 'BCA'} &bull; Sem {prof?.semester || 1}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {stAttempts.length}
                          </td>
                          <td className="py-3.5 px-4">
                            {avg !== null ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  avg >= 50
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {avg}%
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No exams yet</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">
                            {stTasks.length} tasks
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {lastAttempt?.submittedAt || st.createdAt || 'Just joined'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Live Examination Submissions Stream</h4>
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No exam attempts recorded yet. When students complete tests, live submissions will populate here.
              </p>
            ) : (
              <div className="space-y-3">
                {attempts.slice(0, 10).map((att) => {
                  const student = users.find((u) => u.id === att.userId);
                  const exam = examinations.find((e) => e.id === att.examinationId);
                  const isPass = att.resultStatus === 'passed';

                  return (
                    <div
                      key={att.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {att.percentage}%
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {student?.fullName || 'Student'} completed {exam?.title || 'Examination'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Score: {att.score}/{att.totalMarks} marks &bull; Time:{' '}
                            {att.timeTakenSeconds
                              ? `${Math.floor(att.timeTakenSeconds / 60)}m ${att.timeTakenSeconds % 60}s`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {att.submittedAt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBJECT CREATE / EDIT MODAL */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingSub ? 'Edit Subject' : 'Add New BCA Subject'}
            </h3>
            <form onSubmit={saveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Expert Systems"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="BCA-503"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Semester *</label>
                  <select
                    value={subSem}
                    onChange={(e) => setSubSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">BCA Year</label>
                <select
                  value={subYear}
                  onChange={(e) => setSubYear(e.target.value as BcaYear)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXAM CREATE / EDIT MODAL */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingExam ? 'Edit Examination' : 'Create Examination'}
            </h3>
            <form onSubmit={saveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Computer Networks Semester Assessment"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subject *</label>
                  <select
                    value={examSubId}
                    onChange={(e) => setExamSubId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subjectCode} - {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={examCat}
                    onChange={(e) => setExamCat(e.target.value as ExamCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Practice Test">Practice Test</option>
                    <option value="Unit Exam">Unit Exam</option>
                    <option value="Semester Mock">Semester Mock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Duration (M)</label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={examTotalMarks}
                    onChange={(e) => setExamTotalMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pass Marks</label>
                  <input
                    type="number"
                    value={examPassMarks}
                    onChange={(e) => setExamPassMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Negative</label>
                  <input
                    type="number"
                    step="0.25"
                    value={examNegMarks}
                    onChange={(e) => setExamNegMarks(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Scheduled Examination Date &amp; Time (For Student Countdown Timer)
                </label>
                <input
                  type="datetime-local"
                  value={examStartAt}
                  onChange={(e) => setExamStartAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION BANK MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add MCQ Question</h3>
            <form onSubmit={saveQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Target Exam *</label>
                <select
                  value={selectedExamForQuestions}
                  onChange={(e) => setSelectedExamForQuestions(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                >
                  {examinations.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Question Text *</label>
                <textarea
                  required
                  rows={2}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the question text here..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                ></textarea>
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 uppercase">Answer Options (A-D) *</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    checked={correctOpt === 'A'}
                    onChange={() => setCorrectOpt('A')}
                  />
                  <span className="font-bold">A.</span>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Option A text"
                    className="flex-1 px-2.5 py-1 rounded border border-slate-300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    checked={correctOpt === 'B'}
                    onChange={() => setCorrectOpt('B')}
                  />
                  <span className="font-bold">B.</span>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Option B text"
                    className="flex-1 px-2.5 py-1 rounded border border-slate-300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    checked={correctOpt === 'C'}
                    onChange={() => setCorrectOpt('C')}
                  />
                  <span className="font-bold">C.</span>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Option C text"
                    className="flex-1 px-2.5 py-1 rounded border border-slate-300"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_opt"
                    checked={correctOpt === 'D'}
                    onChange={() => setCorrectOpt('D')}
                  />
                  <span className="font-bold">D.</span>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Option D text"
                    className="flex-1 px-2.5 py-1 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Academic Explanation *
                </label>
                <textarea
                  required
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Explain why the selected option is the correct answer..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
