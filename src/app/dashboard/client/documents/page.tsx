'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';

type Invoice = {
  id: string;
  invoice_number: string;
  amount_ttc: number;
  status: string;
  issued_at: string;
  amount_ht: number;
  bookings: {
    start_time: string;
    service_formula: string;
    beneficiaries: { first_name: string; last_name: string };
  };
  client: {
    full_name: string;
    billing_address: string;
    billing_postal_code: string;
    billing_city: string;
  };
};

export default function DocumentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase
          .from('invoices')
          .select(`
            *,
            client:client_id(full_name, billing_address, billing_postal_code, billing_city),
            bookings:booking_id(start_time, service_formula, beneficiaries(first_name, last_name))
          `)
          .eq('client_id', userData.user.id)
          .order('issued_at', { ascending: false });

        if (data) setInvoices(data as unknown as Invoice[]);
      }
      setLoading(false);
    };
    fetchInvoices();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8">
        Factures & Documents
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-sage-200 text-center">
          <p className="text-forest-800">Aucune facture trouvée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-100 border-b border-sage-200">
                <th className="p-4 font-bold text-forest-900">Numéro</th>
                <th className="p-4 font-bold text-forest-900">Date d&apos;émission</th>
                <th className="p-4 font-bold text-forest-900">Montant TTC</th>
                <th className="p-4 font-bold text-forest-900">Statut</th>
                <th className="p-4 font-bold text-forest-900 text-right">Document</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-sage-200 last:border-0 hover:bg-mint-100/50">
                  <td className="p-4 font-bold text-forest-800">{inv.invoice_number}</td>
                  <td className="p-4 text-forest-800">{format(new Date(inv.issued_at), 'dd MMM yyyy', { locale: fr })}</td>
                  <td className="p-4 font-bold text-forest-800">{inv.amount_ttc.toFixed(2)} €</td>
                  <td className="p-4">
                    {inv.status === 'paid' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded text-xs font-bold border border-sage-200">Payée</span>}
                    {inv.status === 'unpaid' && <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded text-xs font-bold border border-terracotta-500/50">À payer</span>}
                    {inv.status === 'cesu_processing' && <span className="bg-amber-500/20 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-500/50">CESU en cours</span>}
                  </td>
                  <td className="p-4 text-right">
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
                      <button className="inline-flex items-center gap-2 text-sm text-sage-500 font-bold hover:underline">
                        <Download className="w-4 h-4" /> PDF
                      </button>
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