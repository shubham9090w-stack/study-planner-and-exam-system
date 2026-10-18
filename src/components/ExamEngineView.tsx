import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Send,
  HelpCircle,
} from 'lucide-react';

export const ExamEngineView: React.FC = () => {
  const {
    examinations,
    questions,
    subjects,
    activeExamId,
    submitExamAttempt,
    setViewingResultAttemptId,
    setCurrentView,
  } = useApp();

  const exam = examinations.find((e) => e.id === activeExamId);
  const examQuestions = questions
    .filter((q) => q.examinationId === activeExamId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, { selectedOptionId?: number; isMarkedForReview: boolean }>
  >({});
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(new Set([0]));
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(
    (exam?.durationMinutes || 20) * 60
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setTabWarning(`Warning #${next}: Tab switching is monitored. Please keep focus on the examination.`);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!exam || examQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200 mt-12 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No Questions Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          This examination does not contain any questions yet. Contact your administrator or choose another exam.
        </p>
        <button
          onClick={() => setCurrentView('exams')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Examinations
        </button>
      </div>
    );
  }

  const currentQ = examQuestions[currentIndex];
  const subject = subjects.find((s) => s.id === exam.subjectId);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: optionId,
        isMarkedForReview: prev[currentQ.id]?.isMarkedForReview || false,
      },
    }));
  };

  const handleClearOption = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      if (copy[currentQ.id]) {
        delete copy[currentQ.id].selectedOptionId;
      }
      return copy;
    });
  };

  const handleToggleReview = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOptionId: prev[currentQ.id]?.selectedOptionId,
        isMarkedForReview: !prev[currentQ.id]?.isMarkedForReview,
      },
    }));
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setVisitedIndices((prev) => new Set(prev).add(index));
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const handleFinalSubmit = () => {
    const totalTimeTaken = exam.durationMinutes * 60 - timeLeftSeconds;
    const attemptId = submitExamAttempt(exam.id, answers, totalTimeTaken);
    setViewingResultAttemptId(attemptId);
    setCurrentView('exam_result');
  };

  // Status statistics for question palette
  const answeredCount = examQuestions.filter(
    (q) => answers[q.id]?.selectedOptionId !== undefined
  ).length;
  const reviewCount = examQuestions.filter((q) => answers[q.id]?.isMarkedForReview).length;
  const unansweredCount = examQuestions.length - answeredCount;

  const isLowTime = timeLeftSeconds <= 120; // 2 minutes

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Fixed Header with Clock & Submit */}
      <header className="bg-slate-900 text-white px-4 sm:px-8 py-3.5 sticky top-0 z-50 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 uppercase">
                {exam.examCategory}
              </span>
              <span className="text-xs text-slate-400">
                {subject?.subjectCode} &bull; {exam.totalMarks} Marks
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {exam.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Countdown Box */}
            <div
              className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition ${
                isLowTime
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Finish &amp; Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Warning Toast */}
      {tabWarning && (
        <div className="bg-amber-500 text-slate-950 text-xs py-2 px-4 text-center font-bold flex items-center justify-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{tabWarning}</span>
          <button
            onClick={() => setTabWarning(null)}
            className="ml-3 underline text-[11px] font-normal"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* Left 3 Columns: Active Question Card */}
        <main className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            {/* Question Info Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Question {currentIndex + 1} of {examQuestions.length}
                </span>
                {answers[currentQ.id]?.isMarkedForReview && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center space-x-1">
                    <Flag className="w-3 h-3 fill-current" />
                    <span>Review Pending</span>
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Correct: <span className="text-emerald-600 font-bold">+{currentQ.marks}</span>{' '}
                &bull; Wrong: <span className="text-red-500 font-bold">-{currentQ.negativeMarks}</span>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
              {currentQ.questionText}
            </h3>

            {/* 4 MCQ Radio Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id]?.selectedOptionId === opt.id;

                return (
                  <label
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question_${currentQ.id}`}
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <span className="w-6 font-bold text-slate-500 text-sm">{opt.letter}.</span>
                    <span className="text-sm leading-snug">{opt.optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === examQuestions.length - 1}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition flex items-center space-x-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearOption}
                className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 hover:underline"
              >
                Clear Selection
              </button>
              <button
                onClick={handleToggleReview}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 ${
                  answers[currentQ.id]?.isMarkedForReview
                    ? 'border-amber-400 bg-amber-100 text-amber-900'
                    : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span>
                  {answers[currentQ.id]?.isMarkedForReview
                    ? 'Remove Review Mark'
                    : 'Mark for Review'}
                </span>
              </button>
            </div>
          </div>
        </main>

        {/* Right 1 Column: Question Palette */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Question Navigation</h4>
            <p className="text-[11px] text-slate-400 mb-4">Click any number to jump to question</p>

            {/* Grid of numbers */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {examQuestions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = answers[q.id]?.selectedOptionId !== undefined;
                const isRev = answers[q.id]?.isMarkedForReview;
                const isVisited = visitedIndices.has(idx);

                let badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                if (isRev) {
                  badgeClass = 'bg-amber-400 text-slate-950 font-bold border border-amber-500';
                } else if (isAns) {
                  badgeClass = 'bg-emerald-500 text-white font-bold border border-emerald-600';
                } else if (isVisited) {
                  badgeClass = 'bg-rose-100 text-rose-700 border border-rose-300 font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`h-9 rounded-xl text-xs flex items-center justify-center transition ${badgeClass} ${
                      isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-[11px] text-slate-600 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 mr-2"></span>
                  Answered
                </span>
                <span className="font-bold text-slate-900">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-md bg-amber-400 mr-2"></span>
                  Marked for Review
                </span>
                <span className="font-bold text-slate-900">{reviewCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 mr-2"></span>
                  Visited (Not Answered)
                </span>
                <span className="font-bold text-slate-900">
                  {Array.from(visitedIndices).filter(
                    (idx) => answers[examQuestions[idx]?.id]?.selectedOptionId === undefined
                  ).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 mr-2"></span>
                  Not Visited
                </span>
                <span className="font-bold text-slate-900">
                  {examQuestions.length - visitedIndices.size}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Entire Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* CONFIRMATION SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Submit Examination?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Once submitted, your answers will be evaluated on the server.
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-xl text-xs grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Answered
                </span>
                <span className="text-base font-extrabold text-emerald-600">{answeredCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Under Review
                </span>
                <span className="text-base font-extrabold text-amber-600">{reviewCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[10px]">
                  Unanswered
                </span>
                <span className="text-base font-extrabold text-red-500">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Reviewing
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Yes, Submit Examination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
