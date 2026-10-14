import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { encounterApi, prescriptionApi, labApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import {
  Stethoscope,
  Save,
  CheckCircle,
  Sparkles,
  Pill,
  FlaskConical,
  AlertTriangle,
  FileCheck,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
} from 'lucide-react';

export const ClinicalEncounterConsole = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [encounter, setEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Form states
  const [vitals, setVitals] = useState({
    bloodPressureSys: '',
    bloodPressureDia: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    weightKg: '',
    heightCm: '',
    bmi: '',
  });

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const [diagnoses, setDiagnoses] = useState([]);
  const [newDiagCode, setNewDiagCode] = useState('');
  const [newDiagDesc, setNewDiagDesc] = useState('');

  const [aiSummaryText, setAiSummaryText] = useState('');
  const [aiSummaryStatus, setAiSummaryStatus] = useState('none');

  // Modals for Prescription & Lab
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [labModalOpen, setLabModalOpen] = useState(false);

  // Prescription Form
  const [rxMeds, setRxMeds] = useState([
    { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' },
  ]);
  const [rxInstructions, setRxInstructions] = useState('');

  // Lab Form
  const [labForm, setLabForm] = useState({
    testName: 'Complete Blood Count (CBC)',
    testCode: 'CBC-DIFF',
    category: 'Hematology',
    priority: 'routine',
    clinicalNotes: '',
  });

  const fetchEncounter = async () => {
    try {
      setLoading(true);
      const enc = await encounterApi.getByAppointment(appointmentId);
      setEncounter(enc);

      if (enc.vitals) {
        setVitals({
          bloodPressureSys: enc.vitals.bloodPressureSys || '',
          bloodPressureDia: enc.vitals.bloodPressureDia || '',
          heartRate: enc.vitals.heartRate || '',
          temperature: enc.vitals.temperature || '',
          oxygenSaturation: enc.vitals.oxygenSaturation || '',
          weightKg: enc.vitals.weightKg || '',
          heightCm: enc.vitals.heightCm || '',
          bmi: enc.vitals.bmi || '',
        });
      }

      setChiefComplaint(enc.chiefComplaint || '');
      if (enc.soapNotes) setSoapNotes(enc.soapNotes);
      if (enc.diagnoses) setDiagnoses(enc.diagnoses);
      if (enc.aiSummary) {
        setAiSummaryText(enc.aiSummary.generatedText || '');
        setAiSummaryStatus(enc.aiSummary.status || 'none');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounter();
  }, [appointmentId]);

  // Calculate BMI dynamically
  const handleWeightHeightChange = (field, val) => {
    const updated = { ...vitals, [field]: val };
    const w = parseFloat(field === 'weightKg' ? val : vitals.weightKg);
    const h = parseFloat(field === 'heightCm' ? val : vitals.heightCm);
    if (w > 0 && h > 0) {
      const heightM = h / 100;
      updated.bmi = (w / (heightM * heightM)).toFixed(1);
    }
    setVitals(updated);
  };

  // Add diagnosis
  const handleAddDiagnosis = () => {
    if (!newDiagCode || !newDiagDesc) return;
    setDiagnoses([
      ...diagnoses,
      { code: newDiagCode.toUpperCase().trim(), description: newDiagDesc.trim(), type: diagnoses.length === 0 ? 'primary' : 'secondary', status: 'active' },
    ]);
    setNewDiagCode('');
    setNewDiagDesc('');
  };

  const handleRemoveDiagnosis = (idx) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== idx));
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!encounter?._id) return;
    try {
      setSaving(true);
      const res = await encounterApi.saveDraft(encounter._id, {
        vitals,
        chiefComplaint,
        soapNotes,
        diagnoses,
      });
      setEncounter(res);
      alert('Encounter draft saved successfully');
    } catch (err) {
      alert(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Finalize and sign clinical note
  const handleFinalize = async () => {
    if (!encounter?._id) return;
    if (!window.confirm('Finalize and sign this clinical note? This will commit the medical document.')) {
      return;
    }
    try {
      setSaving(true);
      // Save draft first
      await encounterApi.saveDraft(encounter._id, {
        vitals,
        chiefComplaint,
        soapNotes,
        diagnoses,
      });
      const finalized = await encounterApi.finalize(encounter._id);
      setEncounter(finalized);
      alert('Clinical encounter finalized and electronically signed.');
    } catch (err) {
      alert(err.message || 'Failed to finalize');
    } finally {
      setSaving(false);
    }
  };

  // Feature A: Generate AI Summary
  const handleGenerateAISummary = async () => {
    if (!encounter?._id) return;
    try {
      setGeneratingAI(true);
      // Save current notes first
      await encounterApi.saveDraft(encounter._id, {
        vitals,
        chiefComplaint,
        soapNotes,
        diagnoses,
      });
      const res = await encounterApi.generateAISummary(encounter._id);
      setAiSummaryText(res?.generatedText || '');
      setAiSummaryStatus(res?.status || 'unapproved_draft');
    } catch (err) {
      alert(err.message || 'Failed to generate AI summary');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Approve AI Summary
  const handleApproveAISummary = async () => {
    if (!encounter?._id) return;
    try {
      setSaving(true);
      const res = await encounterApi.approveAISummary(encounter._id, aiSummaryText);
      setAiSummaryStatus(res?.status || 'approved');
      alert('AI summary officially approved and incorporated into clinical record.');
    } catch (err) {
      alert(err.message || 'Failed to approve');
    } finally {
      setSaving(false);
    }
  };

  // Issue Prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!encounter?._id) return;
    const targetPatientId = encounter.patientId?._id || encounter.patientId;
    if (!targetPatientId) {
      alert('Patient reference missing from encounter');
      return;
    }
    try {
      await prescriptionApi.create({
        encounterId: encounter._id,
        patientId: targetPatientId,
        medications: rxMeds.filter((m) => m.name),
        generalInstructions: rxInstructions,
      });
      setRxModalOpen(false);
      alert('Prescription created successfully');
    } catch (err) {
      alert(err.message || 'Failed to issue prescription');
    }
  };

  // Order Lab Test
  const handleCreateLabOrder = async (e) => {
    e.preventDefault();
    if (!encounter?._id) return;
    const targetPatientId = encounter.patientId?._id || encounter.patientId;
    if (!targetPatientId) {
      alert('Patient reference missing from encounter');
      return;
    }
    try {
      await labApi.createOrder({
        encounterId: encounter._id,
        patientId: targetPatientId,
        ...labForm,
      });
      setLabModalOpen(false);
      alert('Diagnostic laboratory order submitted to lab queue');
    } catch (err) {
      alert(err.message || 'Failed to order lab test');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton count={5} className="h-16 w-full" />
      </div>
    );
  }

  const patient = encounter?.patientId || {};
  const isFinalized = encounter?.status === 'finalized';

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/doctor/dashboard')}>
            Back to Schedule
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Clinical Encounter Console</h1>
              <Badge variant={isFinalized ? 'success' : 'warning'} size="xs">
                {isFinalized ? 'Signed & Finalized' : 'In-Progress Draft'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono">Reference: {encounter?.encounterNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={Pill} onClick={() => setRxModalOpen(true)}>
            New Prescription
          </Button>
          <Button variant="outline" size="sm" icon={FlaskConical} onClick={() => setLabModalOpen(true)}>
            Order Lab Test
          </Button>
          {!isFinalized && (
            <>
              <Button variant="secondary" size="sm" icon={Save} isLoading={saving} onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button variant="primary" size="sm" icon={FileCheck} isLoading={saving} onClick={handleFinalize}>
                Finalize & Sign Visit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Demographic Banner */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-subtle grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block font-medium uppercase text-[10px]">Patient</span>
          <span className="font-bold text-slate-900 text-sm">
            {patient.firstName} {patient.lastName}
          </span>
          <span className="block text-slate-500 font-mono text-[11px]">{patient.mrn}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase text-[10px]">Age / Gender</span>
          <span className="font-semibold text-slate-800 capitalize">
            {patient.gender} • Blood: {patient.bloodGroup || 'Unknown'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase text-[10px]">Documented Allergies</span>
          {patient.allergies?.length > 0 ? (
            <span className="text-rose-700 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {patient.allergies.join(', ')}
            </span>
          ) : (
            <span className="text-slate-500">No known allergies</span>
          )}
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase text-[10px]">Primary Chronic History</span>
          <span className="text-slate-700 font-medium">
            {patient.medicalHistory?.slice(0, 2).join(', ') || 'None recorded'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase text-[10px]">Insurance</span>
          <span className="text-slate-700 font-medium truncate block">
            {patient.insuranceProvider || 'Self-Pay'}
          </span>
        </div>
      </div>

      {/* Vitals Form Strip */}
      <Card title="Physiological Vitals & Biometrics">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          <Input
            label="BP Sys (mmHg)"
            type="number"
            value={vitals.bloodPressureSys}
            disabled={isFinalized}
            onChange={(e) => setVitals({ ...vitals, bloodPressureSys: e.target.value })}
          />
          <Input
            label="BP Dia (mmHg)"
            type="number"
            value={vitals.bloodPressureDia}
            disabled={isFinalized}
            onChange={(e) => setVitals({ ...vitals, bloodPressureDia: e.target.value })}
          />
          <Input
            label="Pulse (bpm)"
            type="number"
            value={vitals.heartRate}
            disabled={isFinalized}
            onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
          />
          <Input
            label="Temp (°C)"
            type="number"
            step="0.1"
            value={vitals.temperature}
            disabled={isFinalized}
            onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
          />
          <Input
            label="SpO2 (%)"
            type="number"
            value={vitals.oxygenSaturation}
            disabled={isFinalized}
            onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.5"
            value={vitals.weightKg}
            disabled={isFinalized}
            onChange={(e) => handleWeightHeightChange('weightKg', e.target.value)}
          />
          <Input
            label="Height (cm)"
            type="number"
            value={vitals.heightCm}
            disabled={isFinalized}
            onChange={(e) => handleWeightHeightChange('heightCm', e.target.value)}
          />
          <Input
            label="BMI"
            value={vitals.bmi}
            readOnly
            className="bg-slate-50 font-bold text-teal-800"
          />
        </div>
      </Card>

      {/* Structured SOAP Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjective */}
        <Card title="S — Subjective (Patient Complaints & Symptoms)">
          <div className="space-y-3">
            <Input
              label="Chief Presenting Complaint"
              value={chiefComplaint}
              disabled={isFinalized}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Follow-up for hypertension, reports morning dizziness..."
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                History of Present Illness (HPI)
              </label>
              <textarea
                rows={4}
                value={soapNotes.subjective}
                disabled={isFinalized}
                onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans disabled:bg-slate-50"
                placeholder="Patient reports symptoms duration, severity, aggravators, medication compliance..."
              />
            </div>
          </div>
        </Card>

        {/* Objective */}
        <Card title="O — Objective (Clinical Exam & Physical Findings)">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Physical Examination Findings
            </label>
            <textarea
              rows={6}
              value={soapNotes.objective}
              disabled={isFinalized}
              onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans disabled:bg-slate-50"
              placeholder="General appearance, Cardiovascular (S1/S2, murmurs), Respiratory (breath sounds), Abdomen, Extremities..."
            />
          </div>
        </Card>

        {/* Assessment & Diagnoses */}
        <Card title="A — Assessment & Encounter Diagnoses">
          <div className="space-y-3">
            <textarea
              rows={3}
              value={soapNotes.assessment}
              disabled={isFinalized}
              onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans disabled:bg-slate-50"
              placeholder="Physician clinical impression and differential analysis..."
            />

            {/* Diagnoses List */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">ICD Diagnoses</h5>
              <div className="space-y-1.5">
                {diagnoses.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-mono font-bold text-teal-800 bg-teal-100/60 px-1.5 py-0.5 rounded text-[10px] mr-2">
                        {d.code}
                      </span>
                      <span className="font-semibold text-slate-800">{d.description}</span>
                      <span className="text-[10px] text-slate-400 ml-2 capitalize">({d.type})</span>
                    </div>
                    {!isFinalized && (
                      <button onClick={() => handleRemoveDiagnosis(idx)} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!isFinalized && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="ICD Code (e.g. I10)"
                    value={newDiagCode}
                    onChange={(e) => setNewDiagCode(e.target.value)}
                    className="w-28 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 uppercase font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Diagnosis description..."
                    value={newDiagDesc}
                    onChange={(e) => setNewDiagDesc(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                  <Button variant="outline" size="sm" icon={Plus} type="button" onClick={handleAddDiagnosis}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Plan & Follow-up */}
        <Card title="P — Plan & Therapeutic Orders">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Care Plan, Diagnostic Testing & Patient Instructions
            </label>
            <textarea
              rows={6}
              value={soapNotes.plan}
              disabled={isFinalized}
              onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans disabled:bg-slate-50"
              placeholder="Medication regimen adjustments, diagnostic orders, lifestyle counseling, interval to follow-up..."
            />
          </div>
        </Card>
      </div>

      {/* Feature A: Clinician-Reviewed AI Summary */}
      <Card
        title="AI-Assisted Clinical Visit Summary"
        subtitle="Provider-independent clinical extraction based strictly on entered notes"
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            isLoading={generatingAI}
            onClick={handleGenerateAISummary}
          >
            Generate AI Summary
          </Button>
        }
      >
        {aiSummaryStatus !== 'none' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant={aiSummaryStatus === 'approved_by_clinician' ? 'success' : 'warning'}
                size="sm"
              >
                {aiSummaryStatus === 'approved_by_clinician'
                  ? 'Approved by Clinician'
                  : 'Unapproved AI Draft — Requires Clinician Signature'}
              </Badge>

              {aiSummaryStatus === 'unapproved_draft' && (
                <Button variant="primary" size="sm" icon={CheckCircle} onClick={handleApproveAISummary}>
                  Approve & Sign Summary
                </Button>
              )}
            </div>

            <textarea
              rows={5}
              value={aiSummaryText}
              disabled={isFinalized}
              onChange={(e) => setAiSummaryText(e.target.value)}
              className="w-full text-xs p-3 border border-teal-200 bg-teal-50/20 rounded-lg font-mono leading-relaxed"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click "Generate AI Summary" to synthesize a concise, structured review from your clinical notes above.
          </p>
        )}
      </Card>

      {/* Prescription Creator Modal */}
      <Modal
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Issue Clinical Prescription"
        subtitle={`Patient: ${patient.firstName} ${patient.lastName} (${patient.mrn})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Medications</h5>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                type="button"
                onClick={() =>
                  setRxMeds([
                    ...rxMeds,
                    { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', instructions: '' },
                  ])
                }
              >
                Add Medication
              </Button>
            </div>

            {rxMeds.map((med, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Medication Name"
                    placeholder="e.g. Lisinopril"
                    value={med.name}
                    onChange={(e) => {
                      const copy = [...rxMeds];
                      copy[idx].name = e.target.value;
                      setRxMeds(copy);
                    }}
                    required
                  />
                  <Input
                    label="Strength / Dosage"
                    placeholder="e.g. 20 mg"
                    value={med.dosage}
                    onChange={(e) => {
                      const copy = [...rxMeds];
                      copy[idx].dosage = e.target.value;
                      setRxMeds(copy);
                    }}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Frequency"
                    placeholder="e.g. Twice daily with meals"
                    value={med.frequency}
                    onChange={(e) => {
                      const copy = [...rxMeds];
                      copy[idx].frequency = e.target.value;
                      setRxMeds(copy);
                    }}
                  />
                  <Input
                    label="Duration"
                    placeholder="e.g. 30 days"
                    value={med.duration}
                    onChange={(e) => {
                      const copy = [...rxMeds];
                      copy[idx].duration = e.target.value;
                      setRxMeds(copy);
                    }}
                  />
                </div>
              </div>
            ))}

            <Input
              label="Doctor's General Instructions"
              placeholder="e.g. Low sodium diet, take with ample water..."
              value={rxInstructions}
              onChange={(e) => setRxInstructions(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setRxModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lab Order Modal */}
      <Modal
        isOpen={labModalOpen}
        onClose={() => setLabModalOpen(false)}
        title="Order Diagnostic Laboratory Investigation"
        subtitle={`Patient: ${patient.firstName} ${patient.lastName}`}
      >
        <form onSubmit={handleCreateLabOrder} className="space-y-4">
          <Select
            label="Laboratory Test"
            value={labForm.testCode}
            onChange={(e) => {
              const code = e.target.value;
              const tests = {
                'CBC-DIFF': { name: 'Complete Blood Count (CBC) with Differential', cat: 'Hematology' },
                'LAB-CMP': { name: 'Comprehensive Metabolic Panel (CMP)', cat: 'Biochemistry' },
                'LAB-LIPID': { name: 'Lipid Cardiovascular Profile', cat: 'Biochemistry' },
                'HBA1C': { name: 'Glycated Hemoglobin (HbA1c)', cat: 'Biochemistry' },
                'URINALYSIS': { name: 'Routine Clinical Urinalysis', cat: 'Urinalysis' },
              };
              setLabForm({
                ...labForm,
                testCode: code,
                testName: tests[code]?.name || code,
                category: tests[code]?.cat || 'Biochemistry',
              });
            }}
            options={[
              { value: 'CBC-DIFF', label: 'Complete Blood Count (CBC) with Differential' },
              { value: 'LAB-CMP', label: 'Comprehensive Metabolic Panel (CMP)' },
              { value: 'LAB-LIPID', label: 'Lipid Cardiovascular Profile' },
              { value: 'HBA1C', label: 'Glycated Hemoglobin (HbA1c)' },
              { value: 'URINALYSIS', label: 'Routine Clinical Urinalysis' },
            ]}
          />

          <Select
            label="Clinical Urgency"
            value={labForm.priority}
            onChange={(e) => setLabForm({ ...labForm, priority: e.target.value })}
            options={[
              { value: 'routine', label: 'Routine' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'stat', label: 'STAT (Immediate Analysis)' },
            ]}
          />

          <Input
            label="Clinical Indication / Physician Notes"
            placeholder="Reason for investigation..."
            value={labForm.clinicalNotes}
            onChange={(e) => setLabForm({ ...labForm, clinicalNotes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setLabModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit to Lab Work Queue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
