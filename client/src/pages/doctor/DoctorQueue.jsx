import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Clock, UserCheck, Stethoscope, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getQueue();
      setQueue(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000); // Live poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = async (apt) => {
    try {
      await appointmentApi.updateStatus(apt._id, { status: 'in-consultation' });
      navigate(`/doctor/encounter/${apt._id}`);
    } catch (err) {
      console.error(err);
      navigate(`/doctor/encounter/${apt._id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Live Waiting Room Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">Patients currently checked-in at reception awaiting consultation</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchQueue}>
          Refresh Queue
        </Button>
      </div>

      <Card noPadding>
        {loading && queue.length === 0 ? (
          <div className="p-6">
            <Skeleton count={3} className="h-16 w-full" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={UserCheck}
              title="No patients waiting in queue"
              description="All arrived patients have been evaluated or no arrivals recorded yet."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((apt) => {
              const patient = apt.patientId || {};
              const isInRoom = apt.status === 'in-consultation';

              return (
                <div
                  key={apt._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isInRoom ? 'bg-purple-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Queue Token Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        isInRoom
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                        {isInRoom ? 'Active' : 'Queue'}
                      </span>
                      <span className="text-lg leading-none">{apt.queueNumber || '1'}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {patient.firstName} {patient.lastName}
                        </h4>
                        <Badge variant={isInRoom ? 'purple' : 'warning'} size="xs">
                          {apt.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {patient.mrn} • Blood: {patient.bloodGroup || 'Unknown'} • Phone: {patient.phone}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Checked-in: {apt.checkInTime ? new Date(apt.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>Reason: <strong className="text-slate-800">{apt.reason}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                    <Button
                      variant={isInRoom ? 'primary' : 'secondary'}
                      size="md"
                      icon={Stethoscope}
                      onClick={() => handleCallPatient(apt)}
                    >
                      {isInRoom ? 'Enter Consultation' : 'Call into Examination Room'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
