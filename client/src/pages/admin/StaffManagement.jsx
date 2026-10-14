import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { UserPlus, Search, ShieldCheck, AlertCircle } from 'lucide-react';

export const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    phone: '',
    licenseNumber: '',
    departmentId: '',
    specialties: '',
    consultationFee: 100,
    roomNumber: '101',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const [usersData, deptsData] = await Promise.all([
        adminApi.listUsers(params.toString()),
        adminApi.listDepartments(),
      ]);

      const validUsers = Array.isArray(usersData) ? usersData.filter(Boolean) : [];
      const validDepts = Array.isArray(deptsData) ? deptsData.filter(Boolean) : [];
      setUsers(validUsers);
      setDepartments(validDepts);
      if (validDepts[0]?._id && !form.departmentId) {
        setForm((f) => ({ ...f, departmentId: validDepts[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminApi.toggleUserStatus(user._id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        specialties: form.specialties
          ? form.specialties.split(',').map((s) => s.trim())
          : ['General Medicine'],
      };

      await adminApi.createStaff(payload);
      setIsModalOpen(false);
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'doctor',
        phone: '',
        licenseNumber: '',
        departmentId: departments[0]?._id || '',
        specialties: '',
        consultationFee: 100,
        roomNumber: '101',
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const roleVariants = {
    admin: 'navy',
    doctor: 'teal',
    receptionist: 'blue',
    lab_technician: 'purple',
    patient: 'slate',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Staff & Clinical Personnel</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage administrative credentials, doctors, nurses, technicians, and access policies</p>
        </div>
        <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setIsModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      {/* Filter Bar */}
      <Card noPadding>
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto flex-1 max-w-md">
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
            <Button type="submit" variant="outline" size="md">
              Filter
            </Button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Clinical Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <Skeleton count={4} className="h-10 w-full" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No users match the selected query.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleVariants[u.role] || 'slate'}>
                        {u.role?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.doctorProfile?.specialties?.join(', ') ||
                        (u.patientProfile ? `MRN: ${u.patientProfile.mrn}` : 'General Facility')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant={u.isActive ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Clinical Personnel"
        subtitle="Provision access credentials and departmental assignment"
        maxWidth="max-w-xl"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name & Title"
            placeholder="e.g. Dr. Jennifer Hayes, MD"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Staff Email"
              type="email"
              placeholder="e.g. j.hayes@medassist.local"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Initial Password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Account Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'doctor', label: 'Doctor (Physician)' },
                { value: 'receptionist', label: 'Receptionist' },
                { value: 'lab_technician', label: 'Lab Technician' },
                { value: 'admin', label: 'Administrator' },
              ]}
              required
            />
            <Input
              label="Contact Phone"
              placeholder="555-010-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* Conditional Doctor Fields */}
          {form.role === 'doctor' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Physician Credentials</h4>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Department"
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  options={departments.filter(Boolean).map((d) => ({ value: d._id, label: d.name || 'Department' }))}
                  required
                />
                <Input
                  label="License Number"
                  placeholder="MD-99412"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Consultation Fee ($)"
                  type="number"
                  value={form.consultationFee}
                  onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Room / Clinic Suite"
                  placeholder="Suite 204"
                  value={form.roomNumber}
                  onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                />
              </div>

              <Input
                label="Specialties (comma separated)"
                placeholder="Internal Medicine, Diabetes, Cardiology"
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
