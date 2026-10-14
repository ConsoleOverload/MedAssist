import React, { useState, useEffect } from 'react';
import { appointmentApi, doctorApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Calendar, Clock, Plus, XCircle, AlertCircle } from 'lucide-react';

export const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('Medical Consultation');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [aptList, docList] = await Promise.all([
        appointmentApi.list(),
        doctorApi.list(),
      ]);
      const validApt = Array.isArray(aptList) ? aptList.filter(Boolean) : [];
      const validDocs = Array.isArray(docList) ? docList.filter(Boolean) : [];
      setAppointments(validApt);
      setDoctors(validDocs);
      if (validDocs[0]?._id && !selectedDoctorId) {
        setSelectedDoctorId(validDocs[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch slots when modal opens or date/doc changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !selectedDate || !bookModalOpen) return;
      try {
        const data = await doctorApi.getSlots(selectedDoctorId, selectedDate);
        setSlotsData(data);
        setSelectedSlot(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSlots();
  }, [selectedDoctorId, selectedDate, bookModalOpen]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please choose an available appointment time slot');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await appointmentApi.book({
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        reason,
      });
      setBookModalOpen(false);
      fetchAppointments();
      alert('Your appointment has been confirmed!');
    } catch (err) {
      setError(err.message || 'Slot conflict. Please choose another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (aptId) => {
    const confirmReason = window.prompt('Please enter a cancellation reason:');
    if (!confirmReason) return;
    try {
      await appointmentApi.updateStatus(aptId, { status: 'cancelled', cancellationReason: confirmReason });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Cancellation failed');
    }
  };

  const statusVariants = {
    booked: 'blue',
    arrived: 'warning',
    'in-consultation': 'purple',
    completed: 'success',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">View your clinic visits and schedule new appointments</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setBookModalOpen(true)}>
          Schedule New Visit
        </Button>
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Physician & Department</th>
                <th className="py-3 px-4">Appointment Date</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <Skeleton count={3} className="h-10 w-full" />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No appointments booked yet. Click "Schedule New Visit" above.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {apt.doctorId?.userId?.name || 'Physician'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {apt.doctorId?.departmentId?.name || 'Department'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {apt.startTime} - {apt.endTime}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{apt.reason}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariants[apt.status] || 'slate'}>
                        {apt.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {apt.status === 'booked' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => handleCancel(apt._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Modal */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title="Schedule a Clinic Appointment"
        subtitle="Select doctor and available consultation slot"
        maxWidth="max-w-2xl"
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4">
          <Select
            label="Select Physician"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={doctors.filter(Boolean).map((d) => ({
              value: d._id,
              label: `${d.userId?.name || 'Dr.'} (${d.departmentId?.name || 'Clinic'}) - $${d.consultationFee || 0}`,
            }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preferred Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
            <Input
              label="Primary Reason / Symptoms"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up checkup"
              required
            />
          </div>

          {/* Slots Picker */}
          <div>
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Available Slots</h5>
            {slotsData?.slots?.length ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {slotsData.slots.map((s) => (
                  <button
                    key={s.startTime}
                    type="button"
                    disabled={!s.isAvailable}
                    onClick={() => setSelectedSlot(s)}
                    className={`p-2 rounded text-xs font-mono border text-center transition-all ${
                      selectedSlot?.startTime === s.startTime
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : s.isAvailable
                        ? 'bg-white hover:bg-teal-50 border-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {s.startTime}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Loading doctor availability...</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setBookModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!selectedSlot}
              isLoading={submitting}
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
