'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Invoice = {
  id: string;
  invoice_number: string | null;
  client_id: string;
  booking_id: string;
  status: string;
  issue_date: string | null;
  due_date: string;
  payment_method: string | null;
  payment_date: string | null;
  items: Record<string, unknown>[];
  total_ht: number;
  vat_rate: number;
  total_ttc: number;
  provider_snapshot: Record<string, unknown>;
  client_snapshot: Record<string, unknown>;
  created_at: string;
  bookings: {
    start_time: string;
    service_formula: string;
    beneficiaries: { first_name: string; last_name: string };
  };
};

type UninvoicedBooking = {
  id: string;
  client_id: string;
  start_time: string;
  service_formula: string;
  hourly_rate: number;
  total_price: number;
  client: { full_name: string; billing_address: string; billing_postal_code: string; billing_city: string };
  beneficiaries: { first_name: string; last_name: string };
};

export default function AdminFacturationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uninvoiced, setUninvoiced] = useState<UninvoicedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const supabase = createClient();

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        bookings:booking_id(start_time, service_formula, beneficiaries(first_name, last_name))
      `)
      .order('created_at', { ascending: false });

    if (data) setInvoices(data as unknown as Invoice[]);
  };

  const fetchUninvoiced = async () => {
    // Find bookings that are completed and do not have an invoice
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, client_id, start_time, service_formula, hourly_rate, total_price,
        client:client_id(full_name, billing_address, billing_postal_code, billing_city),
        beneficiaries:beneficiary_id(first_name, last_name),
        invoices(id)
      `)
      .eq('status', 'completed');

    if (data) {
      // Filter out those that already have an invoice
      const filtered = data.filter((b: any) => b.invoices.length === 0);
      setUninvoiced(filtered as unknown as UninvoicedBooking[]);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await fetchInvoices();
      await fetchUninvoiced();
      setLoading(false);
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateDraft = async (booking: UninvoicedBooking) => {
    // Fetch current provider settings
    const { data: providerData } = await supabase.from('provider_settings').select('*').single();
    if (!providerData) {
      alert("Veuillez d'abord configurer les paramètres de l'entreprise.");
      return;
    }

    const items = [
      {
        description: `Prestation de répit - ${booking.service_formula}`,
        quantity: 1,
        unit_price: booking.total_price,
        total: booking.total_price
      }
    ];

    const { error } = await supabase.from('invoices').insert([{
      client_id: booking.client_id,
      booking_id: booking.id,
      status: 'draft',
      items: items,
      total_ht: booking.total_price,
      vat_rate: 0,
      total_ttc: booking.total_price,
      provider_snapshot: providerData,
      client_snapshot: booking.client
    }]);

    if (!error) {
      fetchInvoices();
      fetchUninvoiced();
      setIsGeneratorOpen(false);
    } else {
      alert("Erreur lors de la création du brouillon.");
    }
  };

  const issueInvoice = async (invoiceId: string) => {
    // Generate an invoice number (Format: FA-YYYYMM-XXXX)
    const date = new Date();
    const prefix = `FA-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // Simplistic sequence generation for demo (in production, use a secure sequence)
    const number = `${prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const { error } = await supabase.from('invoices').update({
      status: 'issued',
      invoice_number: number,
      issue_date: date.toISOString().split('T')[0]
    }).eq('id', invoiceId);

    if (!error) {
      fetchInvoices();
    }
  };

  const markAsPaid = async (invoiceId: string, method: string) => {
    const date = new Date();
    const { error } = await supabase.from('invoices').update({
      status: 'paid',
      payment_method: method,
      payment_date: date.toISOString().split('T')[0]
    }).eq('id', invoiceId);

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
        <button
          onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
          className="px-4 py-2 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
        >
          {isGeneratorOpen ? 'Fermer le générateur' : 'Nouvelle facture'}
        </button>
      </div>

      {isGeneratorOpen && (
        <div className="bg-sand-100 p-6 rounded-2xl mb-8 border border-sage-200">
          <h2 className="text-xl font-bold text-forest-900 mb-4">Interventions terminées à facturer</h2>
          {uninvoiced.length === 0 ? (
            <p className="text-forest-800">Aucune intervention en attente de facturation.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {uninvoiced.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border border-sage-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-forest-900">{b.client.full_name}</p>
                    <p className="text-sm text-forest-800">{format(new Date(b.start_time), 'dd MMM yyyy')} - {b.service_formula}</p>
                    <p className="text-sm font-bold text-terracotta-500">{b.total_price.toFixed(2)} €</p>
                  </div>
                  <button onClick={() => generateDraft(b)} className="px-3 py-1 bg-forest-800 text-white rounded font-bold text-sm">
                    Générer Brouillon
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  <td className="p-4 font-bold text-forest-800">{inv.invoice_number || 'BROUILLON'}</td>
                  <td className="p-4 text-forest-800">{(inv.client_snapshot as any)?.full_name || 'Inconnu'}</td>
                  <td className="p-4 font-bold text-forest-800">{inv.total_ttc.toFixed(2)} €</td>
                  <td className="p-4">
                    {inv.status === 'draft' && <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold border border-gray-300">Brouillon</span>}
                    {inv.status === 'issued' && <span className="bg-amber-500/20 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-500/50">Émise (Imp.)</span>}
                    {inv.status === 'paid' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded text-xs font-bold border border-sage-200">Payée</span>}
                    {inv.status === 'cancelled' && <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded text-xs font-bold border border-terracotta-500">Annulée</span>}
                  </td>
                  <td className="p-4 text-right flex gap-3 justify-end items-center flex-wrap">
                    {inv.status === 'draft' && (
                      <button onClick={() => issueInvoice(inv.id)} className="text-sm text-forest-800 font-bold hover:underline">Émettre</button>
                    )}
                    {inv.status === 'issued' && (
                      <div className="flex gap-2">
                        <select onChange={(e) => markAsPaid(inv.id, e.target.value)} defaultValue="" className="text-sm border border-sage-200 rounded p-1">
                          <option value="" disabled>Payer via...</option>
                          <option value="virement">Virement</option>
                          <option value="cesu">CESU</option>
                          <option value="cheque">Chèque</option>
                        </select>
                      </div>
                    )}
                    {(inv.status === 'issued' || inv.status === 'paid') && (
                      <PDFDownloadLink
                        document={<InvoicePDF invoice={inv} />}
                        fileName={`${inv.invoice_number}.pdf`}
                      >
                        <button className="text-sm text-sage-500 font-bold hover:underline">PDF</button>
                      </PDFDownloadLink>
                    )}
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