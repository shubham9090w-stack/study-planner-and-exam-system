import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';

export const ExamResultView: React.FC = () => {
  const {
    attempts,
    examinations,
    questions,
    subjects,
    viewingResultAttemptId,
    setActiveExamId,
    setCurrentView,
  } = useApp();

  const [filterReview, setFilterReview] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');

  const attempt = attempts.find((a) => a.id === viewingResultAttemptId) || attempts[0];
  const exam = examinations.find((e) => e.id === attempt?.examinationId);
  const examQuestions = questions.filter((q) => q.examinationId === exam?.id);
  const subject = subjects.find((s) => s.id === exam?.subjectId);

  const isPassed = attempt?.resultStatus === 'passed';

  // Trigger celebration confetti on pass
  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isPassed]);

  if (!attempt || !exam) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-12">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Result Not Found</h3>
        <button
          onClick={() => setCurrentView('exams')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Examinations
        </button>
      </div>
    );
  }

  // Count correct, incorrect, unanswered
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  examQuestions.forEach((q) => {
    const studentAns = attempt.answers[q.id];
    if (!studentAns || studentAns.selectedOptionId === undefined) {
      unattemptedCount++;
    } else if (studentAns.isCorrect) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const displayedQuestions = examQuestions.filter((q) => {
    const studentAns = attempt.answers[q.id];
    const isAnswered = studentAns && studentAns.selectedOptionId !== undefined;
    const isRight = studentAns?.isCorrect;
    if (filterReview === 'correct') return isRight;
    if (filterReview === 'wrong') return isAnswered && !isRight;
    if (filterReview === 'unattempted') return !isAnswered;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Result Hero Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isPassed
            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-800'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {isPassed ? 'Assessment Qualified' : 'Assessment Attempted'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isPassed ? 'Congratulations! You Passed!' : 'Assessment Incomplete / Not Qualified'}
          </h1>
          <p className="text-white/80 text-sm">
            {exam.title} &bull; {subject?.subjectName} ({subject?.subjectCode})
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center min-w-[200px]">
          <span className="text-xs uppercase tracking-wider text-white/70 font-semibold block">
            Net Score Obtained
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold mt-1">
            {attempt.score}{' '}
            <span className="text-lg text-white/70 font-normal">/ {attempt.totalMarks}</span>
          </div>
          <span className="text-xs font-bold text-white/90 block mt-1">
            Percentage: {attempt.percentage}% (Min: {exam.passingMarks} marks)
          </span>
        </div>
      </div>

      {/* KPI Performance Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Correct Answers</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{correctCount}</div>
          <span className="text-[11px] text-slate-400">+{correctCount * 2} marks</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Wrong Answers</span>
          <div className="text-2xl font-extrabold text-red-500 mt-1">{wrongCount}</div>
          <span className="text-[11px] text-slate-400">
            -{exam.negativeMarking * wrongCount} negative deduction
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Unattempted</span>
          <div className="text-2xl font-extrabold text-slate-600 mt-1">{unattemptedCount}</div>
          <span className="text-[11px] text-slate-400">No penalty applied</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-bold text-slate-500 uppercase">Time Elapsed</span>
          <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
            {attempt.timeTakenSeconds ? `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s` : 'N/A'}
          </div>
          <span className="text-[11px] text-slate-400">Limit: {exam.durationMinutes}m</span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveExamId(exam.id);
              setCurrentView('take_exam');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake This Exam</span>
          </button>

          <button
            onClick={() => setCurrentView('exams')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Design Another Custom Test</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentView('planner')}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center space-x-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Revision in Planner</span>
          </button>
          <button
            onClick={() => setCurrentView('exams')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <span>Back to All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detailed Question &amp; Answer Analysis</h3>
            <p className="text-xs text-slate-500">
              Review your chosen answers alongside the verified academic explanations.
            </p>
          </div>

          {/* Review Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterReview('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterReview === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({examQuestions.length})
            </button>
            <button
              onClick={() => setFilterReview('correct')}
              className={`px-3 py-1 rounded-lg transition ${
                filterReview === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterReview('wrong')}
              className={`px-3 py-1 rounded-lg transition ${
                filterReview === 'wrong' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:text-red-900'
              }`}
            >
              Wrong ({wrongCount})
            </button>
            <button
              onClick={() => setFilterReview('unattempted')}
              className={`px-3 py-1 rounded-lg transition ${
                filterReview === 'unattempted' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skipped ({unattemptedCount})
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {displayedQuestions.map((q) => {
            const studentAns = attempt.answers[q.id];
            const correctOpt = q.options.find((o) => o.isCorrect);
            const isAnswered = studentAns && studentAns.selectedOptionId !== undefined;
            const isRight = studentAns?.isCorrect;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition ${
                  !isAnswered
                    ? 'border-slate-200 bg-slate-50/60'
                    : isRight
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      Q{q.displayOrder}
                    </span>
                    {isRight ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Correct (+{q.marks} Marks)</span>
                      </span>
                    ) : isAnswered ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Incorrect (-{q.negativeMarks} Marks)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Unattempted (0 Marks)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900 mb-4">{q.questionText}</p>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => {
                    const wasSelected = studentAns?.selectedOptionId === opt.id;
                    const isCorrectOpt = opt.isCorrect;

                    let optStyle = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrectOpt) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (wasSelected && !isCorrectOpt) {
                      optStyle = 'border-red-400 bg-red-50 text-red-900 line-through';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{opt.letter}.</span>
                          <span>{opt.optionText}</span>
                        </div>
                        {isCorrectOpt && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 uppercase">
                            Correct Answer
                          </span>
                        )}
                        {wasSelected && !isCorrectOpt && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-200 text-red-900 uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Academic Explanation */}
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950">
                  <span className="font-bold block text-blue-800 mb-1 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Academic Explanation:</span>
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
