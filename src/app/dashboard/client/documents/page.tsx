'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF, ProviderInfo, InvoiceItem } from '@/components/InvoicePDF';
import { TaxCertificatePDF } from '@/components/TaxCertificatePDF';

type Invoice = {
  id: string;
  invoice_number: string;
  amount_ttc: number;
  amount_ht: number;
  status: string;
  issue_date: string | null;
  created_at: string;
  payment_method: string | null;
  items: InvoiceItem[];
  bookings?: {
    start_time: string;
    service_formula: string;
    beneficiaries?: { first_name: string; last_name: string };
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
  const [providerSettings, setProviderSettings] = useState<ProviderInfo | null>(null);
  const [clientProfile, setClientProfile] = useState<{
    full_name: string | null;
    billing_address: string | null;
    billing_postal_code: string | null;
    billing_city: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Paramètres du prestataire (Inspire Répit)
      const { data: provData } = await supabase
        .from('provider_settings')
        .select('*')
        .maybeSingle();

      if (provData) {
        setProviderSettings(provData as ProviderInfo);
      }

      // 2. Utilisateur connecté
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        // Coordonnées du profil client
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, billing_address, billing_postal_code, billing_city')
          .eq('id', userData.user.id)
          .maybeSingle();

        if (profile) {
          setClientProfile(profile);
        }

        // 3. Factures émises ou payées
        const { data: invData } = await supabase
          .from('invoices')
          .select(`
            *,
            client:client_id(full_name, billing_address, billing_postal_code, billing_city),
            bookings:booking_id(start_time, service_formula, beneficiaries:beneficiary_id(first_name, last_name))
          `)
          .eq('client_id', userData.user.id)
          .neq('status', 'draft')
          .order('created_at', { ascending: false });

        if (invData) {
          setInvoices(invData as unknown as Invoice[]);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const currentYear = new Date().getFullYear();

  // Factures acquittées sur l'année en cours
  const paidInvoicesCurrentYear = invoices.filter(
    (inv) =>
      inv.status === 'paid' &&
      new Date(inv.issue_date || inv.created_at).getFullYear() === currentYear
  );

  const totalPaidFiscal = paidInvoicesCurrentYear.reduce(
    (sum, inv) => sum + (Number(inv.amount_ttc) || 0),
    0
  );

  // Récupération sécurisée des coordonnées client (profil en priorité, sinon facture)
  const invoiceClient = invoices.find((inv) => inv.client?.full_name)?.client;
  const clientInfo = {
    full_name: clientProfile?.full_name || invoiceClient?.full_name || 'Client',
    billing_address: clientProfile?.billing_address || invoiceClient?.billing_address || '',
    billing_postal_code: clientProfile?.billing_postal_code || invoiceClient?.billing_postal_code || '',
    billing_city: clientProfile?.billing_city || invoiceClient?.billing_city || '',
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-forest-900 flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-sage-500" /> Factures & Documents
        </h1>
        <p className="text-sm text-forest-700 mt-1">
          Retrouvez vos factures acquittées et téléchargez vos justificatifs pour votre crédit d&apos;impôt.
        </p>
      </div>

      {/* Bannière Attestation Fiscale Annuelle */}
      <div className="bg-sand-100 p-6 rounded-2xl border border-sage-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider bg-mint-100 px-2.5 py-1 rounded-md border border-sage-200 inline-block">
            Avantage fiscal SAP • 50 %
          </span>
          <h2 className="text-lg font-bold text-forest-900">
            Attestation Fiscale {currentYear}
          </h2>
          <p className="text-xs text-forest-700 max-w-xl">
            Total des prestations acquittées sur l&apos;année :{' '}
            <strong className="text-forest-900">{totalPaidFiscal.toFixed(2)} €</strong> (soit{' '}
            <strong className="text-forest-900">{(totalPaidFiscal * 0.5).toFixed(2)} €</strong> de crédit d&apos;impôt déductible).
          </p>
        </div>

        {paidInvoicesCurrentYear.length > 0 ? (
          <PDFDownloadLink
            document={
              <TaxCertificatePDF
                year={currentYear}
                provider={providerSettings}
                client={clientInfo}
                invoices={paidInvoicesCurrentYear}
                totalAmount={totalPaidFiscal}
              />
            }
            fileName={`attestation-fiscale-${currentYear}.pdf`}
          >
            <button
              type="button"
              className="px-4 py-2.5 bg-forest-800 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-forest-700 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Télécharger l&apos;attestation {currentYear}
            </button>
          </PDFDownloadLink>
        ) : (
          <button
            type="button"
            disabled
            className="px-4 py-2.5 bg-forest-800 text-white text-xs sm:text-sm font-bold rounded-xl opacity-40 cursor-not-allowed flex items-center gap-2 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            Télécharger l&apos;attestation {currentYear}
          </button>
        )}
      </div>

      {/* Tableau des factures */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-sage-200 text-forest-700">
          Chargement de vos documents...
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-sage-200 text-center text-forest-700 space-y-2">
          <FileText className="w-10 h-10 text-sage-500 mx-auto" />
          <h3 className="text-base font-bold text-forest-900">Aucune facture émise pour le moment</h3>
          <p className="text-xs text-forest-700">
            Dès qu&apos;une intervention sera facturée par notre service, votre document apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-sage-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-sand-100/70 border-b border-sage-200">
                  <th className="p-4 font-bold text-forest-900">Numéro</th>
                  <th className="p-4 font-bold text-forest-900">Date</th>
                  <th className="p-4 font-bold text-forest-900">Montant TTC</th>
                  <th className="p-4 font-bold text-forest-900">Statut</th>
                  <th className="p-4 font-bold text-forest-900 text-right">Téléchargement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-200/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-mint-100/40 transition">
                    <td className="p-4 font-bold text-forest-900">
                      {inv.invoice_number || 'FA-En cours'}
                    </td>
                    <td className="p-4 text-forest-800">
                      {format(new Date(inv.issue_date || inv.created_at), 'dd MMMM yyyy', {
                        locale: fr,
                      })}
                    </td>
                    <td className="p-4 font-bold text-forest-900">
                      {Number(inv.amount_ttc).toFixed(2)} €
                    </td>
                    <td className="p-4">
                      {inv.status === 'paid' && (
                        <span className="bg-mint-100 text-forest-900 px-2.5 py-1 rounded-md text-xs font-bold border border-sage-200 inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-sage-500" />
                          Payée {inv.payment_method ? `(${inv.payment_method.toUpperCase()})` : ''}
                        </span>
                      )}
                      {inv.status === 'issued' && (
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          À régler
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {inv.invoice_number && (
                        <PDFDownloadLink
                          document={
                            <InvoicePDF
                              data={{
                                invoiceNumber: inv.invoice_number,
                                issuedAt: inv.issue_date || inv.created_at,
                                clientName: inv.client?.full_name || 'Client',
                                clientAddress: inv.client?.billing_address || '',
                                clientPostalCode: inv.client?.billing_postal_code || '',
                                clientCity: inv.client?.billing_city || '',
                                bookingDate: inv.bookings?.start_time || inv.created_at,
                                formula: inv.bookings?.service_formula || 'Prestation',
                                beneficiaryName: inv.bookings?.beneficiaries
                                  ? `${inv.bookings.beneficiaries.first_name} ${inv.bookings.beneficiaries.last_name}`
                                  : undefined,
                                provider: providerSettings || undefined,
                                items:
                                  inv.items && inv.items.length > 0
                                    ? inv.items
                                    : [
                                        {
                                          description: `Prestation SAP - ${inv.bookings?.service_formula || 'Intervention'}`,
                                          quantity: 1,
                                          unit_price: Number(inv.amount_ttc),
                                          total: Number(inv.amount_ttc),
                                        },
                                      ],
                                amountHT: inv.amount_ht,
                                amountTTC: inv.amount_ttc,
                              }}
                            />
                          }
                          fileName={`${inv.invoice_number}.pdf`}
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sand-100 hover:bg-mint-100 text-forest-900 border border-sage-200 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </PDFDownloadLink>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}