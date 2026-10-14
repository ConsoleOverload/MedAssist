import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import {
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  Building,
  Shield,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const recentAppointments = data?.recentAppointments || [];

  const statusVariant = {
    booked: 'blue',
    arrived: 'warning',
    'in-consultation': 'purple',
    completed: 'success',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Clinic Operations & Administration</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time facility utilization, revenue, and clinical activity overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/staff">
            <Button variant="outline" size="sm" icon={Users}>
              Staff Directory
            </Button>
          </Link>
          <Link to="/admin/audit">
            <Button variant="secondary" size="sm" icon={Shield}>
              System Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? <Skeleton className="h-8 w-16" /> : kpis.totalPatients || 0}
              </h3>
              <p className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Active medical profiles
              </p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointments Today</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? <Skeleton className="h-8 w-16" /> : kpis.appointmentsToday || 0}
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1 flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> Current clinic day
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Physicians</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? <Skeleton className="h-8 w-16" /> : kpis.activeDoctors || 0}
              </h3>
              <p className="text-[11px] text-purple-600 font-medium mt-1">
                Across {kpis.departments || 5} departments
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? <Skeleton className="h-8 w-24" /> : `$${(kpis.totalRevenue || 0).toLocaleString()}`}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Consultations, labs & services
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments Stream */}
        <Card
          title="Recent Clinical Appointments"
          subtitle="Latest scheduled, arrived, and completed visits"
          className="lg:col-span-2"
          noPadding
        >
          {loading ? (
            <div className="p-5 space-y-3">
              <Skeleton count={4} className="h-12 w-full" />
            </div>
          ) : recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No appointments recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Physician</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Guest Patient'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {apt.patientId?.mrn}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {apt.doctorId?.userId?.name || 'Physician'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                        <span className="block text-[10px] text-slate-400">{apt.startTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant[apt.status] || 'slate'}>
                          {apt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quick Config Links */}
        <div className="space-y-4">
          <Card title="Quick Governance" subtitle="Operational settings & catalogs">
            <div className="space-y-2">
              <Link
                to="/admin/staff"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/40 transition-all text-xs font-medium text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Staff Accounts</span>
                    <span className="text-[10px] text-slate-500">Add physicians, technicians & receptionists</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/services"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-xs font-medium text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Services & Departments</span>
                    <span className="text-[10px] text-slate-500">Configure consultation fees & categories</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/admin/audit"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all text-xs font-medium text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-900">Security Audit Logs</span>
                    <span className="text-[10px] text-slate-500">Append-only compliance audit trail</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </Card>

          <Card title="Clinical System Status" className="bg-slate-900 text-slate-100">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">REST API Server</span>
                <span className="font-semibold text-emerald-400">Active (Port 5001)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">AI Synthesizer</span>
                <span className="font-semibold text-teal-300">Provider Ready</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
