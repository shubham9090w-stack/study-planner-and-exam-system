import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Examination, BcaYear, ExamCategory, Subject } from '../types';
import { parseNaturalTestRequest } from '../utils/customExamGenerator';
import {
  FileText,
  Clock,
  Award,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Eye,
  Sparkles,
  Sliders,
  Zap,
  Check,
  BookOpen,
  Send,
  HelpCircle,
  Search,
} from 'lucide-react';

export const OnlineExamsView: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    examinations,
    subjects,
    attempts,
    setActiveExamId,
    setViewingResultAttemptId,
    setCurrentView,
    generateCustomExam,
  } = useApp();

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [instructionModalExam, setInstructionModalExam] = useState<Examination | null>(null);

  // Custom Test Builder state
  const [customSubjectId, setCustomSubjectId] = useState<number>(6); // Default DBMS
  const [customQuestionCount, setCustomQuestionCount] = useState<number>(10); // Default 10 questions
  const [customNegativeMarking, setCustomNegativeMarking] = useState<number>(0.5);
  const [naturalQueryInput, setNaturalQueryInput] = useState<string>('');
  const [parseFeedbackMsg, setParseFeedbackMsg] = useState<string | null>(null);

  // Modal custom question count override
  const [modalQuestionCount, setModalQuestionCount] = useState<number>(10);
  const [modalUseCustomCount, setModalUseCustomCount] = useState<boolean>(false);

  const userAttempts = attempts.filter((a) =>
    !currentUser ? true : a.userId === currentUser.id || a.userId === 9999
  );

  const filteredExams = examinations.filter((exam) => {
    if (exam.status !== 'published') return false;
    if (selectedYear !== 'all' && exam.bcaYear !== selectedYear) return false;
    if (selectedCategory !== 'all' && exam.examCategory !== selectedCategory) return false;
    return true;
  });

  // Natural query auto-parsing
  const handleApplyNaturalQuery = (textToParse?: string) => {
    const query = (textToParse !== undefined ? textToParse : naturalQueryInput).trim();
    if (!query) return;

    const result = parseNaturalTestRequest(query, subjects);
    let feedback = '';

    if (result.matchedSubject) {
      setCustomSubjectId(result.matchedSubject.id);
      feedback += `Subject set to: ${result.matchedSubject.subjectName}. `;
    }

    if (result.questionCount) {
      setCustomQuestionCount(result.questionCount);
      feedback += `Questions set to: ${result.questionCount} questions.`;
    }

    if (!result.matchedSubject && !result.questionCount) {
      setParseFeedbackMsg('Could not detect subject or question count. Please use the dropdown and question buttons below.');
    } else {
      setParseFeedbackMsg(`Auto-configured: ${feedback}`);
      setTimeout(() => setParseFeedbackMsg(null), 5000);
    }
  };

  // Launch standard exam
  const handleStartExam = (exam: Examination) => {
    if (modalUseCustomCount && modalQuestionCount !== exam.questionsCount) {
      // Launch custom tailored test for this subject
      const newExamId = generateCustomExam({
        subjectId: exam.subjectId,
        questionCount: modalQuestionCount,
        negativeMarking: exam.negativeMarking,
        customTitle: `${exam.title} (${modalQuestionCount} Questions)`,
      });
      setInstructionModalExam(null);
      setActiveExamId(newExamId);
      setCurrentView('take_exam');
    } else {
      setInstructionModalExam(null);
      setActiveExamId(exam.id);
      setCurrentView('take_exam');
    }
  };

  // Launch custom test paper
  const handleLaunchCustomTest = () => {
    const selectedSub = subjects.find((s) => s.id === customSubjectId) || subjects[0];
    const newExamId = generateCustomExam({
      subjectId: selectedSub.id,
      questionCount: customQuestionCount,
      negativeMarking: customNegativeMarking,
      customTitle: `Practice Test: ${selectedSub.subjectName} (${customQuestionCount} Questions)`,
    });

    setActiveExamId(newExamId);
    setCurrentView('take_exam');
  };

  const selectedCustomSubject = subjects.find((s) => s.id === customSubjectId) || subjects[0];
  const customDurationMinutes = Math.max(5, Math.round(customQuestionCount * 1.5));
  const customTotalMarks = customQuestionCount * 2;
  const customPassMarks = Math.ceil(customQuestionCount * 0.8);

  // Quick prompt presets for common user queries
  const promptPresets = [
    { label: 'DBMS (10 Questions)', query: 'test of dbms student will write i want to give test 10 question' },
    { label: 'Computer Fundamentals (10 Q)', query: 'test of computer fundamental 10 questions' },
    { label: 'OOPS using C++ (10 Q)', query: 'oops using c++ 10 question' },
    { label: 'Python (10 Q)', query: 'test of python 10 questions' },
    { label: 'E-Business (10 Q)', query: 'test of e business 10 questions' },
    { label: 'Functional Management (10 Q)', query: 'test of functional management 10 questions' },
    { label: 'Entrepreneurship (10 Q)', query: 'test of entrepreneurship development 10 questions' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">BCA Online Examination System</h1>
          <p className="text-sm text-slate-500">
            Timed practice tests, custom question papers, and instant scoring with detailed answer analysis.
          </p>
        </div>

        {/* Quick Filter Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">All BCA Years</option>
            <option value="First Year">First Year (Sem 1 &amp; 2)</option>
            <option value="Second Year">Second Year (Sem 3 &amp; 4)</option>
            <option value="Third Year">Third Year (Sem 5 &amp; 6)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Practice Test">Practice Test</option>
            <option value="Unit Exam">Unit Exam</option>
            <option value="Semester Mock">Semester Mock</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CUSTOM TEST PAPER BUILDER (FEATURED STUDENT GENERATOR) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-900/60">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Custom Assessment Generator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Design Your Own Test Paper
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Decide exactly which BCA subject to test and choose how many questions you want to attempt (e.g., 10 questions on DBMS, Computer Fundamentals, OOPS using C++, Python, etc.).
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs bg-blue-900/40 border border-blue-700/50 px-3.5 py-2 rounded-2xl shrink-0">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Test Generation &amp; Detailed Results</span>
            </div>
          </div>

          {/* Natural Language Prompt Input Bar */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-blue-200">
              Natural Query (Type what you want to practice, e.g. "i want to give test 10 question on dbms"):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={naturalQueryInput}
                  onChange={(e) => setNaturalQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyNaturalQuery();
                  }}
                  placeholder='e.g. "test of dbms student will write i want to give test 10 question"'
                  className="w-full bg-slate-800/80 border border-blue-700/60 focus:border-blue-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyNaturalQuery()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Auto-Configure</span>
              </button>
            </div>

            {/* Quick Presets Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-blue-300 font-semibold mr-1">Quick Select:</span>
              {promptPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNaturalQueryInput(preset.query);
                    handleApplyNaturalQuery(preset.query);
                  }}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 text-blue-200 hover:text-white transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {parseFeedbackMsg && (
              <div className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-lg">
                {parseFeedbackMsg}
              </div>
            )}
          </div>

          {/* Interactive Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {/* Subject Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-200 block">
                1. Select BCA Subject:
              </label>
              <select
                value={customSubjectId}
                onChange={(e) => setCustomSubjectId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-blue-700/60 text-white rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue-400"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                    {sub.subjectCode} - {sub.subjectName} ({sub.bcaYear})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-blue-300 block line-clamp-1">
                {selectedCustomSubject?.description}
              </span>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-200 block">
                2. Decide Number of Questions:
              </label>
              <div className="flex items-center space-x-1.5">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setCustomQuestionCount(count)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                      customQuestionCount === count
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-slate-800/80 text-blue-200 border-blue-900/60 hover:bg-slate-700'
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>

              {/* Custom Number Input */}
              <div className="flex items-center space-x-2 pt-1 text-xs">
                <span className="text-[11px] text-blue-300">Or custom count:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={customQuestionCount}
                  onChange={(e) => setCustomQuestionCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="w-20 bg-slate-800 border border-blue-700/60 rounded-lg px-2.5 py-1 text-xs text-white font-bold text-center focus:outline-none"
                />
                <span className="text-[11px] text-blue-300">questions</span>
              </div>
            </div>

            {/* Negative Marking Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-blue-200 block">
                3. Evaluation Mode:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomNegativeMarking(0.5)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                    customNegativeMarking === 0.5
                      ? 'bg-blue-600 text-white border-blue-400 shadow'
                      : 'bg-slate-800/80 text-blue-200 border-blue-900/60 hover:bg-slate-700'
                  }`}
                >
                  Standard (-0.5)
                  <span className="text-[10px] block opacity-80 font-normal">Exam Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomNegativeMarking(0)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                    customNegativeMarking === 0
                      ? 'bg-blue-600 text-white border-blue-400 shadow'
                      : 'bg-slate-800/80 text-blue-200 border-blue-900/60 hover:bg-slate-700'
                  }`}
                >
                  No Penalty (0.0)
                  <span className="text-[10px] block opacity-80 font-normal">Casual Practice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Paper Summary Card & Launch Button */}
          <div className="bg-slate-800/80 border border-blue-700/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-blue-300 uppercase font-bold block">Paper Size</span>
                <span className="text-base font-extrabold text-white">{customQuestionCount} Questions</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-300 uppercase font-bold block">Duration</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">{customDurationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-300 uppercase font-bold block">Total Marks</span>
                <span className="text-base font-extrabold text-white">{customTotalMarks} Marks</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-300 uppercase font-bold block">Pass Criterion</span>
                <span className="text-base font-extrabold text-emerald-400">{customPassMarks} Marks (40%)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchCustomTest}
              className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Generate &amp; Start Test Paper Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STANDARD PUBLISHED EXAMINATIONS GRID */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Standard Department Examinations</h2>
            <p className="text-xs text-slate-500">Official college midterm papers, semester mocks, and unit assessments</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredExams.length} Exams Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const sub = subjects.find((s) => s.id === exam.subjectId);
            const pastAttempt = userAttempts.find((a) => a.examinationId === exam.id);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {exam.examCategory}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {exam.bcaYear} (Sem {exam.semester})
                    </span>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-bold text-blue-600 block">
                      {sub?.subjectCode} &bull; {sub?.subjectName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                      {exam.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{exam.description}</p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Questions</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {exam.questionsCount || 10} Qs
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {exam.durationMinutes}m
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Marks</span>
                      <span className="font-bold text-slate-800">{exam.totalMarks}</span>
                    </div>
                  </div>

                  {exam.negativeMarking > 0 && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-4">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Negative marking: -{exam.negativeMarking} per wrong answer</span>
                    </div>
                  )}
                </div>

                <div>
                  {pastAttempt && (
                    <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Last Score:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">
                          {pastAttempt.score}/{pastAttempt.totalMarks} ({pastAttempt.percentage}%)
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            pastAttempt.resultStatus === 'passed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {pastAttempt.resultStatus}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setInstructionModalExam(exam);
                        setModalQuestionCount(exam.questionsCount || 10);
                        setModalUseCustomCount(false);
                      }}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{pastAttempt ? 'Retake Exam' : 'Start Examination'}</span>
                    </button>

                    {pastAttempt && (
                      <button
                        onClick={() => {
                          setViewingResultAttemptId(pastAttempt.id);
                          setCurrentView('exam_result');
                        }}
                        className="p-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-slate-700"
                        title="Review Past Answers"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREVIOUS ATTEMPTS & PERFORMANCE HISTORY */}
      {/* ========================================================================= */}
      {userAttempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">My Examination History &amp; Test Results</h3>
              <p className="text-xs text-slate-500">Records of completed online assessments with question-by-question review</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {userAttempts.length} Tests Attempted
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Date Completed</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userAttempts.map((att) => {
                  const exam = examinations.find((e) => e.id === att.examinationId);
                  const isPassed = att.resultStatus === 'passed';

                  return (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {exam?.title || 'BCA Exam'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {att.submittedAt?.split(' ')[0] || 'Today'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {att.score} / {att.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{att.percentage}%</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {att.resultStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setViewingResultAttemptId(att.id);
                            setCurrentView('exam_result');
                          }}
                          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Test Result</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXAM INSTRUCTIONS & QUESTION COUNT CUSTOMIZATION MODAL */}
      {/* ========================================================================= */}
      {instructionModalExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  Examination Setup &amp; Instructions
                </span>
                <h3 className="text-lg font-bold text-slate-900">{instructionModalExam.title}</h3>
              </div>
              <button
                onClick={() => setInstructionModalExam(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 mb-6">
              {/* Question Count Decider in Modal */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    <span>Decide Question Count:</span>
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    {modalUseCustomCount ? `${modalQuestionCount} Questions Selected` : `Standard (${instructionModalExam.questionsCount || 10} Qs)`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModalUseCustomCount(false);
                      setModalQuestionCount(instructionModalExam.questionsCount || 10);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                      !modalUseCustomCount
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Full Paper ({instructionModalExam.questionsCount || 10} Qs)
                  </button>

                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setModalUseCustomCount(true);
                        setModalQuestionCount(num);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                        modalUseCustomCount && modalQuestionCount === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">
                    Total Time
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {modalUseCustomCount ? Math.max(5, Math.round(modalQuestionCount * 1.5)) : instructionModalExam.durationMinutes} Minutes
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">
                    Total Marks
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {modalUseCustomCount ? modalQuestionCount * 2 : instructionModalExam.totalMarks} Marks (Pass: {modalUseCustomCount ? Math.ceil(modalQuestionCount * 0.8) : instructionModalExam.passingMarks})
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Examination Rules:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>The timer will begin as soon as you click "Begin Examination Now".</li>
                  <li>Each question offers 4 multiple-choice options with exactly one correct answer.</li>
                  {instructionModalExam.negativeMarking > 0 ? (
                    <li className="text-amber-800 font-semibold">
                      Negative Marking Active: -{instructionModalExam.negativeMarking} marks deducted for each wrong answer. Unattempted questions carry zero penalty.
                    </li>
                  ) : (
                    <li>No negative marking applies to this evaluation.</li>
                  )}
                  <li>You can mark questions for review and return to them using the Question Palette.</li>
                  <li>Detailed results with answers and academic explanations will be shown immediately after submitting.</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Anti-Cheating Guard is enabled. Please do not switch browser tabs during the examination.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInstructionModalExam(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStartExam(instructionModalExam)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Begin Examination Now ({modalUseCustomCount ? modalQuestionCount : instructionModalExam.questionsCount || 10} Qs)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
