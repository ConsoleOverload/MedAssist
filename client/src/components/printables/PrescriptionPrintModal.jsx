import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Printer, Stethoscope, AlertTriangle } from 'lucide-react';

export const PrescriptionPrintModal = ({ isOpen, onClose, prescription }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = prescription.patientId || {};
  const doctor = prescription.doctorId || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prescription Document Preview"
      subtitle={`Rx Reference: ${prescription.prescriptionNumber}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Prescription
          </Button>
        </div>
      }
    >
      <div className="p-8 bg-white border border-slate-200 rounded-xl print-card font-sans text-slate-800">
        {/* Clinic Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-600 text-white rounded-lg">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">MedAssist Medical Centre</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">742 Healthcare Boulevard, Suite 500 • Tel: (555) 010-0000</p>
            <p className="text-[11px] text-slate-400">Accredited Clinical Healthcare Facility</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{doctor.userId?.name || 'Physician'}</p>
            <p className="text-xs text-slate-600">{doctor.qualification || 'MD'}</p>
            <p className="text-[11px] text-slate-500">License: {doctor.licenseNumber || 'MD-ACTIVE'}</p>
          </div>
        </div>

        {/* Patient Demographics Banner */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Patient Name</span>
            <span className="font-semibold text-slate-900 text-sm">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">MRN</span>
            <span className="font-semibold text-slate-900">{patient.mrn}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Gender / Blood Group</span>
            <span className="font-semibold text-slate-900 capitalize">
              {patient.gender} • {patient.bloodGroup || 'Unknown'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Issue Date</span>
            <span className="font-semibold text-slate-900">
              {new Date(prescription.issuedDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Allergy Warning if recorded */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="mb-5 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Documented Allergies:</strong> {patient.allergies.join(', ')}
            </span>
          </div>
        )}

        {/* Prescription Symbol & Medication Schedule */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-serif font-black text-teal-700 italic">℞</span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Medication Orders
            </h4>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100/80 font-semibold text-slate-700">
              <tr>
                <th className="py-2.5 px-3">Medication Name & Strength</th>
                <th className="py-2.5 px-3">Dosage / Frequency</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Special Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medications?.map((med, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {med.name} ({med.dosage})
                  </td>
                  <td className="py-3 px-3 text-slate-700">{med.frequency}</td>
                  <td className="py-3 px-3 text-slate-700">{med.duration}</td>
                  <td className="py-3 px-3 text-slate-600 italic">
                    {med.instructions || 'As directed by physician'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* General Care Advice */}
        {prescription.generalInstructions && (
          <div className="mb-6 p-4 rounded-lg bg-teal-50/40 border border-teal-100 text-xs">
            <h5 className="font-semibold text-teal-900 mb-1">Doctor's Care Instructions:</h5>
            <p className="text-slate-700 leading-relaxed">{prescription.generalInstructions}</p>
          </div>
        )}

        {/* Signatures & Stamps */}
        <div className="pt-10 mt-8 border-t border-slate-200 flex justify-between items-end">
          <div className="text-[10px] text-slate-400 max-w-xs">
            This electronic medical record was generated via the secure MedAssist clinical portal. Verify authentication at medassist.local.
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-slate-800 mb-1" />
            <p className="text-xs font-semibold text-slate-900">{doctor.userId?.name || 'Attending Physician'}</p>
            <p className="text-[10px] text-slate-500">Authorized Electronic Signature</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
