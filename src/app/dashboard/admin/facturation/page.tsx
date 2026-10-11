'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF, ProviderInfo } from '@/components/InvoicePDF';
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  X,
  FileCheck
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CompletedBooking {
  id: string;
  start_time: string;
  end_time: string;
  service_formula: string;
  total_price: number;
  client_id: string;
  client: {
    id: string;
    full_name: string;
    phone: string;
    billing_address?: string;
    billing_postal_code?: string;
    billing_city?: string;
  };
  beneficiary: {
    first_name: string;
    last_name: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  client_id: string;
  booking_id: string | null;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  issue_date: string | null;
  due_date: string;
  payment_method: string | null;
  payment_date: string | null;
  items: InvoiceItem[];
  amount_ht: number;
  amount_ttc: number;
  created_at: string;
  client: {
    full_name: string;
    billing_address: string;
    billing_postal_code: string;
    billing_city: string;
  };
  bookings?: {
    start_time: string;
    service_formula: string;
    beneficiaries?: {
      first_name: string;
      last_name: string;
    };
  };
}

export default function AdminFacturationPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [providerSettings, setProviderSettings] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // État de la modale d'édition / création de brouillon
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);

    // 0. Récupération des paramètres de l'entreprise (Inspire Répit)
    const { data: provData } = await supabase
      .from('provider_settings')
      .select('*')
      .maybeSingle();

    if (provData) {
      setProviderSettings(provData as ProviderInfo);
    }

    // 1. Récupération des factures existantes
    const { data: invData } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id(full_name, billing_address, billing_postal_code, billing_city),
        bookings:booking_id(start_time, service_formula, beneficiaries:beneficiary_id(first_name, last_name))
      `)
      .order('created_at', { ascending: false });

    const currentInvoices = (invData as unknown as Invoice[]) || [];
    setInvoices(currentInvoices);

    // 2. Récupération des interventions terminées par ordre chronologique décroissant
    const { data: bookData } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        service_formula,
        total_price,
        client_id,
        client:client_id(id, full_name, phone, billing_address, billing_postal_code, billing_city),
        beneficiary:beneficiary_id(first_name, last_name)
      `)
      .eq('status', 'completed')
      .order('start_time', { ascending: false });

    if (bookData) {
      const billedBookingIds = new Set(
        currentInvoices.filter((i) => i.booking_id).map((i) => i.booking_id)
      );
      const unbilled = (bookData as unknown as CompletedBooking[]).filter(
        (b) => !billedBookingIds.has(b.id)
      );
      setCompletedBookings(unbilled);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ouvrir l'éditeur pour une nouvelle intervention
  const handleOpenNewFromBooking = (booking: CompletedBooking) => {
    setSaving(false);
    setSelectedBooking(booking);
    setEditingInvoiceId(null);
    setClientId(booking.client_id);
    setClientName(booking.client?.full_name || 'Client');

    const baseItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: `Relais à domicile individualisé - Formule ${booking.service_formula.replace(/_/g, ' ')} (${booking.beneficiary.first_name} ${booking.beneficiary.last_name})`,
      quantity: 1,
      unit_price: Number(booking.total_price) || 0,
      total: Number(booking.total_price) || 0,
    };

    setItems([baseItem]);
    setIsEditorOpen(true);
  };

  // Ouvrir l'éditeur pour modifier un brouillon existant
  const handleOpenEditDraft = (invoice: Invoice) => {
    setSaving(false);
    setEditingInvoiceId(invoice.id);
    setSelectedBooking(null);
    setClientId(invoice.client_id);
    setClientName(invoice.client?.full_name || 'Client');
    setItems(invoice.items && invoice.items.length > 0 ? invoice.items : []);
    setIsEditorOpen(true);
  };

  // Gestion des lignes de facture
  const handleAddItem = (description = 'Prestation complémentaire', unit_price = 0, quantity = 1) => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description,
      quantity,
      unit_price,
      total: quantity * unit_price,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total = Number(updated.quantity) * Number(updated.unit_price);
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const totalCalculated = items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);

  // Sauvegarder en tant que brouillon (draft)
  const handleSaveDraft = async () => {
    if (!clientId) {
      alert('Veuillez sélectionner un client.');
      return;
    }
    setSaving(true);

    try {
      if (editingInvoiceId) {
        // Mise à jour du brouillon existant
        const { error } = await supabase
          .from('invoices')
          .update({
            items,
            amount_ht: totalCalculated,
            amount_ttc: totalCalculated,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingInvoiceId);

        if (error) throw error;
      } else {
        // Création d'un nouveau brouillon
        const { error } = await supabase.from('invoices').insert([
          {
            client_id: clientId,
            booking_id: selectedBooking?.id || null,
            status: 'draft',
            due_date: 'Paiement à réception',
            items,
            amount_ht: totalCalculated,
            vat_rate: 0,
            amount_ttc: totalCalculated,
          },
        ]);

        if (error) throw error;
      }

      setIsEditorOpen(false);
      await loadData();
    } catch (err: unknown) {
      console.error('Erreur Supabase détaillée :', err);
      const errObj = err as { message?: string; details?: string; hint?: string };
      const message = errObj?.message || (err instanceof Error ? err.message : JSON.stringify(err));
      alert(`Erreur d'enregistrement : ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Émettre officiellement la facture
  const handleIssueInvoice = async (invoiceId?: string) => {
    const targetId = invoiceId || editingInvoiceId;
    setSaving(true);
    try {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedNumber = `FA-${yearMonth}-${randomSuffix}`;
      const todayIso = now.toISOString().split('T')[0];

      if (targetId) {
        // Émission d'un brouillon existant
        const { error } = await supabase
          .from('invoices')
          .update({
            status: 'issued',
            invoice_number: generatedNumber,
            issue_date: todayIso,
            items,
            amount_ht: totalCalculated,
            amount_ttc: totalCalculated,
            updated_at: now.toISOString(),
          })
          .eq('id', targetId);

        if (error) throw error;
      } else {
        // Émission directe depuis la modale
        const { error } = await supabase.from('invoices').insert([
          {
            client_id: clientId,
            booking_id: selectedBooking?.id || null,
            status: 'issued',
            invoice_number: generatedNumber,
            issue_date: todayIso,
            due_date: 'Paiement à réception',
            items,
            amount_ht: totalCalculated,
            vat_rate: 0,
            amount_ttc: totalCalculated,
          },
        ]);

        if (error) throw error;
      }

      setIsEditorOpen(false);
      await loadData();
    } catch (err: unknown) {
      console.error('Erreur Supabase émission :', err);
      const errObj = err as { message?: string; details?: string; hint?: string };
      const message = errObj?.message || (err instanceof Error ? err.message : JSON.stringify(err));
      alert(`Erreur lors de l'émission : ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Marquer comme payée avec sélection du moyen
  const handleMarkAsPaid = async (id: string, method: string) => {
    const todayIso = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_method: method,
        payment_date: todayIso,
      })
      .eq('id', id);

    if (!error) {
      await loadData();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sage-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-forest-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-sage-500" /> Facturation & Règlements
          </h1>
          <p className="text-sm text-forest-700 mt-1">
            Générez vos factures SAP, ajoutez les frais réels et suivez les encaissements.
          </p>
        </div>
      </div>

      {/* 1. Interventions terminées en attente de facturation */}
      <div className="bg-sand-100/60 p-5 rounded-2xl border border-sage-200 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-forest-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sage-500" />
            Interventions terminées à facturer ({completedBookings.length})
          </h2>
        </div>

        {completedBookings.length === 0 ? (
          <p className="text-xs sm:text-sm text-forest-700 bg-white p-4 rounded-xl border border-sage-200">
            Toutes les interventions clôturées ont été facturées ou aucune garde terminée n&apos;est disponible.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white p-4 rounded-xl border border-sage-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-forest-800 transition"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-forest-900 text-sm capitalize">
                      {b.beneficiary?.first_name} {b.beneficiary?.last_name}
                    </span>
                    <span className="font-bold text-forest-900 bg-mint-100 px-2 py-0.5 rounded text-xs">
                      {b.total_price} €
                    </span>
                  </div>
                  <div className="text-forest-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sage-500" />
                    {new Date(b.start_time).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    • {new Date(b.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-forest-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sage-500" />
                    Client : {b.client?.full_name}
                  </div>
                  <div className="text-[11px] text-sage-500 font-semibold capitalize">
                    Formule : {b.service_formula.replace(/_/g, ' ')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenNewFromBooking(b)}
                  className="w-full py-2 bg-forest-800 text-white rounded-lg text-xs font-bold hover:bg-forest-700 transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Créer le brouillon de facture
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Tableau général des factures */}
      <div className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-forest-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-sage-500" />
          Factures enregistrées
        </h2>

        {loading ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-sage-200 text-forest-700">
            Chargement des factures...
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-sage-200 text-center text-forest-700 space-y-2">
            <FileText className="w-10 h-10 text-sage-500 mx-auto" />
            <h3 className="text-base font-bold text-forest-900">Aucune facture enregistrée</h3>
            <p className="text-xs text-forest-700">
              Sélectionnez une intervention terminée ci-dessus pour préparer une première facture.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xs border border-sage-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-sand-100/70 border-b border-sage-200">
                    <th className="p-4 font-bold text-forest-900">Numéro</th>
                    <th className="p-4 font-bold text-forest-900">Client</th>
                    <th className="p-4 font-bold text-forest-900">Montant TTC</th>
                    <th className="p-4 font-bold text-forest-900">Statut</th>
                    <th className="p-4 font-bold text-forest-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-200/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-mint-100/40 transition">
                      <td className="p-4 font-bold text-forest-900">
                        {inv.invoice_number ? (
                          <span>{inv.invoice_number}</span>
                        ) : (
                          <span className="text-xs bg-sand-100 text-forest-700 px-2 py-0.5 rounded border border-sage-200">
                            Brouillon
                          </span>
                        )}
                        <span className="block text-[11px] font-normal text-forest-700">
                          {inv.issue_date || new Date(inv.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      <td className="p-4 text-forest-800">
                        <span className="font-medium block">{inv.client?.full_name}</span>
                        <span className="text-xs text-forest-700">
                          {inv.client?.billing_city || 'Grenoble'}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-forest-900">
                        {inv.amount_ttc ? Number(inv.amount_ttc).toFixed(2) : '0.00'} €
                        <span className="block text-[11px] font-normal text-forest-700">TVA 0%</span>
                      </td>

                      <td className="p-4">
                        {inv.status === 'draft' && (
                          <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
                            Brouillon
                          </span>
                        )}
                        {inv.status === 'issued' && (
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">
                            À régler
                          </span>
                        )}
                        {inv.status === 'paid' && (
                          <span className="bg-mint-100 text-forest-900 px-2.5 py-1 rounded-md text-xs font-bold border border-sage-200 flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3.5 h-3.5 text-sage-500" />
                            Payée {inv.payment_method ? `(${inv.payment_method.toUpperCase()})` : ''}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Actions sur brouillon */}
                          {inv.status === 'draft' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditDraft(inv)}
                                className="px-2.5 py-1 text-xs font-semibold text-forest-800 bg-sand-100 hover:bg-sage-200 rounded-lg border border-sage-200 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Modifier
                              </button>
                              <button
                                type="button"
                                onClick={() => handleIssueInvoice(inv.id)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-forest-800 hover:bg-forest-700 rounded-lg transition cursor-pointer"
                              >
                                Émettre
                              </button>
                            </>
                          )}

                          {/* Actions sur facture émise */}
                          {inv.status === 'issued' && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(inv.id, 'virement')}
                                className="px-2 py-1 text-[11px] font-semibold text-forest-800 bg-mint-100 hover:bg-mint-200 rounded border border-sage-200 cursor-pointer"
                              >
                                Payée (Virement)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(inv.id, 'cesu')}
                                className="px-2 py-1 text-[11px] font-semibold text-forest-800 bg-sand-100 hover:bg-sand-200 rounded border border-sage-200 cursor-pointer"
                              >
                                Payée (CESU)
                              </button>
                            </div>
                          )}

                          {/* Téléchargement PDF avec données réelles de provider_settings et items */}
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
                                      : 'Bénéficiaire',
                                    provider: providerSettings || undefined,
                                    items: inv.items && inv.items.length > 0 ? inv.items : [
                                      {
                                        description: `Relais à domicile individualisé - Formule ${inv.bookings?.service_formula?.replace(/_/g, ' ') || 'Prestation'}`,
                                        quantity: 1,
                                        unit_price: Number(inv.amount_ttc),
                                        total: Number(inv.amount_ttc)
                                      }
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
                                className="px-2.5 py-1 text-xs font-bold text-forest-800 bg-sand-100 hover:bg-mint-100 rounded-lg border border-sage-200 transition cursor-pointer"
                              >
                                PDF
                              </button>
                            </PDFDownloadLink>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODALE D'ÉDITION DE FACTURE / BROUILLON */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-sage-200 shadow-2xl space-y-6 my-auto">
            <div className="flex justify-between items-start border-b border-sage-200 pb-3">
              <div>
                <h3 className="text-xl font-bold font-sans text-forest-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-sage-500" />
                  {editingInvoiceId ? 'Modifier le brouillon' : 'Préparer la facture'}
                </h3>
                <p className="text-xs text-forest-700 mt-1">Client : {clientName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSaving(false);
                  setIsEditorOpen(false);
                }}
                className="text-forest-700 hover:text-forest-900 p-1 rounded-lg hover:bg-sand-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Liste des lignes de facture */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                  Détail des prestations & frais
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddItem('Indemnités kilométriques (trajets bénéficiaire)', 0.45, 15)}
                    className="text-xs font-semibold px-2.5 py-1 bg-mint-100 text-forest-900 rounded-md border border-sage-200 hover:bg-mint-200 cursor-pointer"
                  >
                    + Kilomètres (0.45€)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItem('Frais annexes (repas / activité)', 10, 1)}
                    className="text-xs font-semibold px-2.5 py-1 bg-sand-100 text-forest-900 rounded-md border border-sage-200 hover:bg-sand-200 cursor-pointer"
                  >
                    + Frais divers
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center bg-sand-100/40 p-2.5 rounded-xl border border-sage-200/60 text-xs"
                  >
                    <div className="col-span-6">
                      <label className="block text-[10px] text-forest-700">Désignation</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full bg-white border border-sage-200 rounded px-2 py-1 outline-none text-forest-900 font-medium"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-forest-700">Qté / Km</label>
                      <input
                        type="number"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-sage-200 rounded px-2 py-1 outline-none text-forest-900 text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-forest-700">Prix unit. (€)</label>
                      <input
                        type="number"
                        step="any"
                        value={item.unit_price}
                        onChange={(e) => handleUpdateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-sage-200 rounded px-2 py-1 outline-none text-forest-900 text-right"
                      />
                    </div>
                    <div className="col-span-1 text-right font-bold text-forest-900 pt-3">
                      {(Number(item.total) || 0).toFixed(2)}€
                    </div>
                    <div className="col-span-1 text-right pt-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-terracotta-500 hover:text-terracotta-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-sage-200 pt-3 flex justify-between items-center text-sm">
              <span className="font-bold text-forest-900">Total TTC à facturer :</span>
              <span className="text-xl font-bold text-forest-900">{totalCalculated.toFixed(2)} €</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-sage-200">
              <button
                type="button"
                onClick={() => {
                  setSaving(false);
                  setIsEditorOpen(false);
                }}
                className="px-4 py-2 border border-sage-200 text-forest-800 font-bold rounded-xl hover:bg-sand-100 text-xs sm:text-sm cursor-pointer transition"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-sage-200 hover:bg-sage-300 text-forest-900 font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {saving ? 'Enregistrement...' : editingInvoiceId ? 'Enregistrer les modifications' : 'Enregistrer le brouillon'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleIssueInvoice(editingInvoiceId || undefined)}
                className="px-4 py-2 bg-forest-800 hover:bg-forest-700 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {saving ? 'Émission...' : 'Valider & Émettre la facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}