import React, { useState, useEffect } from 'react';
import { billingApi, patientApi } from '../../api/index.js';
import { Card } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Input } from '../../components/common/Input.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { InvoicePrintModal } from '../../components/printables/InvoicePrintModal.jsx';
import { Receipt, DollarSign, Plus, Printer, Trash2, CheckCircle2 } from 'lucide-react';

export const BillingManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Print Modal
  const [printInvoice, setPrintInvoice] = useState(null);

  // Create Invoice Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([
    { description: 'Physician Consultation', category: 'consultation', quantity: 1, unitPrice: 90 },
  ]);
  const [discount, setDiscount] = useState(0);

  // Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [payRef, setPayRef] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invList, patientList] = await Promise.all([
        billingApi.listInvoices(),
        patientApi.list('limit=100'),
      ]);
      setInvoices(invList || []);
      setPatients(patientList || []);
      if (patientList?.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patientList[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const items = invoiceItems.map((it) => ({
        ...it,
        amount: Number(it.quantity) * Number(it.unitPrice),
      }));

      await billingApi.createInvoice({
        patientId: selectedPatientId,
        items,
        discount: Number(discount),
      });

      setCreateModalOpen(false);
      setInvoiceItems([{ description: 'Physician Consultation', category: 'consultation', quantity: 1, unitPrice: 90 }]);
      fetchInvoices();
      alert('Invoice created successfully');
    } catch (err) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;
    setSubmitting(true);
    try {
      await billingApi.recordPayment(activeInvoice._id, {
        amount: Number(payAmount),
        method: payMethod,
        transactionReference: payRef,
      });
      setPayModalOpen(false);
      fetchInvoices();
      alert('Payment successfully posted');
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = {
    paid: 'success',
    partially_paid: 'warning',
    pending: 'danger',
    cancelled: 'slate',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Billing & Invoicing Operations</h1>
          <p className="text-xs text-slate-500 mt-0.5">Post patient charges, process copays, and generate official receipts</p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          Create New Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6">
                    <Skeleton count={4} className="h-10 w-full" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No billing invoices recorded.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const p = inv.patientId || {};
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.mrn}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">
                        ${Number(inv.paidAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                        ${Number(inv.balanceAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant[inv.status] || 'slate'}>
                          {inv.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {inv.balanceAmount > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={DollarSign}
                            onClick={() => {
                              setActiveInvoice(inv);
                              setPayAmount(inv.balanceAmount);
                              setPayModalOpen(true);
                            }}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Printer}
                          onClick={() => setPrintInvoice(inv)}
                        >
                          Print
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Patient Clinic Invoice"
        subtitle="Itemize consultations, procedural, and laboratory charges"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <Select
            label="Billed Patient"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            options={patients.map((p) => ({
              value: p._id,
              label: `${p.firstName} ${p.lastName} (${p.mrn})`,
            }))}
            required
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Line Items</h5>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                type="button"
                onClick={() =>
                  setInvoiceItems([
                    ...invoiceItems,
                    { description: '', category: 'consultation', quantity: 1, unitPrice: 50 },
                  ])
                }
              >
                Add Line Item
              </Button>
            </div>

            {invoiceItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Description (e.g. Consultation, ECG, Blood draw)"
                    value={item.description}
                    onChange={(e) => {
                      const copy = [...invoiceItems];
                      copy[idx].description = e.target.value;
                      setInvoiceItems(copy);
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1.5"
                    required
                  />
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const copy = [...invoiceItems];
                      copy[idx].category = e.target.value;
                      setInvoiceItems(copy);
                    }}
                    className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="lab">Laboratory</option>
                    <option value="procedure">Procedure</option>
                    <option value="other">Other</option>
                  </select>
                  {invoiceItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...invoiceItems];
                      copy[idx].quantity = e.target.value;
                      setInvoiceItems(copy);
                    }}
                    required
                  />
                  <Input
                    label="Unit Price ($)"
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const copy = [...invoiceItems];
                      copy[idx].unitPrice = e.target.value;
                      setInvoiceItems(copy);
                    }}
                    required
                  />
                </div>
              </div>
            ))}

            <Input
              label="Adjustment / Discount ($)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Record Payment / Copay"
        subtitle={`Invoice: ${activeInvoice?.invoiceNumber} • Remaining Balance: $${Number(activeInvoice?.balanceAmount || 0).toFixed(2)}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            required
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Debit / Credit Card' },
              { value: 'insurance', label: 'Insurance Remittance' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />

          <Input
            label="Transaction / Reference ID"
            placeholder="e.g. VISA_AUTH_99214"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={submitting}>
              Post Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Print Modal */}
      <InvoicePrintModal
        isOpen={!!printInvoice}
        onClose={() => setPrintInvoice(null)}
        invoice={printInvoice}
      />
    </div>
  );
};
