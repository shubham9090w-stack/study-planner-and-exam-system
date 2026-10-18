import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudyTask, PriorityLevel, TaskStatus } from '../types';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Bell,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const StudyPlannerView: React.FC = () => {
  const {
    currentUser,
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    setCurrentView,
  } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Study Planner Sign In Required</h2>
          <p className="text-sm text-slate-500">
            Sign in or create a student account to schedule custom study sessions, set exam deadlines, and track topic completions.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setCurrentView('login')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition"
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentView('signup')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all'>('daily');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<number>(subjects[0]?.id || 1);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');

  // Notification status
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const userTasks = tasks.filter((t) => t.userId === currentUser?.id);

  // Filtered tasks
  const filteredTasks = userTasks.filter((t) => {
    if (filterSubject !== 'all' && t.subjectId !== Number(filterSubject)) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const openAddModal = (defaultDate?: string) => {
    setEditingTask(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || 1);
    setTopic('');
    setDescription('');
    setStudyDate(defaultDate || new Date().toISOString().split('T')[0]);
    setStartTime('18:00');
    setEndTime('19:30');
    setPriority('Medium');
    setStatus('Pending');
    setIsModalOpen(true);
  };

  const openEditModal = (task: StudyTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setSubjectId(task.subjectId);
    setTopic(task.topic);
    setDescription(task.description);
    setStudyDate(task.studyDate);
    setStartTime(task.startTime);
    setEndTime(task.endTime);
    setPriority(task.priority);
    setStatus(task.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title,
        subjectId,
        topic,
        description,
        studyDate,
        startTime,
        endTime,
        priority,
        status,
      });
    } else {
      addTask({
        subjectId,
        title,
        topic,
        description,
        studyDate,
        startTime,
        endTime,
        priority,
        status,
      });
    }
    setIsModalOpen(false);
  };

  // Notification helper
  const handleTestReminder = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('BCA Study Planner Reminder', {
            body: 'Upcoming Task: SQL Joins & Correlated Subqueries starting in 15 minutes!',
            icon: '/favicon.ico',
          });
          setNotificationMsg('Browser reminder sent! (Enabled for upcoming study sessions)');
        } else {
          setNotificationMsg('Browser notifications are blocked. In-website alerts will be used.');
        }
      });
    } else {
      setNotificationMsg('Browser notifications not supported. In-app alerts will be displayed.');
    }
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Weekly Planner Date Calculation (Monday to Sunday)
  const getWeekDates = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // Monday
    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(curr.setDate(first + i));
      week.push(nextDay.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Study Planner</h1>
          <p className="text-sm text-slate-500">
            Organize daily revision, track BCA timetable hours, and maintain study discipline.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTestReminder}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
            title="Enable study reminders"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Study Reminders</span>
          </button>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Study Task</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-blue-500 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'daily'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Daily Timetable</span>
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'weekly'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>All Tasks Manager ({userTasks.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY TIMETABLE */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Today's Academic Schedule</h3>
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
                onClick={() => openAddModal(todayStr)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
              >
                + Add Slot for Today
              </button>
            </div>

            {userTasks.filter((t) => t.studyDate === todayStr).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No study tasks planned for today</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Consistency is key for BCA subjects. Add a 45-minute revision block for DBMS, C++, or Data Structures.
                </p>
                <button
                  onClick={() => openAddModal(todayStr)}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  Schedule Today's Session
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6 my-4">
                {userTasks
                  .filter((t) => t.studyDate === todayStr)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((task) => {
                    const sub = subjects.find((s) => s.id === task.subjectId);
                    const isDone = task.status === 'Completed';

                    return (
                      <div key={task.id} className="relative group">
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                            isDone ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                        ></div>

                        <div
                          className={`p-5 rounded-2xl border transition ${
                            isDone
                              ? 'bg-slate-50 border-slate-200 opacity-80'
                              : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {sub?.subjectCode || 'BCA'}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  {sub?.subjectName}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    task.priority === 'High'
                                      ? 'bg-red-50 text-red-700'
                                      : task.priority === 'Medium'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {task.priority} Priority
                                </span>
                              </div>
                              <h4
                                className={`text-base font-bold text-slate-900 mt-2 ${
                                  isDone ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {task.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                Chapter / Topic: {task.topic}
                              </p>
                              {task.description && (
                                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <span className="text-sm font-mono font-bold text-slate-800">
                                {task.startTime} - {task.endTime}
                              </span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => toggleTaskStatus(task.id)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                                </button>
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY SCHEDULE */}
      {activeTab === 'weekly' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">7-Day Study Grid</h3>
              <p className="text-xs text-slate-500">Plan and balance your subject workload for the week</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Weekly Overview
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((dateStr, i) => {
              const dayDate = new Date(dateStr);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dayDate.getDate();
              const isToday = dateStr === todayStr;
              const dayTasks = userTasks.filter((t) => t.studyDate === dateStr);

              return (
                <div
                  key={dateStr}
                  className={`rounded-xl border p-3 flex flex-col justify-between min-h-[220px] transition ${
                    isToday
                      ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="text-xs font-bold text-slate-700">{dayName}</span>
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-blue-600 text-white' : 'text-slate-500'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {dayTasks.map((t) => {
                        const sub = subjects.find((s) => s.id === t.subjectId);
                        const isDone = t.status === 'Completed';

                        return (
                          <div
                            key={t.id}
                            onClick={() => openEditModal(t)}
                            className={`p-2 rounded-lg text-[11px] cursor-pointer transition border ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through'
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-400'
                            }`}
                          >
                            <span className="font-bold block truncate">
                              {sub?.subjectCode}: {t.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {t.startTime} - {t.endTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => openAddModal(dateStr)}
                    className="mt-3 w-full py-1 text-center text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-200"
                  >
                    + Add Task
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ALL TASKS MANAGER & FILTERS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5 text-slate-600 font-bold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subjectCode} - {s.subjectName}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="text-slate-500 font-medium">
              Showing <strong>{filteredTasks.length}</strong> tasks
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Subject &amp; Title</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No tasks matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const sub = subjects.find((s) => s.id === task.subjectId);
                      const isDone = task.status === 'Completed';

                      return (
                        <tr key={task.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 hover:border-blue-500'
                              }`}
                            >
                              {isDone && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 mr-1.5">
                              {sub?.subjectCode}
                            </span>
                            <span className={isDone ? 'line-through text-slate-400' : ''}>
                              {task.title}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{task.topic}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {task.studyDate} &bull; {task.startTime}-{task.endTime}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                task.priority === 'High'
                                  ? 'bg-red-50 text-red-700'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(task)}
                                className="p-1 text-slate-400 hover:text-blue-600"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 text-slate-400 hover:text-red-600"
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
        </div>
      )}

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Edit Study Task' : 'Add New Study Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SQL Queries & ER Diagram Revision"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Subject *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.subjectCode} - {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Chapter / Topic *</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Joins & Subqueries"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional revision notes or formulas to remember..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Study Date *</label>
                  <input
                    type="date"
                    required
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
