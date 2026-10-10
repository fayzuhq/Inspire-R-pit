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
  issue_date: string;
  total_ht: number;
  provider_snapshot: Record<string, unknown>;
  client_snapshot: Record<string, unknown>;
  items: Record<string, unknown>[];
  bookings: {
    start_time: string;
    service_formula: string;
    beneficiaries: { first_name: string; last_name: string };
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
            bookings:booking_id(start_time, service_formula, beneficiaries(first_name, last_name))
          `)
          .eq('client_id', userData.user.id)
          .in('status', ['issued', 'paid'])
          .order('issue_date', { ascending: false });

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
                  <td className="p-4 text-forest-800">{inv.issue_date ? format(new Date(inv.issue_date), 'dd MMM yyyy', { locale: fr }) : 'N/A'}</td>
                  <td className="p-4 font-bold text-forest-800">{inv.amount_ttc.toFixed(2)} €</td>
                  <td className="p-4">
                    {inv.status === 'paid' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded text-xs font-bold border border-sage-200">Payée</span>}
                    {inv.status === 'issued' && <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded text-xs font-bold border border-terracotta-500/50">À payer</span>}
                  </td>
                  <td className="p-4 text-right">
                    <PDFDownloadLink
                      document={<InvoicePDF invoice={inv} />}
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