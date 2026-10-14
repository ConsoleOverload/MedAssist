import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { UserPlus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const PatientRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    phone: '',
    email: '',
    bloodGroup: 'Unknown',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactRel: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        bloodGroup: form.bloodGroup,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
        },
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [],
        emergencyContact: {
          name: form.emergencyContactName,
          relationship: form.emergencyContactRel,
          phone: form.emergencyContactPhone,
        },
        medicalHistory: form.medicalHistory ? form.medicalHistory.split(',').map((s) => s.trim()) : [],
        insuranceProvider: form.insuranceProvider,
        insurancePolicyNumber: form.insurancePolicyNumber,
      };

      const newPatient = await patientApi.create(payload);
      setSuccess(`Patient registered successfully! Assigned MRN: ${newPatient.mrn}`);
      setTimeout(() => {
        navigate('/receptionist/booking');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/receptionist/dashboard')}>
          Back to Front Desk
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patient Intake & Registration</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create master clinical patient index (MPI) and demographic record</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Demographics */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">1. Personal Demographics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Jane"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Smith"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <Input
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
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
              <Select
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                options={[
                  { value: 'Unknown', label: 'Unknown' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">2. Contact & Address</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="555-010-0000"
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="patient@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="123 Health Ave"
                />
              </div>
              <Input
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Chicago"
              />
              <Input
                label="Postal Code"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="60601"
              />
            </div>
          </div>

          {/* Clinical Profile & Allergies */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">3. Clinical Profile & Safety Alerts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Allergies (comma separated)"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts, Latex"
              />
              <Input
                label="Known Medical Conditions"
                name="medicalHistory"
                value={form.medicalHistory}
                onChange={handleChange}
                placeholder="e.g. Hypertension, Asthma, T2D"
              />
            </div>
          </div>

          {/* Emergency Contact & Insurance */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">4. Emergency Contact & Insurance</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="Relative or guardian"
              />
              <Input
                label="Relationship"
                name="emergencyContactRel"
                value={form.emergencyContactRel}
                onChange={handleChange}
                placeholder="Spouse, Parent, etc."
              />
              <Input
                label="Emergency Phone"
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={handleChange}
                placeholder="555-010-9999"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Input
                label="Insurance Provider"
                name="insuranceProvider"
                value={form.insuranceProvider}
                onChange={handleChange}
                placeholder="e.g. Blue Cross Blue Shield"
              />
              <Input
                label="Policy / Group Number"
                name="insurancePolicyNumber"
                value={form.insurancePolicyNumber}
                onChange={handleChange}
                placeholder="BCBS-8849102"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="md" type="button" onClick={() => navigate('/receptionist/dashboard')}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={submitting} icon={UserPlus}>
              Register Patient in MPI
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
