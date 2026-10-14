import React, { useState, useEffect } from 'react';
import { dashboardApi, appointmentApi } from '../../api/index.js';
import { useNavigate } from 'react-router-dom';

const defaultFallbackAppointments = [
  {
    _id: 'apt-001',
    startTime: '10:00 AM',
    status: 'in-consultation',
    reason: 'COPD Follow-up & Persistent Cough',
    patientId: {
      _id: 'p-001',
      firstName: 'Ramesh',
      lastName: 'Rao',
      mrn: 'YH-94821',
      gender: 'male',
      dateOfBirth: '1964-04-12',
    },
    vitals: { spo2: '92%', hr: '82 bpm', bp: '130/84', rr: '22/min' },
  },
  {
    _id: 'apt-002',
    startTime: '10:30 AM',
    status: 'arrived',
    reason: 'Asthma Refill & Peak Flow Check',
    patientId: {
      _id: 'p-002',
      firstName: 'Priya',
      lastName: 'Sharma',
      mrn: 'YH-88219',
      gender: 'female',
      dateOfBirth: '1992-08-20',
    },
  },
  {
    _id: 'apt-003',
    startTime: '11:00 AM',
    status: 'arrived',
    reason: 'Chronic Bronchitis Review',
    patientId: {
      _id: 'p-003',
      firstName: 'David',
      lastName: 'Miller',
      mrn: 'YH-76120',
      gender: 'male',
      dateOfBirth: '1981-11-05',
    },
  },
  {
    _id: 'apt-004',
    startTime: '11:30 AM',
    status: 'booked',
    reason: 'Sleep Apnea CPAP Follow-up',
    patientId: {
      _id: 'p-004',
      firstName: 'Sunita',
      lastName: 'Reddy',
      mrn: 'YH-55412',
      gender: 'female',
      dateOfBirth: '1968-02-14',
    },
  },
  {
    _id: 'apt-005',
    startTime: '09:00 AM',
    status: 'completed',
    reason: 'Post-Infection Pulmonary Review',
    patientId: {
      _id: 'p-005',
      firstName: 'Ananya',
      lastName: 'Sen',
      mrn: 'YH-34901',
      gender: 'female',
      dateOfBirth: '1974-06-18',
    },
  },
  {
    _id: 'apt-006',
    startTime: '09:30 AM',
    status: 'completed',
    reason: 'Arterial Blood Gas (ABG) Review',
    patientId: {
      _id: 'p-006',
      firstName: 'Vikram',
      lastName: 'Patel',
      mrn: 'YH-22941',
      gender: 'male',
      dateOfBirth: '1978-09-30',
    },
  },
];

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQueueFilter, setActiveQueueFilter] = useState('all');
  const [signedReports, setSignedReports] = useState({});
  const [showFullAiModal, setShowFullAiModal] = useState(false);

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const kpis = data?.kpis || {};
  // Use API appointments if available and non-empty, otherwise use default fallback appointments
  const apiAppointments = data?.todayAppointments || data?.recentAppointments || [];
  const appointmentsList = apiAppointments.length > 0 ? apiAppointments : defaultFallbackAppointments;

  // Find active in-consultation or next waiting patient
  const inConsultationPatient =
    appointmentsList.find((a) => a.status === 'in-consultation') ||
    appointmentsList.find((a) => a.status === 'arrived') ||
    appointmentsList[0];

  const handleOpenConsultation = async (apt) => {
    try {
      if (apt.status === 'arrived' || apt.status === 'booked') {
        await appointmentApi.updateStatus(apt._id, { status: 'in-consultation' });
      }
      navigate(`/doctor/encounter/${apt._id}`);
    } catch {
      navigate(`/doctor/encounter/${apt._id}`);
    }
  };

  const handleQuickSign = (reportKey) => {
    setSignedReports((prev) => ({ ...prev, [reportKey]: true }));
  };

  const filteredAppointments = appointmentsList.filter((apt) => {
    if (activeQueueFilter === 'all') return true;
    if (activeQueueFilter === 'waiting') return apt.status === 'arrived' || apt.status === 'booked';
    if (activeQueueFilter === 'in-exam') return apt.status === 'in-consultation';
    if (activeQueueFilter === 'completed') return apt.status === 'completed';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Calm Header Horizon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Good morning, Dr. Chandrashekhar
          </h1>
          <p className="text-xs sm:text-sm text-outline mt-0.5">
            Pulmonary Medicine & Sleep Clinic • 4 patients remaining in morning session
          </p>
        </div>

        {/* Date & Shift Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-on-surface-variant bg-surface-container-lowest px-3.5 py-1.5 rounded-lg border border-surface-container shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* 3 Focused, Low-Stress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Today's Schedule
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-primary">
                {kpis.totalToday || 14}
              </span>
              <span className="text-xs text-outline font-medium">
                (8 completed)
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">person_check</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Waiting in Lobby
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-on-surface">
                {kpis.arrivedQueue || 4}
              </span>
              <span className="text-xs text-outline font-medium">
                Avg wait ~12m
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
              Pending Sign-off
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-on-surface">
                {Object.values(signedReports).filter(Boolean).length === 2 ? 0 : 2}
              </span>
              <span className="text-xs text-outline font-medium">
                Diagnostic reports
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[20px]">draw</span>
          </div>
        </div>
      </div>

      {/* Main Clinical Grid: Primary Consultation + Queue on Left (8 cols) / AI Assistant & Reviews on Right (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Active Patient + Queue */}
        <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Active Patient Card - Calm & Uncluttered */}
          {inConsultationPatient && (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs p-5 flex flex-col gap-4">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    {inConsultationPatient.status === 'in-consultation'
                      ? 'Exam Room 3 • Active Consultation'
                      : 'Next Patient Up'}
                  </span>
                </div>
                <span className="text-xs text-outline font-medium">
                  {inConsultationPatient.status === 'in-consultation' ? 'Elapsed: 14 mins' : 'Scheduled: 10:00 AM'}
                </span>
              </div>

              {/* Patient Basic Identity */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary font-bold text-base flex items-center justify-center shrink-0">
                    {inConsultationPatient.patientId?.firstName?.slice(0, 1) || 'R'}
                    {inConsultationPatient.patientId?.lastName?.slice(0, 1) || 'R'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-on-surface">
                        {inConsultationPatient.patientId?.firstName}{' '}
                        {inConsultationPatient.patientId?.lastName}
                      </h3>
                      <span className="text-xs text-outline">
                        62M • #{inConsultationPatient.patientId?.mrn || 'YH-94821'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      <strong className="font-medium text-on-surface">Reason:</strong>{' '}
                      {inConsultationPatient.reason || 'COPD Follow-up & Persistent Cough'}
                    </p>
                  </div>
                </div>

                {/* Subtle Allergy Tag */}
                <div className="sm:text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-md border border-surface-container">
                    <span className="material-symbols-outlined text-[13px] text-outline">info</span>
                    <span>Allergy: Aspirin / NSAIDs</span>
                  </span>
                </div>
              </div>

              {/* Clean Inline Vitals Pill Bar (Subtle, Not Glaring) */}
              <div className="flex flex-wrap items-center gap-4 py-2.5 px-3.5 rounded-lg bg-surface-container-low/70 border border-surface-container text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <span className="text-outline text-[11px]">SpO2:</span>
                  <span className="font-semibold text-on-surface">92%</span>
                </div>
                <div className="h-3 w-px bg-surface-container" />
                <div className="flex items-center gap-1.5">
                  <span className="text-outline text-[11px]">Heart Rate:</span>
                  <span className="font-semibold text-on-surface">82 bpm</span>
                </div>
                <div className="h-3 w-px bg-surface-container" />
                <div className="flex items-center gap-1.5">
                  <span className="text-outline text-[11px]">Blood Pressure:</span>
                  <span className="font-semibold text-on-surface">130/84 mmHg</span>
                </div>
                <div className="h-3 w-px bg-surface-container" />
                <div className="flex items-center gap-1.5">
                  <span className="text-outline text-[11px]">Resp:</span>
                  <span className="font-semibold text-on-surface">22/min</span>
                </div>
              </div>

              {/* Consultation Action */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <button
                  onClick={() => handleOpenConsultation(inConsultationPatient)}
                  className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                  <span>Open Patient Chart &amp; Notes</span>
                </button>

                <button
                  onClick={() => handleOpenConsultation(inConsultationPatient)}
                  className="h-9 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Complete Visit</span>
                </button>
              </div>
            </div>
          )}

          {/* Today's Schedule & Patient Queue */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Patient Queue</h3>
                <p className="text-xs text-outline">Morning Session • Yashoda Somajiguda OPD</p>
              </div>

              {/* Clean Filter Tabs */}
              <div className="bg-surface-container-low rounded-lg p-1 flex items-center gap-1 text-xs">
                {[
                  { id: 'all', label: `All (${appointmentsList.length})` },
                  { id: 'waiting', label: `Waiting (${appointmentsList.filter(a => a.status === 'arrived').length || 4})` },
                  { id: 'in-exam', label: 'In Room' },
                  { id: 'completed', label: 'Done' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveQueueFilter(tab.id)}
                    className={`px-3 py-1 rounded-md transition-colors text-xs font-medium ${
                      activeQueueFilter === tab.id
                        ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Queue List Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-surface-container text-outline text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {filteredAppointments.map((apt) => {
                    const p = apt.patientId || {};
                    const isInRoom = apt.status === 'in-consultation';
                    const isWaiting = apt.status === 'arrived';
                    const isDone = apt.status === 'completed';

                    return (
                      <tr
                        key={apt._id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-medium text-primary">
                          {apt.startTime || '10:00 AM'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="text-[11px] text-outline font-mono">
                              #{p.mrn || 'YH-94821'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant">
                          {apt.reason || 'Routine Consultation'}
                        </td>
                        <td className="py-3 px-3">
                          {isInRoom ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                              In Room 3
                            </span>
                          ) : isWaiting ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-medium">
                              Waiting
                            </span>
                          ) : isDone ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[11px]">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px]">
                              Scheduled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenConsultation(apt)}
                            className="px-3 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface font-medium text-xs transition-colors"
                          >
                            {isInRoom ? 'Continue' : isWaiting ? 'Call In' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Rail (4 cols): AI Briefing & Pending Approvals */}
        <div className="xl:col-span-4 flex flex-col gap-6 min-w-0">
          {/* Clinical Assistant - Calm, Concise, Not Overwhelming */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span>Clinical Assistant</span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Copilot
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Next: Ramesh Rao (62M)</strong> — Spirometry shows mild airway obstruction with +14% reversibility. Maintenance inhaler adherence is good.
            </p>

            <div className="pt-2 border-t border-surface-container flex items-center justify-between">
              <span className="text-xs text-outline">3 SOS uses reported this week</span>
              <button
                onClick={() => setShowFullAiModal(!showFullAiModal)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                {showFullAiModal ? 'Hide Details' : 'View Details'}
              </button>
            </div>

            {/* Expandable Details only when doctor wants to read further */}
            {showFullAiModal && (
              <div className="mt-2 p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant space-y-2 border border-surface-container animate-slide-up">
                <p className="font-semibold text-on-surface">Suggested Next Steps:</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li>Review spacer inhalation technique with patient</li>
                  <li>Perform repeat 6-minute walk test for exertional oxygenation</li>
                  <li>Schedule 3-month spirometry interval follow-up</li>
                </ul>
              </div>
            )}
          </div>

          {/* Pending Sign-off - Quick & Simple */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs p-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface font-bold text-xs">
                <span className="material-symbols-outlined text-[18px] text-secondary">draw</span>
                <span>Pending Approvals</span>
              </div>
              <span className="text-[10px] bg-surface-container text-outline px-2 py-0.5 rounded-full font-medium">
                {Object.values(signedReports).filter(Boolean).length === 2 ? 'All signed' : '2 pending'}
              </span>
            </div>

            {/* Item 1 */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface">Ananya Sen (52F)</span>
                <span className="text-[10px] text-outline">10:15 AM</span>
              </div>
              <p className="text-xs text-on-surface-variant">Arterial Blood Gas (ABG) Lab Panel</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-primary font-medium">Normal pH (7.40)</span>
                <button
                  onClick={() => handleQuickSign('abg')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    signedReports.abg
                      ? 'bg-tertiary text-on-primary'
                      : 'bg-primary hover:bg-primary-container text-on-primary'
                  }`}
                >
                  {signedReports.abg ? 'Signed ✓' : 'Sign Report'}
                </button>
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-on-surface">Vikram Patel (48M)</span>
                <span className="text-[10px] text-outline">09:30 AM</span>
              </div>
              <p className="text-xs text-on-surface-variant">Overnight Sleep Study (PSG)</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-outline">AHI: 24 (Moderate OSA)</span>
                <button
                  onClick={() => handleQuickSign('psg')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    signedReports.psg
                      ? 'bg-tertiary text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  {signedReports.psg ? 'Signed ✓' : 'Sign Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
