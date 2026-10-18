import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Calendar,
  FileText,
  FolderOpen,
  User as UserIcon,
  LogOut,
  BarChart3,
  Users,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { isAuthorizedAdmin } from '../utils/adminAuth';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentProfile,
    logout,
    currentView,
    setCurrentView,
  } = useApp();

  const isAdmin = isAuthorizedAdmin(currentUser);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Academic Status Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300 font-medium">BCA Academic Portal</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            {isAdmin
              ? 'Administrator Console'
              : currentProfile
              ? `${currentProfile.bcaYear} • Semester ${currentProfile.semester} • ${currentProfile.collegeName}`
              : 'Student Portal'}
          </span>
        </div>

        {currentUser && (
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span>Signed in as: <strong className="text-slate-200">{currentUser.fullName}</strong></span>
            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {currentUser.role}
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView(isAdmin ? 'admin_dashboard' : 'dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-extrabold flex items-center justify-center text-lg shadow-sm transition">
              BCA
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg block">
                Study Planner &amp; Exam System
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">
                Bachelor of Computer Applications Academic Suite
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!isAdmin ? (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentView('planner')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'planner'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Study Planner</span>
                </button>

                <button
                  onClick={() => setCurrentView('exams')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'exams' || currentView === 'take_exam' || currentView === 'exam_result'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Online Exams</span>
                </button>

                <button
                  onClick={() => setCurrentView('materials')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'materials'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Subjects &amp; Notes</span>
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'profile' || currentView === 'complete_profile'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Student Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('admin_dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'admin_dashboard'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setCurrentView('admin_students')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'admin_students'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Students</span>
                </button>

                <button
                  onClick={() => setCurrentView('admin_subjects')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'admin_subjects'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Subjects</span>
                </button>

                <button
                  onClick={() => setCurrentView('admin_exams')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'admin_exams'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Exams &amp; Questions</span>
                </button>

                <button
                  onClick={() => setCurrentView('admin_reports')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition ${
                    currentView === 'admin_reports'
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <NotificationBell />

            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => setCurrentView(isAdmin ? 'admin_dashboard' : 'profile')}
                  className="flex items-center space-x-2 text-slate-700 hover:text-blue-600 transition"
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-slate-100"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('signup')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 py-2 bg-slate-50 text-xs font-semibold overflow-x-auto">
        {!isAdmin ? (
          <>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-1 rounded-md ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('planner')}
              className={`px-3 py-1 rounded-md ${currentView === 'planner' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Planner
            </button>
            <button
              onClick={() => setCurrentView('exams')}
              className={`px-3 py-1 rounded-md ${currentView === 'exams' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Exams
            </button>
            <button
              onClick={() => setCurrentView('materials')}
              className={`px-3 py-1 rounded-md ${currentView === 'materials' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Materials
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-3 py-1 rounded-md ${currentView === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              Profile
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentView('admin_dashboard')}
              className={`px-3 py-1 rounded-md ${currentView === 'admin_dashboard' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentView('admin_students')}
              className={`px-3 py-1 rounded-md ${currentView === 'admin_students' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Students
            </button>
            <button
              onClick={() => setCurrentView('admin_subjects')}
              className={`px-3 py-1 rounded-md ${currentView === 'admin_subjects' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Subjects
            </button>
            <button
              onClick={() => setCurrentView('admin_exams')}
              className={`px-3 py-1 rounded-md ${currentView === 'admin_exams' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Exams
            </button>
            <button
              onClick={() => setCurrentView('admin_reports')}
              className={`px-3 py-1 rounded-md ${currentView === 'admin_reports' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              Reports
            </button>
          </>
        )}
      </div>
    </header>
  );
};
