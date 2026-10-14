import React, { useState, useEffect } from 'react';
import { labApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { LabReportPrintModal } from '../../components/printables/LabReportPrintModal.jsx';
import { FlaskConical, Printer, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const PatientLabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // Backend strictly enforces patient role only gets status=released!
        const res = await labApi.listOrders();
        setReports(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Released Diagnostic Reports</h1>
        <p className="text-xs text-slate-500 mt-0.5">Verified clinical pathology, biochemistry, and hematology investigations</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton count={2} className="h-40 w-full" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-12 text-slate-400 text-xs">
          No diagnostic reports released yet. Results will appear here once verified by clinical laboratory specialists.
        </Card>
      ) : (
        <div className="space-y-6">
          {reports.map((rep) => (
            <Card key={rep._id} className="border-purple-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{rep.testName}</h3>
                      <Badge variant="teal" size="xs">
                        Released
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Order: {rep.orderNumber} • Accession: {rep.accessionNumber || 'N/A'} • Released {new Date(rep.releasedAt || rep.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => setSelectedReport(rep)}
                >
                  Print Full Diagnostic Report
                </Button>
              </div>

              {/* Results Parameter Preview */}
              <div className="py-4 overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Parameter</th>
                      <th className="py-2 px-3">Result Value</th>
                      <th className="py-2 px-3">Units</th>
                      <th className="py-2 px-3">Reference Range</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rep.results?.map((res, i) => (
                      <tr key={i} className={res.flag !== 'normal' ? 'bg-amber-50/30' : ''}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{res.parameter}</td>
                        <td className={`py-2 px-3 font-mono font-bold ${res.flag !== 'normal' ? 'text-rose-600' : 'text-slate-900'}`}>
                          {res.value}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{res.unit}</td>
                        <td className="py-2 px-3 text-slate-500">{res.referenceRange}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              res.flag === 'normal'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {res.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rep.technicianNotes && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <strong>Clinical Remarks:</strong> {rep.technicianNotes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Print Report Modal */}
      <LabReportPrintModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};
