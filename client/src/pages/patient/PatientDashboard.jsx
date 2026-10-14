import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  HeartPulse,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const PatientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
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
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-teal-300 font-semibold text-xs uppercase tracking-wider block">
            Personal Health Portal
          </span>
          <h1 className="text-2xl font-bold mt-1">Welcome to MedAssist Care</h1>
          <p className="text-xs text-teal-100/80 mt-1 max-w-lg">
            Access your clinician-approved prescriptions, diagnostic lab reports, and manage upcoming medical visits.
          </p>
        </div>
        <Link to="/patient/appointments">
          <Button variant="primary" size="md" icon={Calendar}>
            Book a Visit
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/patient/appointments">
          <Card className="hover:border-teal-300 transition-all cursor-pointer">
            <p className="text-xs font-semibold text-slate-500 uppercase">Upcoming Visits</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : kpis.upcomingCount || 0}
            </h3>
            <span className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              View schedule <ArrowRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link to="/patient/prescriptions">
          <Card className="hover:border-teal-300 transition-all cursor-pointer">
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Prescriptions</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : kpis.activePrescriptions || 0}
            </h3>
            <span className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              Medication guide <ArrowRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link to="/patient/lab-reports">
          <Card className="hover:border-teal-300 transition-all cursor-pointer">
            <p className="text-xs font-semibold text-slate-500 uppercase">Released Lab Tests</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : kpis.releasedLabReports || 0}
            </h3>
            <span className="text-[11px] text-teal-600 font-medium mt-1 flex items-center gap-1">
              View results <ArrowRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>

        <Link to="/patient/invoices">
          <Card className="hover:border-teal-300 transition-all cursor-pointer">
            <p className="text-xs font-semibold text-slate-500 uppercase">Unpaid Invoices</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {loading ? <Skeleton className="h-8 w-12" /> : kpis.unpaidInvoices || 0}
            </h3>
            <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              Billing details <ArrowRight className="w-3 h-3" />
            </span>
          </Card>
        </Link>
      </div>

      {/* Upcoming Visits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Your Upcoming Appointments"
          subtitle="Confirmed clinical consultations and checkups"
          className="lg:col-span-2"
        >
          {loading ? (
            <Skeleton count={3} className="h-16 w-full" />
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              You have no upcoming appointments scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl font-bold text-xs text-center shrink-0">
                      <Calendar className="w-5 h-5 mx-auto mb-0.5" />
                      <span>{new Date(apt.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {apt.doctorId?.userId?.name || 'Attending Physician'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {apt.doctorId?.departmentId?.name || 'Clinic Department'} • {apt.reason}
                      </p>
                      <span className="text-[11px] font-mono font-medium text-teal-700 mt-1 block">
                        Scheduled for {apt.startTime} - {apt.endTime}
                      </span>
                    </div>
                  </div>

                  <Badge variant={apt.status === 'arrived' ? 'warning' : 'blue'}>
                    {apt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Educational Health Feature Callout */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-600 text-white rounded-lg shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-teal-900 text-sm">AI Patient Medication Explainer</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Have questions about when or how to take your medicine? Our clinician-guided AI translates prescription instructions into accessible plain language.
                </p>
                <Link to="/patient/prescriptions" className="inline-block mt-3">
                  <Button variant="primary" size="sm" icon={Pill}>
                    View Explanations
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <Card className="text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Patient Data Privacy Notice</span>
            </div>
            <p>
              Under MedAssist medical governance, diagnostic lab findings are released to your portal only after formal verification by authorized clinical personnel.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
