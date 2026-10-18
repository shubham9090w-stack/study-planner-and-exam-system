import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  BookOpen,
  PieChart,
  Activity,
  Plus,
  Play,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const StudyProgressChart: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    subjects,
    tasks,
    attempts,
    examinations,
    setCurrentView,
    setActiveExamId,
  } = useApp();

  const [chartType, setChartType] = useState<'radar' | 'rings'>('radar');
  const [metricType, setMetricType] = useState<'combined' | 'tasks' | 'exams'>('combined');
  const [hoveredSubjectId, setHoveredSubjectId] = useState<number | null>(null);

  // Student's tasks and exam attempts
  const userTasks = tasks.filter((t) => t.userId === currentUser?.id);
  const userAttempts = attempts.filter((a) => a.userId === currentUser?.id);

  // Filter relevant subjects for student's year/semester (or top 5-6 active subjects)
  const studentYear = currentProfile?.bcaYear || 'Second Year';
  const relevantSubjects = subjects
    .filter((s) => s.bcaYear === studentYear || s.semester <= (currentProfile?.semester || 3))
    .slice(0, 6);

  // Calculate subject-level statistics
  const subjectStats = relevantSubjects.map((sub, index) => {
    const subTasks = userTasks.filter((t) => t.subjectId === sub.id);
    const completedTasks = subTasks.filter((t) => t.status === 'Completed').length;
    const taskRatio = subTasks.length > 0 ? (completedTasks / subTasks.length) * 100 : completedTasks > 0 ? 100 : 35; // baseline reasonable estimation

    // Exam attempts for this subject
    const subExams = examinations.filter((e) => e.subjectId === sub.id);
    const subAttempts = userAttempts.filter((a) =>
      subExams.some((e) => e.id === a.examinationId)
    );
    const examAvg =
      subAttempts.length > 0
        ? subAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / subAttempts.length
        : null;

    let progressValue = 0;
    if (metricType === 'tasks') {
      progressValue = Math.min(100, Math.round(taskRatio));
    } else if (metricType === 'exams') {
      progressValue = examAvg !== null ? Math.round(examAvg) : 50;
    } else {
      // Combined: 60% task completion + 40% exam performance
      const examPart = examAvg !== null ? examAvg : 65;
      progressValue = Math.min(100, Math.round(taskRatio * 0.6 + examPart * 0.4));
    }

    const colors = [
      { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)', bg: 'bg-blue-500', text: 'text-blue-600' },
      { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)', bg: 'bg-emerald-500', text: 'text-emerald-600' },
      { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.2)', bg: 'bg-purple-500', text: 'text-purple-600' },
      { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)', bg: 'bg-amber-500', text: 'text-amber-600' },
      { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.2)', bg: 'bg-cyan-500', text: 'text-cyan-600' },
      { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.2)', bg: 'bg-pink-500', text: 'text-pink-600' },
    ];

    const color = colors[index % colors.length];

    return {
      subject: sub,
      totalTasks: subTasks.length,
      completedTasks,
      taskRatio: Math.round(taskRatio),
      examAvg: examAvg !== null ? Math.round(examAvg) : null,
      progressValue: Math.max(15, progressValue), // min visually appealing anchor
      color,
    };
  });

  const overallAvg =
    subjectStats.length > 0
      ? Math.round(
          subjectStats.reduce((acc, curr) => acc + curr.progressValue, 0) / subjectStats.length
        )
      : 0;

  // Active highlighted subject details
  const activeSubjectStat =
    hoveredSubjectId !== null
      ? subjectStats.find((s) => s.subject.id === hoveredSubjectId) || subjectStats[0]
      : subjectStats[0];

  // RADAR CHART MATH
  const centerX = 160;
  const centerY = 160;
  const radius = 110;
  const numAxes = subjectStats.length || 6;
  const angleStep = (2 * Math.PI) / numAxes;

  // Concentric polygon levels: 20%, 40%, 60%, 80%, 100%
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueFactor: number) => {
    // Start from top (- PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const x = centerX + radius * valueFactor * Math.cos(angle);
    const y = centerY + radius * valueFactor * Math.sin(angle);
    return { x, y, angle };
  };

  // Generate data polygon points
  const polygonPoints = subjectStats
    .map((stat, i) => {
      const factor = stat.progressValue / 100;
      const { x, y } = getCoordinates(i, factor);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
              Academic Analytics
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs font-medium text-slate-500">
              {currentProfile?.bcaYear || 'BCA'} (Sem {currentProfile?.semester || 3})
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Subject &amp; Topic Progress Visualization
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time mastery tracking calculated from completed study planner tasks and online exam scores.
          </p>
        </div>

        {/* Toggle View & Metric Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Radar vs Rings Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setChartType('radar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                chartType === 'radar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Radar Web</span>
            </button>
            <button
              onClick={() => setChartType('rings')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                chartType === 'rings'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Progress Rings</span>
            </button>
          </div>

          {/* Metric Selector */}
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as any)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="combined">Combined Subject Mastery</option>
            <option value="tasks">Planner Tasks Completed</option>
            <option value="exams">Exam Test Scores (%)</option>
          </select>
        </div>
      </div>

      {/* Main Chart + Subject Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Interactive Chart SVG (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 relative">
          {chartType === 'radar' ? (
            /* =================== RADAR WEB CHART =================== */
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric Reference Rings */}
                {levels.map((level, lvlIdx) => {
                  const points = Array.from({ length: numAxes })
                    .map((_, i) => {
                      const { x, y } = getCoordinates(i, level);
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <g key={lvlIdx}>
                      <polygon
                        points={points}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray={lvlIdx === levels.length - 1 ? 'none' : '2,2'}
                      />
                      {/* Percent badge on the vertical axis */}
                      <text
                        x={centerX + 4}
                        y={centerY - radius * level + 3}
                        fontSize="8"
                        fill="#94a3b8"
                        fontFamily="sans-serif"
                      >
                        {Math.round(level * 100)}%
                      </text>
                    </g>
                  );
                })}

                {/* Spoke lines from center */}
                {Array.from({ length: numAxes }).map((_, i) => {
                  const { x, y } = getCoordinates(i, 1.0);
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Active Data Area Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="url(#radarFill)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  className="transition-all duration-500 ease-out"
                />

                {/* Subject Vertex Data Nodes */}
                {subjectStats.map((stat, i) => {
                  const factor = stat.progressValue / 100;
                  const { x, y } = getCoordinates(i, factor);
                  const isHovered = hoveredSubjectId === stat.subject.id;

                  // Label Position (pushed slightly further out)
                  const labelCoord = getCoordinates(i, 1.22);

                  return (
                    <g
                      key={stat.subject.id}
                      onMouseEnter={() => setHoveredSubjectId(stat.subject.id)}
                      onMouseLeave={() => setHoveredSubjectId(null)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Pulse ring if hovered */}
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill={stat.color.stroke}
                          fillOpacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      {/* Vertex Dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4.5}
                        fill={stat.color.stroke}
                        stroke="#ffffff"
                        strokeWidth="2"
                        filter="url(#glow)"
                        className="transition-all duration-300"
                      />

                      {/* Outer Label text */}
                      <text
                        x={labelCoord.x}
                        y={labelCoord.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9.5"
                        fontWeight={isHovered ? 'bold' : '600'}
                        fill={isHovered ? '#1e293b' : '#64748b'}
                        className="transition-all duration-200"
                      >
                        {stat.subject.subjectCode.replace('BCA-', '')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            /* =================== PROGRESS RINGS (CONCENTRIC) =================== */
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 320 320" className="w-full h-full transform -rotate-90">
                {subjectStats.map((stat, idx) => {
                  // Concentric radiuses from outer to inner
                  const r = 120 - idx * 16;
                  const circumference = 2 * Math.PI * r;
                  const strokeDashoffset =
                    circumference - (stat.progressValue / 100) * circumference;
                  const isHovered = hoveredSubjectId === stat.subject.id;

                  return (
                    <g
                      key={stat.subject.id}
                      onMouseEnter={() => setHoveredSubjectId(stat.subject.id)}
                      onMouseLeave={() => setHoveredSubjectId(null)}
                      className="cursor-pointer"
                    >
                      {/* Background track circle */}
                      <circle
                        cx="160"
                        cy="160"
                        r={r}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="9"
                      />
                      {/* Active progress ring */}
                      <circle
                        cx="160"
                        cy="160"
                        r={r}
                        fill="none"
                        stroke={stat.color.stroke}
                        strokeWidth={isHovered ? '11' : '9'}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Ring Metric Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeSubjectStat ? `${activeSubjectStat.progressValue}%` : `${overallAvg}%`}
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  {activeSubjectStat ? activeSubjectStat.subject.subjectCode : 'Overall Mastery'}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">
                  {activeSubjectStat?.progressValue && activeSubjectStat.progressValue >= 75
                    ? 'Mastered'
                    : 'In Progress'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Center Caption */}
          <div className="mt-3 text-center text-xs text-slate-500">
            <span>Hover on any subject axis or node to inspect details</span>
          </div>
        </div>

        {/* Right Side: Subject Mastery Breakdown Cards (7 Columns) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subject Mastery Breakdown ({subjectStats.length} Subjects)
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Average Mastery: <strong className="text-blue-600">{overallAvg}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectStats.map((stat) => {
              const isHovered = hoveredSubjectId === stat.subject.id;
              const isHigh = stat.progressValue >= 75;
              const isMedium = stat.progressValue >= 50;

              return (
                <div
                  key={stat.subject.id}
                  onMouseEnter={() => setHoveredSubjectId(stat.subject.id)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                  className={`p-4 rounded-2xl border transition ${
                    isHovered
                      ? 'border-blue-400 bg-blue-50/40 shadow-xs ring-1 ring-blue-400/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stat.color.stroke }}
                      ></span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {stat.subject.subjectCode}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        isHigh
                          ? 'bg-emerald-100 text-emerald-800'
                          : isMedium
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {stat.progressValue}% {isHigh ? 'Mastered' : isMedium ? 'Good' : 'Focus'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 truncate mb-1">
                    {stat.subject.subjectName}
                  </h4>

                  {/* Dual metric subtext */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>
                      Tasks: <strong>{stat.completedTasks}/{stat.totalTasks}</strong> done
                    </span>
                    <span>
                      Exam Avg:{' '}
                      <strong className={stat.examAvg ? 'text-blue-600' : 'text-slate-400'}>
                        {stat.examAvg !== null ? `${stat.examAvg}%` : 'Pending'}
                      </strong>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stat.progressValue}%`,
                        backgroundColor: stat.color.stroke,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Academic Tip */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600 mt-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Completing tasks in the <strong>Study Planner</strong> and scoring &ge;60% in <strong>Online Exams</strong> elevates your subject radar polygon.
              </span>
            </div>
            <button
              onClick={() => setCurrentView('planner')}
              className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-800 font-bold text-xs shrink-0 ml-2"
            >
              + Add Topic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
