'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';

type Invoice = {
  id: string;
  invoice_number: string;
  client: { full_name: string; billing_address: string; billing_postal_code: string; billing_city: string };
  amount_ht: number;
  amount_ttc: number;
  status: string;
  issued_at: string;
  bookings: {
    start_time: string;
    service_formula: string;
    beneficiaries: { first_name: string; last_name: string };
  };
};

export default function AdminFacturationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id(full_name, billing_address, billing_postal_code, billing_city),
        bookings:booking_id(start_time, service_formula, beneficiaries(first_name, last_name))
      `)
      .order('issued_at', { ascending: false });

    if (data) setInvoices(data as unknown as Invoice[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (!error) {
      fetchInvoices();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans text-forest-900">
          Facturation
        </h1>
        <button className="px-4 py-2 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors">
          Générer une facture (auto)
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-sage-200 text-center">
          <p className="text-forest-800">Aucune facture enregistrée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-100 border-b border-sage-200">
                <th className="p-4 font-bold text-forest-900">Numéro</th>
                <th className="p-4 font-bold text-forest-900">Client</th>
                <th className="p-4 font-bold text-forest-900">Montant</th>
                <th className="p-4 font-bold text-forest-900">Statut</th>
                <th className="p-4 font-bold text-forest-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-sage-200 last:border-0 hover:bg-mint-100/50">
                  <td className="p-4 font-bold text-forest-800">{inv.invoice_number}</td>
                  <td className="p-4 text-forest-800">{inv.client.full_name}</td>
                  <td className="p-4 font-bold text-forest-800">{inv.amount_ttc.toFixed(2)} €</td>
                  <td className="p-4">
                    {inv.status === 'unpaid' && <span className="bg-terracotta-500/10 text-terracotta-600 px-2 py-1 rounded text-xs font-bold border border-terracotta-500/50">En attente</span>}
                    {inv.status === 'cesu_processing' && <span className="bg-amber-500/20 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-500/50">CESU en cours</span>}
                    {inv.status === 'paid' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded text-xs font-bold border border-sage-200">Payée</span>}
                  </td>
                  <td className="p-4 text-right flex gap-3 justify-end items-center">
                    {inv.status !== 'paid' && (
                      <button onClick={() => updateStatus(inv.id, 'paid')} className="text-sm text-sage-500 font-bold hover:underline">Marquer payée</button>
                    )}
                    <PDFDownloadLink
                      document={<InvoicePDF data={{
                        invoiceNumber: inv.invoice_number,
                        issuedAt: inv.issued_at,
                        clientName: inv.client.full_name,
                        clientAddress: inv.client.billing_address,
                        clientPostalCode: inv.client.billing_postal_code,
                        clientCity: inv.client.billing_city,
                        bookingDate: inv.bookings?.start_time || inv.issued_at,
                        formula: inv.bookings?.service_formula || 'Prestation',
                        beneficiaryName: inv.bookings?.beneficiaries ? `${inv.bookings.beneficiaries.first_name} ${inv.bookings.beneficiaries.last_name}` : 'N/A',
                        amountHT: inv.amount_ht,
                        amountTTC: inv.amount_ttc
                      }} />}
                      fileName={`${inv.invoice_number}.pdf`}
                    >
                      <button className="text-sm text-forest-800 font-bold hover:underline">PDF</button>
                    </PDFDownloadLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}