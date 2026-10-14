import React, { useState, useEffect } from 'react';
import { dashboardApi, appointmentApi, patientApi, doctorApi } from '../../api/index.js';
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
  Zap,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const ReceptionistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [quickPatientId, setQuickPatientId] = useState('');
  const [quickDoctorId, setQuickDoctorId] = useState('');
  const [quickReason, setQuickReason] = useState('General Consultation');
  const [quickBooking, setQuickBooking] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState('');

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

  const loadDropdowns = async () => {
    try {
      const [pts, docs] = await Promise.all([
        patientApi.list('limit=100'),
        doctorApi.list(),
      ]);
      const validPts = Array.isArray(pts) ? pts.filter(Boolean) : [];
      const validDocs = Array.isArray(docs) ? docs.filter(Boolean) : [];
      setPatients(validPts);
      setDoctors(validDocs);
      if (validPts.length > 0) setQuickPatientId(validPts[0]._id);
      if (validDocs.length > 0) setQuickDoctorId(validDocs[0]._id);
    } catch (err) {
      console.error('Failed to load quick dropdowns', err);
    }
  };

  useEffect(() => {
    fetchStats();
    loadDropdowns();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickCheckIn = async (e) => {
    e.preventDefault();
    if (!quickPatientId || !quickDoctorId) {
      alert('Please select a patient and a physician');
      return;
    }

    try {
      setQuickBooking(true);
      const today = new Date().toISOString().slice(0, 10);
      await appointmentApi.book({
        patientId: quickPatientId,
        doctorId: quickDoctorId,
        appointmentDate: today,
        reason: quickReason || 'General Consultation',
        status: 'arrived',
      });

      setQuickSuccess('Patient booked & checked in! Transferred to Doctor waiting room.');
      fetchStats();
      setTimeout(() => setQuickSuccess(''), 5000);
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setQuickBooking(false);
    }
  };

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
          <p className="text-xs text-slate-500 mt-0.5">Quick patient check-in, doctor assignment & live waiting room flow</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/receptionist/booking">
            <Button variant="outline" size="sm" icon={Calendar}>
              Advanced Calendar
            </Button>
          </Link>
          <Link to="/receptionist/patients/new">
            <Button variant="outline" size="sm" icon={UserPlus}>
              Register New Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* 1-Click Fast-Track Check-In Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white border-0 shadow-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Quick Flow
              </span>
              <h3 className="text-base font-bold text-white">1-Click Patient Check-In & Doctor Assignment</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select a patient and doctor to instantly book, assign a queue token, and alert the doctor.
            </p>
          </div>

          <form onSubmit={handleQuickCheckIn} className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={quickPatientId}
              onChange={(e) => setQuickPatientId(e.target.value)}
              className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-400 outline-none max-w-[200px]"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>

            <select
              value={quickDoctorId}
              onChange={(e) => setQuickDoctorId(e.target.value)}
              className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-400 outline-none max-w-[220px]"
              required
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name || 'Physician'} ({d.departmentId?.name || 'Medicine'})
                </option>
              ))}
            </select>

            <input
              type="text"
              value={quickReason}
              onChange={(e) => setQuickReason(e.target.value)}
              placeholder="Reason for visit"
              className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-400 outline-none w-36"
            />

            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={UserCheck}
              isLoading={quickBooking}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
            >
              Check In Patient
            </Button>
          </form>
        </div>

        {quickSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-teal-300" />
            <span>{quickSuccess}</span>
          </div>
        )}
      </Card>

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
                (waitingQueue || []).filter(Boolean).map((apt) => {
                  if (!apt?._id) return null;
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
