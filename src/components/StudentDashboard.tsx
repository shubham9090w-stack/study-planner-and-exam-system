import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Play,
  PlusCircle,
  Target,
  Sparkles,
  User,
  GraduationCap,
} from 'lucide-react';
import { NextExamCountdown } from './NextExamCountdown';
import { StudyProgressChart } from './StudyProgressChart';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    tasks,
    examinations,
    subjects,
    attempts,
    setCurrentView,
    setActiveExamId,
    toggleTaskStatus,
  } = useApp();

  const userTasks = tasks.filter((t) => t.userId === currentUser?.id);
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;

  const userAttempts = attempts.filter((a) => a.userId === currentUser?.id);
  const avgScore =
    userAttempts.length > 0
      ? (
          userAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) /
          userAttempts.length
        ).toFixed(1)
      : null;

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = userTasks.filter((t) => t.studyDate === todayStr);

  // Available Exams matching student semester/year
  const studentYear = currentProfile?.bcaYear || 'Second Year';
  const availableExams = examinations.filter((e) => e.status === 'published');

  // Calculate target exam countdown
  let daysToTarget = null;
  if (currentProfile?.targetExamDate) {
    const target = new Date(currentProfile.targetExamDate);
    const diff = target.getTime() - new Date().getTime();
    daysToTarget = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Profile Status Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/30 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>BCA Academic Success Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser ? `Welcome back, ${currentUser.fullName}!` : 'Welcome to BCA Academic Planner'}
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl">
              {currentUser ? (
                <>
                  {currentProfile?.collegeName || 'College of Computer Applications'} &bull;{' '}
                  <span className="font-semibold">{currentProfile?.bcaYear || 'BCA'}</span> (Semester{' '}
                  {currentProfile?.semester || 1}) &bull; Roll No: {currentProfile?.rollNumber || 'N/A'}
                </>
              ) : (
                'Comprehensive academic management platform: organize daily BCA study timetables, practice timed university examinations, and download syllabus resources.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!currentUser ? (
              <>
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-5 py-2.5 bg-white text-blue-800 font-bold rounded-xl text-sm shadow hover:bg-blue-50 transition flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Student Sign In</span>
                </button>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="px-5 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-xl text-sm border border-blue-400/40 shadow transition flex items-center space-x-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('planner')}
                  className="px-5 py-2.5 bg-white text-blue-800 font-bold rounded-xl text-sm shadow hover:bg-blue-50 transition flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Study Planner</span>
                </button>
                <button
                  onClick={() => setCurrentView('exams')}
                  className="px-5 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white font-bold rounded-xl text-sm border border-blue-400/40 shadow transition flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Take Online Exam</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Target Countdown Pill */}
        {daysToTarget !== null && (
          <div className="mt-6 pt-4 border-t border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-300" />
              <span>
                Target Examination:{' '}
                <strong className="text-white">
                  {new Date(currentProfile?.targetExamDate || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </div>
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-0.5 rounded-full text-xs">
              {daysToTarget} Days Remaining
            </span>
          </div>
        )}
      </div>

      {/* Next Scheduled Exam Countdown Timer */}
      <NextExamCountdown />

      {/* 4 Academic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Study Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{totalTasks}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">{completedTasks} completed</span>
            <span>&bull;</span>
            <span>{pendingTasks} remaining</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{pendingTasks}</h3>
          <p className="text-xs text-slate-500 mt-1">Requires your attention today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exams Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-2">
            {userAttempts.length}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {userAttempts.filter((a) => a.resultStatus === 'passed').length} Passed Assessments
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {avgScore !== null ? `${avgScore}%` : 'N/A'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Across all examination evaluations</p>
        </div>
      </div>

      {/* Study Progress Visualization: Radar Chart & Progress Rings */}
      <StudyProgressChart />

      {/* Main Content Layout: Today's Study Schedule & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Today's Schedule & Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Today's Study Timetable</h3>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setCurrentView('planner')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No study tasks planned for today</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Stay consistent with your daily targets. Add a chapter or topic in the Study Planner.
                </p>
                <button
                  onClick={() => setCurrentView('planner')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-blue-700 transition"
                >
                  + Add Today's Study Topic
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((t) => {
                  const sub = subjects.find((s) => s.id === t.subjectId);
                  const isDone = t.status === 'Completed';

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-xl border transition flex items-center justify-between ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {sub?.subjectCode || 'BCA'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                t.priority === 'High'
                                  ? 'bg-red-50 text-red-700'
                                  : t.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {t.priority} Priority
                            </span>
                          </div>
                          <h4
                            className={`font-bold text-sm text-slate-900 mt-1 ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{t.topic}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-slate-700 block">
                          {t.startTime} - {t.endTime}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            isDone ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Progress Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Weekly Academic Completion</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Task Completion Ratio</span>
                  <span>{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Target Hours</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {currentProfile?.dailyStudyHours || 3.0} hrs/day
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Pref. Study Time</span>
                  <span className="font-bold text-slate-800 text-sm truncate block">
                    {currentProfile?.preferredStudyTime?.split(' ')[0] || 'Evening'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500 block">Session Length</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {currentProfile?.preferredSessionDuration || 45} mins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Online Exams & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recommended Exams</h3>
              <button
                onClick={() => setCurrentView('exams')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All &rarr;
              </button>
            </div>

            {/* Quick Custom Paper Generator Banner */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="font-extrabold text-white flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Custom Test Paper</span>
                </span>
                <span className="text-[11px] text-blue-200 block mt-0.5">Pick any subject &amp; decide question count (e.g. 10 Qs)</span>
              </div>
              <button
                onClick={() => setCurrentView('exams')}
                className="px-2.5 py-1 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition shrink-0 ml-2 shadow-xs"
              >
                Create &rarr;
              </button>
            </div>

            <div className="space-y-3.5">
              {availableExams.slice(0, 3).map((exam) => {
                const sub = subjects.find((s) => s.id === exam.subjectId);

                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {exam.examCategory}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {exam.durationMinutes} mins
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {sub?.subjectName} &bull; {exam.totalMarks} Marks
                    </p>

                    <button
                      onClick={() => {
                        setActiveExamId(exam.id);
                        setCurrentView('take_exam');
                      }}
                      className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Practice Test</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Materials Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm mb-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>BCA Study Repository</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Access handwritten semester lecture notes, previous 5-year solved papers, and lab manuals.
            </p>
            <button
              onClick={() => setCurrentView('materials')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Browse Notes &amp; Lab Manuals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
