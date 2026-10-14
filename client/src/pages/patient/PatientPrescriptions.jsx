import React, { useState, useEffect } from 'react';
import { prescriptionApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { PrescriptionPrintModal } from '../../components/printables/PrescriptionPrintModal.jsx';
import { Pill, Sparkles, Printer, AlertTriangle, ShieldCheck } from 'lucide-react';

const renderMarkdownGuide = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        if (trimmed.startsWith('#')) {
          const cleanHeading = trimmed.replace(/^#+\s*/, '');
          return (
            <h5 key={idx} className="font-bold text-xs text-primary pt-1">
              {cleanHeading}
            </h5>
          );
        }

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);
        const content = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');

        const parts = content.split(/(\*\*.*?\*\*)/g);
        const formattedParts = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-on-surface">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-primary font-bold">•</span>
              <p className="flex-1 text-on-surface-variant">{formattedParts}</p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-on-surface-variant">
            {formattedParts}
          </p>
        );
      })}
    </div>
  );
};

export const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explainingId, setExplainingId] = useState(null);
  const [printRx, setPrintRx] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await prescriptionApi.list();
      setPrescriptions(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleGenerateExplanation = async (rxId) => {
    try {
      setExplainingId(rxId);
      const res = await prescriptionApi.explainAI(rxId);
      setPrescriptions((prev) =>
        prev.map((rx) => (rx._id === rxId ? { ...rx, plainLanguageExplanation: res } : rx))
      );
    } catch (err) {
      alert(err.message || 'Failed to generate plain-language explanation');
    } finally {
      setExplainingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-on-surface">Active Prescriptions & Medication Guidance</h1>
        <p className="text-xs text-outline mt-0.5">Clinician-authorized medication regimens with plain-language explanations</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton count={2} className="h-40 w-full" />
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="text-center py-12 text-outline text-xs">
          No active prescriptions currently on file.
        </Card>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <Card key={rx._id} className="border-surface-container">
              {/* Rx Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-container gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-surface-container text-primary rounded-xl">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface text-sm">
                        Prescription {rx.prescriptionNumber}
                      </h3>
                      <Badge variant="success" size="xs">
                        {rx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-outline">
                      Prescribing Physician: {rx.doctorId?.userId?.name || 'Doctor'} • Issued {new Date(rx.issuedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => setPrintRx(rx)}
                  >
                    Print Rx
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    isLoading={explainingId === rx._id}
                    onClick={() => handleGenerateExplanation(rx._id)}
                  >
                    {rx.plainLanguageExplanation?.text ? 'Re-explain' : 'Explain in Plain Language'}
                  </Button>
                </div>
              </div>

              {/* Medications List */}
              <div className="py-4">
                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2.5">
                  Prescribed Medications ({rx.medications?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rx.medications?.map((med, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface text-sm">{med.name}</span>
                        <span className="font-mono text-primary bg-primary-fixed/50 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-medium mt-1">Schedule: {med.frequency}</p>
                      <p className="text-outline text-[11px]">Duration: {med.duration}</p>
                      {med.instructions && (
                        <p className="text-on-surface-variant italic mt-1 bg-surface-container-lowest p-1.5 rounded border border-surface-container">
                          Note: {med.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature B: AI Plain Language Explanation View */}
              {rx.plainLanguageExplanation?.text && (
                <div className="mt-4 p-4 rounded-xl bg-primary-fixed/20 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Plain-Language Patient Guide</span>
                  </div>
                  <div className="pt-1">
                    {renderMarkdownGuide(rx.plainLanguageExplanation.text)}
                  </div>
                  <p className="text-[10px] text-outline pt-2 border-t border-primary/15 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Educational assistance only. Does not alter doctor-prescribed clinical instructions.</span>
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Print Modal */}
      <PrescriptionPrintModal
        isOpen={!!printRx}
        onClose={() => setPrintRx(null)}
        prescription={printRx}
      />
    </div>
  );
};
