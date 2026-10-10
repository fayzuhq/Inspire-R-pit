'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle2, History, AlertCircle, User, Phone } from 'lucide-react';

interface Intervention {
  id: string;
  start_time: string;
  end_time: string;
  service_formula: string;
  status: string;
  total_price: number;
  specific_mission_notes?: string | null;
  client: { 
    full_name: string; 
    phone: string; 
  } | null;
  beneficiary: { 
    first_name: string; 
    last_name: string; 
  } | null;
}

export default function AdminPlanningPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    const nowIso = new Date().toISOString();

    let query = supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        service_formula,
        status,
        total_price,
        specific_mission_notes,
        client:client_id (full_name, phone),
        beneficiary:beneficiary_id (first_name, last_name)
      `);

    if (tab === 'upcoming') {
      // Uniquement les créneaux en cours ou à venir non terminés
      query = query
        .gte('end_time', nowIso)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true });
    } else {
      // Toutes les gardes clôturées ou dont l'heure de fin est dépassée
      query = query
        .or(`end_time.lt.${nowIso},status.eq.completed`)
        .order('start_time', { ascending: false });
    }

    const { data, error } = await query;

    if (!error && data) {
      setInterventions(data as unknown as Intervention[]);
    }
    setLoading(false);
  }, [tab, supabase]);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const renderBadgeStatus = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-mint-100 text-forest-900 px-2.5 py-1 rounded-md text-xs font-bold border border-sage-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-sage-500" />
            Confirmé
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-sage-200 text-forest-900 px-2.5 py-1 rounded-md text-xs font-bold">
            <History className="w-3.5 h-3.5 text-forest-800" />
            Terminé
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            En attente
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold">
            Annulé
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-terracotta-500/10 text-terracotta-500 px-2.5 py-1 rounded-md text-xs font-bold border border-terracotta-500/30">
            Refusé
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête et sélecteur d'onglets */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sage-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-forest-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-sage-500" /> Planning Global
          </h1>
          <p className="text-sm text-forest-700 mt-1">
            Visualisez et filtrez l&apos;ensemble des créneaux de prise de relais.
          </p>
        </div>

        {/* Boutons de bascule À venir / Terminées */}
        <div className="flex bg-sand-100 p-1 rounded-xl border border-sage-200 gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              tab === 'upcoming'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 hover:text-forest-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            À venir (les plus proches)
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              tab === 'past'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 hover:text-forest-900'
            }`}
          >
            <History className="w-4 h-4" />
            Terminées (les plus récentes)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-sage-200 text-forest-700">
          Chargement du planning...
        </div>
      ) : interventions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-sage-200 text-forest-700 space-y-2">
          <Calendar className="w-10 h-10 text-sage-500 mx-auto" />
          <h3 className="text-base font-bold text-forest-900">
            {tab === 'upcoming' ? 'Aucune intervention à venir' : 'Aucune intervention terminée'}
          </h3>
          <p className="text-xs text-forest-700">
            {tab === 'upcoming'
              ? 'Toutes les demandes confirmées pour les prochains jours apparaîtront ici par ordre chronologique.'
              : 'Les interventions passées ou clôturées par le cahier de liaison seront archivées ici.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-sage-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sand-100/70 border-b border-sage-200 text-xs sm:text-sm">
                  <th className="p-4 font-bold text-forest-900">Date & Horaires</th>
                  <th className="p-4 font-bold text-forest-900">Bénéficiaire</th>
                  <th className="p-4 font-bold text-forest-900">Client / Contact</th>
                  <th className="p-4 font-bold text-forest-900">Formule</th>
                  <th className="p-4 font-bold text-forest-900">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-200/60 text-xs sm:text-sm">
                {interventions.map((item) => (
                  <tr key={item.id} className="hover:bg-mint-100/40 transition">
                    {/* Date & Horaires */}
                    <td className="p-4 align-top">
                      <div className="font-bold text-forest-900 capitalize">
                        {format(new Date(item.start_time), 'EEEE d MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-xs text-forest-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-sage-500" />
                        {format(new Date(item.start_time), 'HH:mm')} - {format(new Date(item.end_time), 'HH:mm')}
                      </div>
                    </td>

                    {/* Bénéficiaire */}
                    <td className="p-4 align-top">
                      <div className="font-bold text-forest-900 capitalize">
                        {item.beneficiary?.first_name} {item.beneficiary?.last_name}
                      </div>
                      {item.specific_mission_notes && (
                        <p className="text-[11px] text-forest-700 max-w-xs line-clamp-1 mt-0.5">
                          Consigne : {item.specific_mission_notes}
                        </p>
                      )}
                    </td>

                    {/* Client */}
                    <td className="p-4 align-top text-forest-800">
                      <div className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-sage-500 shrink-0" />
                        {item.client?.full_name || 'Non renseigné'}
                      </div>
                      {item.client?.phone && (
                        <div className="flex items-center gap-1 text-xs text-forest-700 mt-0.5">
                          <Phone className="w-3 h-3 text-sage-500 shrink-0" />
                          <a href={`tel:${item.client.phone}`} className="hover:underline">
                            {item.client.phone}
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Formule & Tarif */}
                    <td className="p-4 align-top">
                      <span className="font-medium text-forest-900 capitalize block">
                        {item.service_formula.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-semibold text-sage-500">
                        {item.total_price} €
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="p-4 align-top">
                      {renderBadgeStatus(item.status)}
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