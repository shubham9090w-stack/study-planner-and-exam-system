import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isAuthorizedAdmin, PRIMARY_ADMIN_EMAIL, verifyAdminPasscode } from '../utils/adminAuth';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { currentUser, login, setCurrentView } = useApp();
  const [adminEmail, setAdminEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // If user is already the authorized administrator, render admin views normally
  if (isAuthorizedAdmin(currentUser)) {
    return <>{children}</>;
  }

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setTimeout(() => {
      const success = login(adminEmail, adminPin);
      setIsVerifying(false);

      if (!success) {
        setAuthError(
          `Authentication failed. Only the authorized administrator (${PRIMARY_ADMIN_EMAIL}) with the correct master security passcode can access this console.`
        );
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-400/30 rounded-2xl mx-auto flex items-center justify-center mb-3 text-amber-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Restricted Access</span>
          </span>
          <h2 className="text-xl font-bold tracking-tight">Administrator Console</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            This area is strictly restricted to the system administrator. Student accounts and public users cannot view this console.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {currentUser && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{currentUser.fullName}</p>
                <p className="text-slate-500 truncate">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                    Role: {currentUser.role}
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    (Standard student account)
                  </span>
                </div>
              </div>
            </div>
          )}

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleAdminAuth} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={PRIMARY_ADMIN_EMAIL}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Admin Master Password / Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifying ? 'Authenticating...' : 'Authorize & Open Console'}</span>
            </button>
          </form>

          {/* Action to return */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1.5 transition py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
