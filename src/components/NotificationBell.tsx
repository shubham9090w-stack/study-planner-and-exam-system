import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  Check,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'exam' | 'material' | 'deadline';
  title: string;
  description: string;
  timestamp: string;
  timeLabel: string;
  isRead: boolean;
  actionView: string;
  actionId?: number;
}

export const NotificationBell: React.FC = () => {
  const {
    currentUser,
    examinations,
    materials,
    tasks,
    subjects,
    setCurrentView,
    setActiveExamId,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'exam' | 'material' | 'deadline'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('bca_read_notifications');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Persist read status
  useEffect(() => {
    localStorage.setItem('bca_read_notifications', JSON.stringify(Array.from(readIds)));
  }, [readIds]);

  // 1. Generate Alerts from Database / State
  const notifications: NotificationItem[] = [];

  // A. Upcoming Exams Alerts
  const upcomingExams = examinations
    .filter((e) => e.status === 'published' && (e.startAt || e.scheduledAt))
    .sort((a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime());

  upcomingExams.slice(0, 3).forEach((exam) => {
    const sub = subjects.find((s) => s.id === exam.subjectId);
    const dateObj = new Date(exam.startAt || exam.scheduledAt || '');
    const diffDays = Math.ceil((dateObj.getTime() - Date.now()) / (1000 * 3600 * 24));

    let timeBadge = `${diffDays} days away`;
    if (diffDays <= 0) timeBadge = 'Live Now / Today';
    else if (diffDays === 1) timeBadge = 'Tomorrow';

    notifications.push({
      id: `exam-${exam.id}`,
      type: 'exam',
      title: `Upcoming Exam: ${exam.title}`,
      description: `${sub?.subjectCode} (${exam.durationMinutes}m) scheduled for ${dateObj.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      )}.`,
      timestamp: exam.startAt || '',
      timeLabel: timeBadge,
      isRead: readIds.has(`exam-${exam.id}`),
      actionView: 'take_exam',
      actionId: exam.id,
    });
  });

  // B. New Study Materials Alerts
  const recentMaterials = [...materials].reverse().slice(0, 3);
  recentMaterials.forEach((mat) => {
    const sub = subjects.find((s) => s.id === mat.subjectId);

    notifications.push({
      id: `mat-${mat.id}`,
      type: 'material',
      title: `New Study Material: ${mat.title}`,
      description: `${sub?.subjectCode} • Category: ${mat.category} (${(mat.fileSizeKb / 1024).toFixed(1)} MB). Available for download.`,
      timestamp: mat.createdAt,
      timeLabel: 'New Resource',
      isRead: readIds.has(`mat-${mat.id}`),
      actionView: 'materials',
      actionId: mat.id,
    });
  });

  // C. Assignment & Study Planner Deadlines
  const userTasks = tasks.filter((t) => t.userId === currentUser?.id && t.status !== 'Completed');
  userTasks.slice(0, 3).forEach((task) => {
    const sub = subjects.find((s) => s.id === task.subjectId);

    notifications.push({
      id: `task-${task.id}`,
      type: 'deadline',
      title: `Study Deadline: ${task.title}`,
      description: `${sub?.subjectCode} • ${task.topic} scheduled for ${task.studyDate} (${task.startTime} - ${task.endTime}). Priority: ${task.priority}.`,
      timestamp: `${task.studyDate} ${task.startTime}`,
      timeLabel: `Due ${task.studyDate}`,
      isRead: readIds.has(`task-${task.id}`),
      actionView: 'planner',
      actionId: task.id,
    });
  });

  // Filter items
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleAction = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);

    if (item.actionView === 'take_exam' && item.actionId) {
      setActiveExamId(item.actionId);
      setCurrentView('take_exam');
    } else {
      setCurrentView(item.actionView);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition focus:outline-none"
        title="View Notifications & Deadlines"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold">Academic Alerts</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-slate-300 hover:text-white font-semibold flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center space-x-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('exam')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] flex items-center space-x-1 ${
                activeFilter === 'exam'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Exams</span>
            </button>
            <button
              onClick={() => setActiveFilter('material')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] flex items-center space-x-1 ${
                activeFilter === 'material'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Notes</span>
            </button>
            <button
              onClick={() => setActiveFilter('deadline')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] flex items-center space-x-1 ${
                activeFilter === 'deadline'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Deadlines</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No active alerts in this category.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                let iconClass = 'bg-blue-100 text-blue-600';
                let IconComponent = Calendar;
                let badgeText = 'EXAM';
                let badgeClass = 'bg-blue-50 text-blue-700';

                if (item.type === 'material') {
                  iconClass = 'bg-emerald-100 text-emerald-600';
                  IconComponent = BookOpen;
                  badgeText = 'NOTES';
                  badgeClass = 'bg-emerald-50 text-emerald-700';
                } else if (item.type === 'deadline') {
                  iconClass = 'bg-amber-100 text-amber-600';
                  IconComponent = Clock;
                  badgeText = 'DEADLINE';
                  badgeClass = 'bg-amber-50 text-amber-700';
                }

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 transition flex items-start space-x-3 group cursor-pointer hover:bg-slate-50 ${
                      !item.isRead ? 'bg-blue-50/40' : 'bg-white'
                    }`}
                    onClick={() => handleAction(item)}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconClass}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${badgeClass}`}
                        >
                          {badgeText}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.timeLabel}
                        </span>
                      </div>

                      <h4
                        className={`text-xs text-slate-900 leading-snug line-clamp-1 ${
                          !item.isRead ? 'font-bold' : 'font-semibold'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-blue-600 font-bold group-hover:underline flex items-center space-x-1">
                          <span>View Details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>

                        {!item.isRead && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                            }}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            title="Mark as read"
                          >
                            Dismiss
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px]">
            <button
              onClick={() => {
                setIsOpen(false);
                setCurrentView('dashboard');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Go to Academic Dashboard &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
