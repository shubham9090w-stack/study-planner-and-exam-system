import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { StudyPlannerView } from './components/StudyPlannerView';
import { OnlineExamsView } from './components/OnlineExamsView';
import { ExamEngineView } from './components/ExamEngineView';
import { ExamResultView } from './components/ExamResultView';
import { SubjectsMaterialsView } from './components/SubjectsMaterialsView';
import { StudentProfileView } from './components/StudentProfileView';
import { AdminViews } from './components/AdminViews';
import { AdminRouteGuard } from './components/AdminRouteGuard';
import { LoginView, SignupView } from './components/AuthViews';
import { ShieldCheck, GraduationCap, Lock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, currentUser, isAdmin } = useApp();

  // If in the middle of taking an exam, show focused exam layout without top standard navigation
  if (currentView === 'take_exam') {
    return <ExamEngineView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {currentView === 'dashboard' && <StudentDashboard />}
        {currentView === 'planner' && <StudyPlannerView />}
        {currentView === 'exams' && <OnlineExamsView />}
        {currentView === 'exam_result' && <ExamResultView />}
        {currentView === 'materials' && <SubjectsMaterialsView />}
        {(currentView === 'profile' || currentView === 'complete_profile') && (
          <StudentProfileView />
        )}
        {(currentView === 'admin_dashboard' ||
          currentView === 'admin_students' ||
          currentView === 'admin_subjects' ||
          currentView === 'admin_exams' ||
          currentView === 'admin_reports') && (
          <AdminRouteGuard>
            <AdminViews />
          </AdminRouteGuard>
        )}
        {currentView === 'login' && <LoginView />}
        {currentView === 'signup' && <SignupView />}
      </main>

      {/* Clean Academic Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                BCA
              </div>
              <div>
                <p className="font-bold text-slate-200 text-sm">
                  BCA Student Study Planner &amp; Online Examination System
                </p>
                <p className="text-[11px] text-slate-500">
                  Comprehensive Academic Management &amp; Assessment Platform
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="hover:text-blue-400 transition"
              >
                Student Dashboard
              </button>
              <button
                onClick={() => setCurrentView('planner')}
                className="hover:text-blue-400 transition"
              >
                Study Planner
              </button>
              <button
                onClick={() => setCurrentView('exams')}
                className="hover:text-blue-400 transition"
              >
                Online Examinations
              </button>
              <button
                onClick={() => setCurrentView('materials')}
                className="hover:text-blue-400 transition"
              >
                Study Notes &amp; Lab Manuals
              </button>
              {isAdmin && (
                <button
                  onClick={() => setCurrentView('admin_dashboard')}
                  className="hover:text-amber-400 text-slate-500 transition flex items-center space-x-1"
                  title="Administrator Console"
                >
                  <Lock className="w-3 h-3 text-amber-500/70" />
                  <span>Admin Console</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} BCA Student Study Planner &amp; Online Examination System. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>Bachelor of Computer Applications Academic Suite</span>
              </span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Student Portal</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
