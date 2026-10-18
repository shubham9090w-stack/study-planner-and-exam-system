import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Examination } from '../types';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Award,
  Bell,
} from 'lucide-react';

export const NextExamCountdown: React.FC = () => {
  const {
    examinations,
    subjects,
    setActiveExamId,
    setCurrentView,
    addTask,
  } = useApp();

  const [now, setNow] = useState(Date.now());
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [scheduledReminderNotice, setScheduledReminderNotice] = useState<string | null>(null);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter published examinations that have scheduled dates
  const scheduledExams = examinations
    .filter((e) => e.status === 'published' && (e.startAt || e.scheduledAt))
    .sort((a, b) => {
      const timeA = new Date(a.startAt || a.scheduledAt || 0).getTime();
      const timeB = new Date(b.startAt || b.scheduledAt || 0).getTime();
      return timeA - timeB;
    });

  // Find next upcoming exam (where start time is in the future or active now)
  const nextUpcomingExam =
    scheduledExams.find((e) => {
      const examTime = new Date(e.startAt || e.scheduledAt || 0).getTime();
      return examTime > now;
    }) || scheduledExams[0];

  // Active exam to display in the countdown (default to next upcoming or user-selected)
  const currentExam =
    (selectedExamId ? scheduledExams.find((e) => e.id === selectedExamId) : null) ||
    nextUpcomingExam;

  if (!currentExam) {
    return null;
  }

  const subject = subjects.find((s) => s.id === currentExam.subjectId);
  const examDate = new Date(currentExam.startAt || currentExam.scheduledAt || 0);
  const diffMs = examDate.getTime() - now;

  const isLiveNow = diffMs <= 0 && diffMs > -(currentExam.durationMinutes * 60 * 1000);
  const isPast = diffMs <= -(currentExam.durationMinutes * 60 * 1000);

  // Calculate time components
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const handleLaunchExam = () => {
    setActiveExamId(currentExam.id);
    setCurrentView('take_exam');
  };

  const handleScheduleStudyTask = () => {
    const targetDate = new Date();
    // Schedule for today or tomorrow
    const dateStr = targetDate.toISOString().split('T')[0];

    addTask({
      subjectId: currentExam.subjectId,
      title: `Final Revision: ${currentExam.title}`,
      topic: `${subject?.subjectName || 'BCA'} Exam Preparation`,
      description: `Comprehensive revision for upcoming scheduled assessment on ${examDate.toLocaleDateString()}.`,
      studyDate: dateStr,
      startTime: '18:00',
      endTime: '19:30',
      priority: 'High',
      status: 'Pending',
    });

    setScheduledReminderNotice(
      `Study task for "${currentExam.title}" scheduled in your Study Planner!`
    );
    setTimeout(() => setScheduledReminderNotice(null), 4000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/60 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Next Scheduled Examination Countdown</span>
            </span>
          </div>

          {/* If multiple exams are scheduled, provide a quick selector */}
          {scheduledExams.length > 1 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 text-[11px] hidden md:inline">Other scheduled exams:</span>
              <select
                value={currentExam.id}
                onChange={(e) => setSelectedExamId(Number(e.target.value))}
                className="bg-slate-800/90 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {scheduledExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (
                    {new Date(ex.startAt || ex.scheduledAt || 0).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    )
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Exam Title & Subject Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                {subject?.subjectCode || 'BCA'}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {subject?.subjectName}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {currentExam.examCategory}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              {currentExam.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center space-x-1.5 text-blue-200">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  <strong>Date:</strong>{' '}
                  {examDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {examDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>

              <span className="text-slate-500">&bull;</span>
              <span>
                <strong>Duration:</strong> {currentExam.durationMinutes} Mins
              </span>
              <span className="text-slate-500">&bull;</span>
              <span>
                <strong>Marks:</strong> {currentExam.totalMarks} (Pass: {currentExam.passingMarks})
              </span>
              {currentExam.negativeMarking > 0 && (
                <>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-amber-300 font-semibold">
                    Negative: -{currentExam.negativeMarking}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Live Countdown Display Box */}
          <div className="shrink-0">
            {isLiveNow ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <div className="inline-flex items-center space-x-2 bg-emerald-500 text-slate-950 font-extrabold px-3 py-1 rounded-full text-xs uppercase animate-pulse">
                  <span>Exam is Active &amp; Live Now</span>
                </div>
                <p className="text-xs text-emerald-200 max-w-xs">
                  The examination window is currently open. You can begin answering questions now!
                </p>
              </div>
            ) : isPast ? (
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-center">
                <span className="text-xs font-bold text-slate-400 uppercase block">
                  Scheduled Time Concluded
                </span>
                <p className="text-xs text-slate-300 mt-1">Available for on-demand practice testing</p>
              </div>
            ) : (
              <div className="bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-blue-800/40 shadow-inner flex items-center space-x-2 sm:space-x-3 text-center">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-900/60 border border-blue-500/30 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold text-white shadow-md">
                    {formatDigit(days)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                    Days
                  </span>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-blue-400 -mt-5">:</span>

                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-900/60 border border-blue-500/30 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold text-white shadow-md">
                    {formatDigit(hours)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                    Hours
                  </span>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-blue-400 -mt-5">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-900/60 border border-blue-500/30 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold text-white shadow-md">
                    {formatDigit(minutes)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                    Mins
                  </span>
                </div>

                <span className="text-xl sm:text-2xl font-bold text-blue-400 -mt-5">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-blue-950 border border-amber-400/50 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold text-amber-300 shadow-md">
                    {formatDigit(seconds)}
                  </div>
                  <span className="text-[10px] font-bold text-amber-300/80 uppercase tracking-wider mt-1.5">
                    Secs
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {scheduledReminderNotice && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{scheduledReminderNotice}</span>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="pt-4 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLaunchExam}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition flex items-center space-x-2 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLiveNow ? 'Enter Live Exam' : 'Preview / Start Practice Test'}</span>
            </button>

            <button
              onClick={handleScheduleStudyTask}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
              title="Add revision slot to your daily study timetable"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Plan Revision Session</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentView('materials')}
            className="text-xs font-semibold text-blue-300 hover:text-white flex items-center space-x-1 underline-offset-4 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View {subject?.subjectCode || 'BCA'} Notes &amp; Solved Papers &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
