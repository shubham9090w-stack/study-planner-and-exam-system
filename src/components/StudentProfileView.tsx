import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BcaYear } from '../types';
import {
  User,
  GraduationCap,
  Clock,
  Calendar,
  Target,
  CheckCircle2,
  Lock,
  Save,
  BookOpen,
} from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { currentUser, currentProfile, updateProfile, setCurrentView } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Student Profile Sign In Required</h2>
          <p className="text-sm text-slate-500">
            Sign in or create a student account to manage your university details, track semester preferences, and set exam targets.
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

  const [mobile, setMobile] = useState(currentProfile?.mobile || '');
  const [collegeName, setCollegeName] = useState(currentProfile?.collegeName || '');
  const [universityName, setUniversityName] = useState(currentProfile?.universityName || '');
  const [bcaYear, setBcaYear] = useState<BcaYear>(currentProfile?.bcaYear || 'Second Year');
  const [semester, setSemester] = useState(currentProfile?.semester || 3);
  const [rollNumber, setRollNumber] = useState(currentProfile?.rollNumber || '');
  const [preferredStudyTime, setPreferredStudyTime] = useState(
    currentProfile?.preferredStudyTime || 'Evening (5 PM - 9 PM)'
  );
  const [dailyStudyHours, setDailyStudyHours] = useState(currentProfile?.dailyStudyHours || 3.5);
  const [preferredSessionDuration, setPreferredSessionDuration] = useState(
    currentProfile?.preferredSessionDuration || 45
  );
  const [targetExamDate, setTargetExamDate] = useState(
    currentProfile?.targetExamDate || '2026-11-25'
  );
  const [academicGoals, setAcademicGoals] = useState(currentProfile?.academicGoals || '');
  const [difficultSubjects, setDifficultSubjects] = useState(
    currentProfile?.difficultSubjects || ''
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile completion calculation
  const fields = [
    currentUser?.fullName,
    currentUser?.email,
    collegeName,
    universityName,
    bcaYear,
    semester,
    rollNumber,
    preferredStudyTime,
    dailyStudyHours,
    targetExamDate,
    academicGoals,
    difficultSubjects,
  ];
  const filledCount = fields.filter((f) => !!f).length;
  const completionPercentage = Math.round((filledCount / fields.length) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      mobile,
      collegeName,
      universityName,
      bcaYear,
      semester: Number(semester),
      rollNumber,
      preferredStudyTime,
      dailyStudyHours: Number(dailyStudyHours),
      preferredSessionDuration: Number(preferredSessionDuration),
      targetExamDate,
      academicGoals,
      difficultSubjects,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile &amp; Preferences</h1>
        <p className="text-sm text-slate-500">
          Manage your BCA curriculum details, university information, and study schedule settings.
        </p>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">Profile Completion Status</span>
          </div>
          <span className="text-sm font-extrabold text-blue-600">{completionPercentage}% Complete</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        {/* Basic Account Info (Readonly) */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            1. User Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Student Full Name</label>
              <input
                type="text"
                disabled
                value={currentUser?.fullName || ''}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Registered Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            2. College &amp; BCA Academic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">BCA Year *</label>
              <select
                value={bcaYear}
                onChange={(e) => setBcaYear(e.target.value as BcaYear)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="First Year">First Year (Sem 1 &amp; 2)</option>
                <option value="Second Year">Second Year (Sem 3 &amp; 4)</option>
                <option value="Third Year">Third Year (Sem 5 &amp; 6)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Current Semester *</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Student Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. BCA-2024-042"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">College / Institute Name *</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Apex Institute of Computer Studies"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">University Name *</label>
              <input
                type="text"
                required
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. State Technological University"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Study Planner Settings */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            3. Study Planner Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Daily Available Hours</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={dailyStudyHours}
                onChange={(e) => setDailyStudyHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Preferred Study Slot</label>
              <select
                value={preferredStudyTime}
                onChange={(e) => setPreferredStudyTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Early Morning (5 AM - 8 AM)">Early Morning (5 AM - 8 AM)</option>
                <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                <option value="Evening (5 PM - 9 PM)">Evening (5 PM - 9 PM)</option>
                <option value="Late Night (9 PM - 1 AM)">Late Night (9 PM - 1 AM)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Session Duration (Mins)</label>
              <select
                value={preferredSessionDuration}
                onChange={(e) => setPreferredSessionDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30 Minutes (Short Sprint)</option>
                <option value="45">45 Minutes (Recommended)</option>
                <option value="60">60 Minutes (Deep Focus)</option>
                <option value="90">90 Minutes (Comprehensive)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 uppercase mb-1">Target Examination Date</label>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Goals & Difficult Subjects */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            4. Academic Goals &amp; Focus Areas
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Academic Goals &amp; Targets</label>
              <textarea
                rows={2}
                value={academicGoals}
                onChange={(e) => setAcademicGoals(e.target.value)}
                placeholder="e.g. Score 85%+ in Semester 3, complete Data Structures lab practicals..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Subjects Found Difficult</label>
              <input
                type="text"
                value={difficultSubjects}
                onChange={(e) => setDifficultSubjects(e.target.value)}
                placeholder="e.g. Data Structures, Computer Architecture, Discrete Math"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Information</span>
          </button>
        </div>
      </form>
    </div>
  );
};
