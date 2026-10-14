import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi, doctorApi, appointmentApi, adminApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Calendar, Clock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const AppointmentBooking = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [reason, setReason] = useState('Consultation');

  // Slots
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);

  // Load initial dropdowns
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [patientList, doctorList, serviceList] = await Promise.all([
          patientApi.list('limit=100'),
          doctorApi.list(),
          adminApi.listServices(),
        ]);

        setPatients(patientList || []);
        setDoctors(doctorList || []);
        setServices(serviceList || []);

        if (patientList?.length > 0) setSelectedPatientId(patientList[0]._id);
        if (doctorList?.length > 0) setSelectedDoctorId(doctorList[0]._id);
        if (serviceList?.length > 0) setSelectedServiceId(serviceList[0]._id);
      } catch (err) {
        console.error(err);
      }
    };

    loadPrerequisites();
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      setError('');
      try {
        const data = await doctorApi.getSlots(selectedDoctorId, selectedDate);
        setSlotsData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor schedule');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available appointment time slot');
      return;
    }

    setBooking(true);
    setError('');
    setSuccess('');

    try {
      const booked = await appointmentApi.book({
        doctorId: selectedDoctorId,
        patientId: selectedPatientId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        serviceId: selectedServiceId,
        reason,
      });

      setSuccess(`Appointment booked successfully! Reference: ${booked.appointmentNumber}`);
      setTimeout(() => {
        navigate('/receptionist/dashboard');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Booking collision. Please choose another slot.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/receptionist/dashboard')}>
          Back to Front Desk
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointment Scheduling & Slot Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">Live conflict prevention and provider availability slot finder</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Selector */}
            <Select
              label="Select Patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              options={patients.map((p) => ({
                value: p._id,
                label: `${p.firstName} ${p.lastName} (${p.mrn}) - ${p.phone}`,
              }))}
              required
            />

            {/* Doctor Selector */}
            <Select
              label="Select Attending Physician"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={doctors.map((d) => ({
                value: d._id,
                label: `${d.userId?.name || 'Dr.'} (${d.departmentId?.name || 'Medicine'}) - $${d.consultationFee}`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Appointment Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />

            <Select
              label="Clinic Service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              options={services.map((s) => ({
                value: s._id,
                label: `${s.name} ($${s.fee})`,
              }))}
            />

            <Input
              label="Reason for Visit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hypertension Checkup"
              required
            />
          </div>

          {/* Real-Time Interactive Slot Grid */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Available Time Slots ({selectedDate})
                </h4>
                <p className="text-[11px] text-slate-500">
                  {slotsData?.workingHours ? `Physician Schedule: ${slotsData.workingHours}` : 'Schedule'}
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Booked / Break
                </span>
              </div>
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-xs text-slate-400">Checking provider schedule...</div>
            ) : !slotsData?.isAvailable ? (
              <div className="p-6 text-center text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                {slotsData?.message || 'Doctor is not available on this date'}
              </div>
            ) : slotsData.slots?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No slots generated for this schedule.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slotsData.slots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-lg text-xs font-mono font-medium transition-all text-center border ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-200'
                          : slot.isAvailable
                          ? 'bg-white hover:bg-teal-50 text-slate-900 border-slate-200 hover:border-teal-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                      title={slot.reason}
                    >
                      <span>{slot.startTime}</span>
                      <span className="block text-[9px] opacity-75 font-sans mt-0.5">
                        {slot.isAvailable ? 'Free' : slot.reason === 'Scheduled Break' ? 'Break' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" size="md" type="button" onClick={() => navigate('/receptionist/dashboard')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!selectedSlot}
              isLoading={booking}
              icon={Calendar}
            >
              {selectedSlot ? `Confirm Booking for ${selectedSlot.startTime}` : 'Select a Slot to Book'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
