import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Printer, FlaskConical, CheckCircle2 } from 'lucide-react';

export const LabReportPrintModal = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = report.patientId || {};
  const doctor = report.doctorId || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laboratory Diagnostic Report Preview"
      subtitle={`Order #${report.orderNumber} • Accession: ${report.accessionNumber || 'N/A'}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Diagnostic Report
          </Button>
        </div>
      }
    >
      <div className="p-8 bg-white border border-slate-200 rounded-xl print-card font-sans text-slate-800">
        {/* Lab Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600 text-white rounded-lg">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">MedAssist Diagnostic Laboratories</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Clinical Pathology & Diagnostic Biochemistry Division</p>
            <p className="text-[11px] text-slate-400">ISO 15189 & CLIA Accredited Laboratory Facility</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Clinically Verified
            </span>
            <p className="text-xs text-slate-500 mt-1">Released: {report.releasedAt ? new Date(report.releasedAt).toLocaleDateString() : 'Pending'}</p>
          </div>
        </div>

        {/* Patient & Accession Details */}
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
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Accession / Sample</span>
            <span className="font-semibold text-slate-900">
              {report.accessionNumber || 'N/A'} • {report.sampleType}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Ordering Physician</span>
            <span className="font-semibold text-slate-900">{doctor.userId?.name || 'Physician'}</span>
          </div>
        </div>

        {/* Test Name & Category */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">{report.testName}</h3>
          <p className="text-xs text-slate-500">Department: {report.category} • Method: Automated Clinical Analyzer</p>
        </div>

        {/* Results Parameter Table */}
        <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200 rounded-lg overflow-hidden mb-6">
          <thead className="bg-slate-100/80 font-semibold text-slate-700">
            <tr>
              <th className="py-2.5 px-3">Analyte / Parameter</th>
              <th className="py-2.5 px-3">Observed Value</th>
              <th className="py-2.5 px-3">Units</th>
              <th className="py-2.5 px-3">Reference Interval</th>
              <th className="py-2.5 px-3">Evaluation Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report.results?.map((res, idx) => (
              <tr key={idx} className={res.flag === 'abnormal' ? 'bg-amber-50/40' : res.flag === 'critical' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                <td className="py-2.5 px-3 font-semibold text-slate-900">{res.parameter}</td>
                <td className={`py-2.5 px-3 font-mono font-bold ${res.flag !== 'normal' ? 'text-rose-600' : 'text-slate-900'}`}>
                  {res.value}
                </td>
                <td className="py-2.5 px-3 text-slate-600">{res.unit}</td>
                <td className="py-2.5 px-3 text-slate-600">{res.referenceRange}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      res.flag === 'normal'
                        ? 'bg-slate-100 text-slate-700'
                        : res.flag === 'critical'
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {res.flag}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Technician Notes */}
        {report.technicianNotes && (
          <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-0.5">Laboratory Remarks:</span>
            <p className="text-slate-600">{report.technicianNotes}</p>
          </div>
        )}

        {/* Dual Signature Blocks */}
        <div className="pt-8 mt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="w-40 border-b border-slate-700 mx-auto mb-1" />
            <p className="font-semibold text-slate-900">{report.sampleCollectedBy?.name || 'Laboratory Specialist'}</p>
            <p className="text-[10px] text-slate-500">Medical Technologist (MLS ASCP)</p>
          </div>
          <div>
            <div className="w-40 border-b border-slate-700 mx-auto mb-1" />
            <p className="font-semibold text-slate-900">{report.verifiedBy?.name || 'Pathologist'}</p>
            <p className="text-[10px] text-slate-500">Consultant Clinical Pathologist</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
