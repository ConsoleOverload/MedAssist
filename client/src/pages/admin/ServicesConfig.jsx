import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Building, Plus, Tag, AlertCircle } from 'lucide-react';

export const ServicesConfig = () => {
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', color: '#0D9488' });
  const [serviceForm, setServiceForm] = useState({
    name: '',
    code: '',
    departmentId: '',
    category: 'consultation',
    fee: 100,
    durationMinutes: 30,
    description: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptList, serviceList] = await Promise.all([
        adminApi.listDepartments(),
        adminApi.listServices(),
      ]);
      const validDepts = Array.isArray(deptList) ? deptList.filter(Boolean) : [];
      const validSvcs = Array.isArray(serviceList) ? serviceList.filter(Boolean) : [];
      setDepartments(validDepts);
      setServices(validSvcs);
      if (validDepts[0]?._id && !serviceForm.departmentId) {
        setServiceForm((s) => ({ ...s, departmentId: validDepts[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await adminApi.createDepartment(deptForm);
      setDeptModalOpen(false);
      setDeptForm({ name: '', code: '', description: '', color: '#0D9488' });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await adminApi.createService(serviceForm);
      setServiceModalOpen(false);
      setServiceForm({
        name: '',
        code: '',
        departmentId: departments[0]?._id || '',
        category: 'consultation',
        fee: 100,
        durationMinutes: 30,
        description: '',
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Departments & Clinical Fee Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage clinical specialties, procedural fees, and diagnostic billing codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Building} onClick={() => setDeptModalOpen(true)}>
            New Department
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setServiceModalOpen(true)}>
            Add Service / Fee
          </Button>
        </div>
      </div>

      {/* Departments Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Active Clinical Departments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <Skeleton count={3} className="h-24 w-full" />
          ) : (
            departments.map((dept) => (
              <Card key={dept._id} className="hover:shadow-card transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {dept.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">{dept.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description || 'Specialized clinical branch'}</p>
                  </div>
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: dept.color || '#0D9488' }}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Services Table */}
      <Card title="Clinic Billable Services & Fee Schedule" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Service Name & Code</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Fee ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6">
                    <Skeleton count={4} className="h-10 w-full" />
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No clinical services defined yet.
                  </td>
                </tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {svc.name}
                      <span className="block text-[10px] text-slate-400 font-mono">{svc.code}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{svc.departmentId?.name || 'General'}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {svc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{svc.durationMinutes} mins</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-700 text-sm">
                      ${Number(svc.fee).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Department Modal */}
      <Modal
        isOpen={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title="Add New Clinical Department"
        subtitle="Establish medical specialty unit"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleCreateDept} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Neurology"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            required
          />
          <Input
            label="Code (3-4 characters uppercase)"
            placeholder="NEUR"
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
            required
          />
          <Input
            label="Description"
            placeholder="Clinical scope and mission..."
            value={deptForm.description}
            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Save Department
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Service Modal */}
      <Modal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        title="Add Service to Fee Schedule"
        subtitle="Create billable clinic procedure or consultation"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleCreateService} className="space-y-4">
          <Input
            label="Service Title"
            placeholder="e.g. 12-Lead Resting ECG Analysis"
            value={serviceForm.name}
            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Service Code"
              placeholder="CARD-ECG-12"
              value={serviceForm.code}
              onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value.toUpperCase() })}
              required
            />
            <Select
              label="Department"
              value={serviceForm.departmentId}
              onChange={(e) => setServiceForm({ ...serviceForm, departmentId: e.target.value })}
              options={departments.filter(Boolean).map((d) => ({ value: d._id, label: d.name || 'Department' }))}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Category"
              value={serviceForm.category}
              onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
              options={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'procedure', label: 'Procedure' },
                { value: 'lab', label: 'Laboratory' },
                { value: 'imaging', label: 'Imaging' },
                { value: 'therapy', label: 'Therapy' },
              ]}
            />
            <Input
              label="Fee ($)"
              type="number"
              value={serviceForm.fee}
              onChange={(e) => setServiceForm({ ...serviceForm, fee: Number(e.target.value) })}
              required
            />
            <Input
              label="Duration (mins)"
              type="number"
              value={serviceForm.durationMinutes}
              onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setServiceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Add Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
