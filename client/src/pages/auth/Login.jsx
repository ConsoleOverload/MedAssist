import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Stethoscope, Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';

import { APP_ROLES, ROLE_HOME_PATHS } from '../../constants/roles.js';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (acc) => {
    setEmail(acc.demoEmail);
    setPassword(acc.demoPassword);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your clinical email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);

      const destination = location.state?.from?.pathname || ROLE_HOME_PATHS[loggedUser.role] || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 shadow-xl shadow-teal-500/20 mb-4">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">MedAssist Clinical Portal</h1>
        <p className="mt-1 text-xs text-slate-400">
          Electronic Medical Records & Clinic Operations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-100 sm:px-10">
          {/* Quick Demo Switcher Buttons */}
          <div className="mb-6">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              One-Click Role Preview Accounts
            </span>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {APP_ROLES.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`text-[11px] font-medium py-1.5 px-2 rounded-lg transition-transform active:scale-95 text-center truncate ${acc.color}`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 text-[10px] font-medium">Or Sign In Manually</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. doctor@medassist.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New patient without an account?{' '}
              <a href="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                Register for Portal
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>HIPAA-Minded • RBAC Session Control • End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
