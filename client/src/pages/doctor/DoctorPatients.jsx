import React, { useState, useEffect } from 'react';
import { patientApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Search, User, History, Calendar, FileText, FlaskConical } from 'lucide-react';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Timeline Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientApi.list(search ? `search=${encodeURIComponent(search)}` : '');
      setPatients(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenTimeline = async (patient) => {
    setSelectedPatient(patient);
    setLoadingTimeline(true);
    try {
      const events = await patientApi.getTimeline(patient._id);
      setTimeline(events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Authorized clinical patient lookup and medical history timelines</p>
        </div>
      </div>

      <Card noPadding>
        {/* Search */}
        <div className="p-4 border-b border-slate-100 flex gap-2 max-w-md bg-slate-50/50">
          <input
            type="text"
            placeholder="Search by name, MRN, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <Button variant="outline" size="sm" onClick={fetchPatients}>
            Search
          </Button>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">MRN</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Allergies</th>
                <th className="py-3 px-4 text-right">Medical Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6">
                    <Skeleton count={4} className="h-10 w-full" />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.firstName} {p.lastName}
                      <span className="block text-[10px] text-slate-400 font-normal">{p.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">{p.mrn}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">
                      {p.gender} • {p.dateOfBirth ? `${new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()} yrs` : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{p.bloodGroup || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {p.allergies?.length > 0 ? (
                        <span className="text-rose-700 font-medium">{p.allergies.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400">None documented</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={History}
                        onClick={() => handleOpenTimeline(p)}
                      >
                        Chronological History
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Timeline Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Patient Chronological Health Timeline"
        subtitle={`${selectedPatient?.firstName} ${selectedPatient?.lastName} (${selectedPatient?.mrn})`}
        maxWidth="max-w-3xl"
      >
        {loadingTimeline ? (
          <div className="p-6">
            <Skeleton count={4} className="h-14 w-full" />
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No medical history recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((evt, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 text-teal-600 shadow-xs">
                  {evt.eventType === 'encounter' ? (
                    <FileText className="w-4 h-4" />
                  ) : evt.eventType === 'laboratory' ? (
                    <FlaskConical className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900">{evt.title}</h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(evt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Physician: {evt.doctor}</p>

                  {/* Diagnoses if encounter */}
                  {evt.diagnoses?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {evt.diagnoses.map((d, i) => (
                        <span key={i} className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium">
                          {d.code}: {d.description}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Medications if prescription */}
                  {evt.medications?.length > 0 && (
                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      Prescribed: {evt.medications.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
