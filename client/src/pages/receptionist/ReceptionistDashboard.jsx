import React, { useState, useEffect } from 'react';
import { dashboardApi, appointmentApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  Receipt,
  UserPlus,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

export const ReceptionistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, { status });
      fetchStats();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const kpis = data?.kpis || {};
  const waitingQueue = data?.waitingQueue || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Reception & Patient Intake Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">Patient check-in, appointment scheduling, and waiting room queue flow</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/receptionist/booking">
            <Button variant="primary" size="sm" icon={Calendar}>
              Book Appointment
            </Button>
          </Link>
          <Link to="/receptionist/patients/new">
            <Button variant="outline" size="sm" icon={UserPlus}>
              Register Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Today</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {loading ? <Skeleton className="h-8 w-12" /> : kpis.appointmentsToday || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Total bookings</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently in Lobby</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {loading ? <Skeleton className="h-8 w-12" /> : kpis.inWaitingRoom || 0}
          </h3>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">Checked-in queue</p>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Invoices</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">
            {loading ? <Skeleton className="h-8 w-12" /> : kpis.pendingInvoices || 0}
          </h3>
          <p className="text-[11px] text-rose-700 font-medium mt-0.5">Awaiting copay / balance</p>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Patients</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {loading ? <Skeleton className="h-8 w-12" /> : kpis.totalRegisteredPatients || 0}
          </h3>
          <p className="text-[11px] text-teal-600 font-medium mt-0.5">Active clinical master files</p>
        </Card>
      </div>

      {/* Live Lobby Queue Table */}
      <Card
        title="Live Reception Lobby & Waiting Room"
        subtitle="Manage arrival queue sequence and room transitions"
        action={
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchStats}>
            Refresh
          </Button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">MRN</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Check-in Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && waitingQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <Skeleton count={3} className="h-10 w-full" />
                  </td>
                </tr>
              ) : waitingQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    The waiting room is currently empty.
                  </td>
                </tr>
              ) : (
                waitingQueue.map((apt) => {
                  const p = apt.patientId || {};
                  return (
                    <tr key={apt._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold inline-flex items-center justify-center text-xs">
                          {apt.queueNumber || '1'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.firstName} {p.lastName}
                        <span className="block text-[10px] text-slate-400 font-normal">{p.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">{p.mrn}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {apt.doctorId?.userId?.name || 'Physician'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {apt.checkInTime ? new Date(apt.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={apt.status === 'in-consultation' ? 'purple' : 'warning'}>
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {apt.status === 'arrived' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateStatus(apt._id, 'in-consultation')}
                          >
                            Call into Room
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleUpdateStatus(apt._id, 'completed')}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
