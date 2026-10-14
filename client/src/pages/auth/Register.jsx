import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/index.js';
import { Stethoscope, User, Mail, Lock, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
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

      const roleHomePaths = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        receptionist: '/receptionist/dashboard',
        lab_technician: '/lab/queue',
        patient: '/patient/dashboard',
      };

      navigate(roleHomePaths[loggedUser?.role || form.role] || '/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleTitles = {
    patient: { title: 'Create Patient Account', sub: 'Register for your personal MedAssist health portal' },
    receptionist: { title: 'Create Receptionist Account', sub: 'Front desk intake, queue management & billing' },
    doctor: { title: 'Create Doctor Account', sub: 'Physician portal for clinical notes & diagnostics' },
    lab_technician: { title: 'Create Lab Technician Account', sub: 'Laboratory processing & diagnostic verifications' },
    admin: { title: 'Create Administrator Account', sub: 'Full platform administration & governance' },
  };

  const currentRoleInfo = roleTitles[form.role] || roleTitles.patient;

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
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'patient', label: 'Patient' },
                { id: 'receptionist', label: 'Reception' },
                { id: 'doctor', label: 'Doctor' },
                { id: 'lab_technician', label: 'Lab Tech' },
                { id: 'admin', label: 'Admin' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              Register as {form.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
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
