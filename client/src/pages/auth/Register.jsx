import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/index.js';
import { Stethoscope, User, Mail, Lock, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';

import { APP_ROLES, ROLE_HOME_PATHS, ROLE_LABELS } from '../../constants/roles.js';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'receptionist',
    dateOfBirth: '',
    gender: 'male',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (form.role === 'patient' && !form.dateOfBirth) {
      setError('Date of birth is required for patient registration');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        ...form,
        dateOfBirth: form.dateOfBirth || '1995-01-01',
      });

      // Auto login after register
      const loggedUser = await login(form.email, form.password);

      navigate(ROLE_HOME_PATHS[loggedUser?.role || form.role] || '/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const currentRoleInfo = APP_ROLES.find((r) => r.id === form.role) || APP_ROLES[0];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500 text-slate-950 shadow-lg mb-3">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white">{currentRoleInfo.title}</h2>
        <p className="text-xs text-slate-400 mt-1">{currentRoleInfo.sub}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {/* Role Picker Pills */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl">
              {APP_ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`py-1.5 px-1 text-xs font-semibold rounded-lg transition-all text-center truncate ${
                    form.role === r.id
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
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
              label="Full Name"
              name="name"
              placeholder={form.role === 'doctor' ? 'e.g. Dr. Johnathan Doe' : 'e.g. Johnathan Doe'}
              value={form.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. user@medassist.local"
              value={form.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            {form.role === 'patient' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  icon={Calendar}
                  required
                />

                <Select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  required
                />
              </div>
            )}

            <Input
              label="Mobile Phone"
              name="phone"
              placeholder="555-010-0000"
              value={form.phone}
              onChange={handleChange}
              icon={Phone}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
              Register as {ROLE_LABELS[form.role] || form.role}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
