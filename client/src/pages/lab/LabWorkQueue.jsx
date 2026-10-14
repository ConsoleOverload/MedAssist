import React, { useState, useEffect } from 'react';
import { labApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { LabReportPrintModal } from '../../components/printables/LabReportPrintModal.jsx';
import {
  FlaskConical,
  TestTube,
  Play,
  CheckCircle,
  Share2,
  Printer,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const LabWorkQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Sample Collection Modal
  const [collectModalOrder, setCollectModalOrder] = useState(null);
  const [accessionInput, setAccessionInput] = useState('');

  // Result Entry Modal
  const [entryModalOrder, setEntryModalOrder] = useState(null);
  const [testResults, setTestResults] = useState([
    { parameter: '', value: '', unit: '', referenceRange: '', flag: 'normal' },
  ]);
  const [technicianNotes, setTechnicianNotes] = useState('');

  // Print Report Modal
  const [printOrder, setPrintOrder] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const res = await labApi.listOrders(params.toString());
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Action 1: Collect Sample
  const handleCollectSample = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labApi.collectSample(collectModalOrder._id, accessionInput);
      setCollectModalOrder(null);
      setAccessionInput('');
      fetchOrders();
      alert('Sample collected and accession recorded');
    } catch (err) {
      alert(err.message || 'Sample collection failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Action 2: Start Processing
  const handleStartProcessing = async (orderId) => {
    try {
      await labApi.startProcessing(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to start processing');
    }
  };

  // Action 3: Enter Results
  const handleOpenResultEntry = (order) => {
    setEntryModalOrder(order);
    if (order.results && order.results.length > 0) {
      setTestResults(order.results);
    } else {
      // Default common templates based on testCode
      if (order.testCode === 'HBA1C') {
        setTestResults([
          { parameter: 'Hemoglobin A1c', value: '', unit: '%', referenceRange: '4.0 - 5.6', flag: 'normal' },
          { parameter: 'Estimated Average Glucose', value: '', unit: 'mg/dL', referenceRange: '70 - 126', flag: 'normal' },
        ]);
      } else if (order.testCode === 'LAB-CMP') {
        setTestResults([
          { parameter: 'Fasting Glucose', value: '', unit: 'mg/dL', referenceRange: '70 - 99', flag: 'normal' },
          { parameter: 'BUN', value: '', unit: 'mg/dL', referenceRange: '7 - 20', flag: 'normal' },
          { parameter: 'Serum Creatinine', value: '', unit: 'mg/dL', referenceRange: '0.7 - 1.3', flag: 'normal' },
          { parameter: 'eGFR', value: '', unit: 'mL/min/1.73m²', referenceRange: '> 60', flag: 'normal' },
          { parameter: 'Sodium', value: '', unit: 'mmol/L', referenceRange: '136 - 145', flag: 'normal' },
          { parameter: 'Potassium', value: '', unit: 'mmol/L', referenceRange: '3.5 - 5.1', flag: 'normal' },
        ]);
      } else {
        setTestResults([
          { parameter: 'Diagnostic Analyte', value: '', unit: 'mg/dL', referenceRange: 'Normal', flag: 'normal' },
        ]);
      }
    }
    setTechnicianNotes(order.technicianNotes || '');
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labApi.enterResults(entryModalOrder._id, {
        results: testResults,
        technicianNotes,
      });
      setEntryModalOrder(null);
      fetchOrders();
      alert('Test results submitted for clinical pathologist verification');
    } catch (err) {
      alert(err.message || 'Result submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Action 4: Clinical Verification
  const handleVerifyResults = async (orderId) => {
    try {
      await labApi.verifyResults(orderId);
      fetchOrders();
      alert('Diagnostic report verified by clinical team');
    } catch (err) {
      alert(err.message || 'Verification failed');
    }
  };

  // Action 5: Release to Patient
  const handleReleaseResults = async (orderId) => {
    try {
      await labApi.releaseResults(orderId);
      fetchOrders();
      alert('Results released to patient portal with alert notification sent');
    } catch (err) {
      alert(err.message || 'Release failed');
    }
  };

  const statusVariants = {
    ordered: 'blue',
    sample_collected: 'warning',
    processing: 'purple',
    completed_pending_verification: 'warning',
    verified: 'teal',
    released: 'success',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Laboratory Operations & Work Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">End-to-end diagnostic workflow: sample accessioning, result entry, verification, and patient release</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOrders}>
          Refresh Queue
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit text-xs font-medium">
        {[
          { label: 'All Orders', value: '' },
          { label: '1. Ordered (Pending Sample)', value: 'ordered' },
          { label: '2. Sample Collected', value: 'sample_collected' },
          { label: '3. In Processing', value: 'processing' },
          { label: '4. Pending Verification', value: 'completed_pending_verification' },
          { label: '5. Verified', value: 'verified' },
          { label: '6. Released to Patient', value: 'released' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === tab.value
                ? 'bg-white text-slate-900 font-bold shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lab Queue Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Order / Accession</th>
                <th className="py-3 px-4">Test Description</th>
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Specimen Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Lifecycle State</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <Skeleton count={4} className="h-10 w-full" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No laboratory orders currently in this status stage.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const p = ord.patientId || {};
                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">{ord.orderNumber}</span>
                        {ord.accessionNumber ? (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                            {ord.accessionNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No accession</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{ord.testName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ord.testCode} • {ord.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.mrn}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{ord.sampleType}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                            ord.priority === 'stat'
                              ? 'bg-rose-100 text-rose-800'
                              : ord.priority === 'urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ord.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariants[ord.status] || 'slate'}>
                          {ord.status?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* Progressive Workflow Buttons */}
                        {ord.status === 'ordered' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={TestTube}
                            onClick={() => {
                              setCollectModalOrder(ord);
                              setAccessionInput(`ACC-${Date.now().toString().slice(-5)}`);
                            }}
                          >
                            Collect Sample
                          </Button>
                        )}

                        {ord.status === 'sample_collected' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Play}
                            onClick={() => handleStartProcessing(ord._id)}
                          >
                            Start Processing
                          </Button>
                        )}

                        {ord.status === 'processing' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={FlaskConical}
                            onClick={() => handleOpenResultEntry(ord)}
                          >
                            Enter Results
                          </Button>
                        )}

                        {ord.status === 'completed_pending_verification' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleVerifyResults(ord._id)}
                          >
                            Verify Results
                          </Button>
                        )}

                        {ord.status === 'verified' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Share2}
                            onClick={() => handleReleaseResults(ord._id)}
                          >
                            Release to Patient
                          </Button>
                        )}

                        {(ord.status === 'verified' || ord.status === 'released') && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Printer}
                            onClick={() => setPrintOrder(ord)}
                          >
                            Print Report
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sample Collection Modal */}
      <Modal
        isOpen={!!collectModalOrder}
        onClose={() => setCollectModalOrder(null)}
        title="Sample Collection & Barcode Accessioning"
        subtitle={`Order: ${collectModalOrder?.orderNumber} • Specimen: ${collectModalOrder?.sampleType}`}
      >
        <form onSubmit={handleCollectSample} className="space-y-4">
          <Input
            label="Accession Identifier / Barcode"
            value={accessionInput}
            onChange={(e) => setAccessionInput(e.target.value.toUpperCase())}
            placeholder="ACC-89210"
            required
          />
          <div className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-lg text-xs">
            Confirm patient identity ({collectModalOrder?.patientId?.firstName} {collectModalOrder?.patientId?.lastName}) and label primary tube before accessioning.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCollectModalOrder(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Confirm Sample Accession
            </Button>
          </div>
        </form>
      </Modal>

      {/* Result Entry Sheet Modal */}
      <Modal
        isOpen={!!entryModalOrder}
        onClose={() => setEntryModalOrder(null)}
        title="Laboratory Test Result Entry Sheet"
        subtitle={`Test: ${entryModalOrder?.testName} (${entryModalOrder?.testCode})`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitResults} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Analytes & Observations</h5>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                type="button"
                onClick={() =>
                  setTestResults([
                    ...testResults,
                    { parameter: '', value: '', unit: '', referenceRange: '', flag: 'normal' },
                  ])
                }
              >
                Add Analyte
              </Button>
            </div>

            {testResults.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Parameter / Analyte"
                      placeholder="e.g. Total Cholesterol"
                      value={item.parameter}
                      onChange={(e) => {
                        const copy = [...testResults];
                        copy[idx].parameter = e.target.value;
                        setTestResults(copy);
                      }}
                      required
                    />
                  </div>
                  <Input
                    label="Observed Value"
                    placeholder="e.g. 195"
                    value={item.value}
                    onChange={(e) => {
                      const copy = [...testResults];
                      copy[idx].value = e.target.value;
                      setTestResults(copy);
                    }}
                    required
                  />
                  <Input
                    label="Units"
                    placeholder="mg/dL"
                    value={item.unit}
                    onChange={(e) => {
                      const copy = [...testResults];
                      copy[idx].unit = e.target.value;
                      setTestResults(copy);
                    }}
                  />
                  <Input
                    label="Reference Range"
                    placeholder="< 200"
                    value={item.referenceRange}
                    onChange={(e) => {
                      const copy = [...testResults];
                      copy[idx].referenceRange = e.target.value;
                      setTestResults(copy);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">Flag:</span>
                    <select
                      value={item.flag}
                      onChange={(e) => {
                        const copy = [...testResults];
                        copy[idx].flag = e.target.value;
                        setTestResults(copy);
                      }}
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium"
                    >
                      <option value="normal">Normal</option>
                      <option value="abnormal">Abnormal</option>
                      <option value="critical">Critical Panic Value</option>
                    </select>
                  </div>

                  {testResults.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTestResults(testResults.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Input
              label="Technologist Notes / Analyzer Remarks"
              placeholder="e.g. Roche Cobas 6000 validated, control runs acceptable"
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setEntryModalOrder(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Submit Results for Clinical Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diagnostic Report Print Modal */}
      <LabReportPrintModal
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
        report={printOrder}
      />
    </div>
  );
};
