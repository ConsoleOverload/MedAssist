import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Printer, Receipt, CheckCircle, Clock } from 'lucide-react';

export const InvoicePrintModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = invoice.patientId || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clinic Invoice & Receipt Preview"
      subtitle={`Invoice #${invoice.invoiceNumber}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Statement / Receipt
          </Button>
        </div>
      }
    >
      <div className="p-8 bg-white border border-slate-200 rounded-xl print-card font-sans text-slate-800">
        {/* Billing Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">MedAssist Billing Operations</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tax ID: 99-841920-X • Accounts Receivable</p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                invoice.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : invoice.status === 'partially_paid'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {invoice.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {invoice.status.replace('_', ' ')}
            </span>
            <p className="text-xs text-slate-500 mt-1">Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Billing Details */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Billed To</span>
            <span className="font-semibold text-slate-900 text-sm">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">MRN</span>
            <span className="font-semibold text-slate-900">{patient.mrn}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Insurance Provider</span>
            <span className="font-semibold text-slate-900">{patient.insuranceProvider || 'Self-Pay'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">Policy Number</span>
            <span className="font-semibold text-slate-900">{patient.insurancePolicyNumber || 'N/A'}</span>
          </div>
        </div>

        {/* Itemized Line Table */}
        <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200 rounded-lg overflow-hidden mb-6">
          <thead className="bg-slate-100/80 font-semibold text-slate-700">
            <tr>
              <th className="py-2.5 px-3">Service / Charge Description</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items?.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50">
                <td className="py-3 px-3 font-semibold text-slate-900">{item.description}</td>
                <td className="py-3 px-3 capitalize text-slate-600">{item.category}</td>
                <td className="py-3 px-3 text-center text-slate-700">{item.quantity}</td>
                <td className="py-3 px-3 text-right text-slate-700">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-semibold text-slate-900">${Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">${Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount / Adjustment:</span>
                <span>-${Number(invoice.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-2">
              <span>Total Charges:</span>
              <span>${Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Paid / Copay:</span>
              <span className="font-semibold text-emerald-700">-${Number(invoice.paidAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold text-sm border-t border-slate-200 pt-2">
              <span>Balance Due:</span>
              <span>${Number(invoice.balanceAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payments Recorded Table */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mb-6 pt-4 border-t border-slate-200">
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Recorded Payments</h5>
            <div className="space-y-1.5 text-xs">
              {invoice.payments.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
                  <span>
                    Receipt <strong>{p.receiptNumber}</strong> • Method: <span className="capitalize">{p.method}</span> • {new Date(p.paidAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-emerald-700">+${Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Notice */}
        <div className="text-[10px] text-slate-400 text-center pt-6 border-t border-slate-200">
          Payment is due within 14 days of invoice date. For billing questions or insurance billing adjustments, please contact billing@medassist.local.
        </div>
      </div>
    </Modal>
  );
};
