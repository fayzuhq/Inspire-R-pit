'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Intervention = {
  id: string;
  start_time: string;
  end_time: string;
  service_formula: string;
  status: string;
  beneficiaries: { first_name: string; last_name: string };
};

type LiaisonLog = {
  mood_observation: string;
  activities_done: string;
  meals_and_hydration: string;
  incidents_or_alerts: string;
};

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LiaisonLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchInterventions = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase
          .from('bookings')
          .select(`
            id, start_time, end_time, service_formula, status,
            beneficiaries (first_name, last_name)
          `)
          .eq('client_id', userData.user.id)
          .order('start_time', { ascending: false });

        if (data) setInterventions(data as unknown as Intervention[]);
      }
      setLoading(false);
    };
    fetchInterventions();
  }, [supabase]);

  const openLog = async (bookingId: string) => {
    const { data } = await supabase
      .from('liaison_logs')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (data) {
      setSelectedLog(data);
      setIsModalOpen(true);
    } else {
      alert("Cahier de liaison non disponible.");
    }
  };

  const formatFormula = (f: string) => {
    if (f === 'relais_court_2h') return 'Relais (2h)';
    if (f === 'demi_journee_4h') return 'Demi-journée (4h)';
    if (f === 'journee_8h') return 'Journée (8h)';
    return f;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8">
        Mes Interventions
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : interventions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-sage-200 text-center">
          <p className="text-forest-800">Aucune intervention trouvée.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-100 border-b border-sage-200 text-sm md:text-base">
                <th className="p-4 font-bold text-forest-900">Date & Heure</th>
                <th className="p-4 font-bold text-forest-900">Bénéficiaire</th>
                <th className="p-4 font-bold text-forest-900 hidden md:table-cell">Formule</th>
                <th className="p-4 font-bold text-forest-900">Statut</th>
                <th className="p-4 font-bold text-forest-900 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((i) => (
                <tr key={i.id} className="border-b border-sage-200 last:border-0 hover:bg-mint-100/50">
                  <td className="p-4 text-forest-800 text-sm md:text-base">
                    <div className="font-bold">{format(new Date(i.start_time), 'dd MMM yyyy', { locale: fr })}</div>
                    <div className="text-sm">{format(new Date(i.start_time), 'HH:mm')} - {format(new Date(i.end_time), 'HH:mm')}</div>
                  </td>
                  <td className="p-4 text-forest-800 text-sm md:text-base">{i.beneficiaries?.first_name} {i.beneficiaries?.last_name}</td>
                  <td className="p-4 text-forest-800 hidden md:table-cell">{formatFormula(i.service_formula)}</td>
                  <td className="p-4 text-sm">
                    {i.status === 'completed' && <span className="bg-sage-200 text-forest-900 px-2 py-1 rounded font-bold">Terminé</span>}
                    {i.status === 'pending' && <span className="bg-amber-500/20 text-amber-600 px-2 py-1 rounded font-bold">En attente</span>}
                    {i.status === 'confirmed' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded font-bold border border-sage-200">Confirmé</span>}
                    {i.status === 'rejected' && <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded font-bold">Refusé</span>}
                    {i.status === 'cancelled' && <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold">Annulé</span>}
                  </td>
                  <td className="p-4 text-right">
                    {i.status === 'completed' && (
                      <button onClick={() => openLog(i.id)} className="text-sm text-sage-500 font-bold hover:underline">Voir le cahier</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-forest-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold font-sans text-forest-900 mb-6">Cahier de liaison</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Humeur globale</h3>
                <p className="text-forest-800 bg-sand-100 p-3 rounded-lg mt-1">{selectedLog.mood_observation}</p>
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Activités réalisées</h3>
                <p className="text-forest-800 bg-sand-100 p-3 rounded-lg mt-1">{selectedLog.activities_done}</p>
              </div>
              <div>
                <h3 className="font-bold text-forest-900 text-sm">Repas et hydratation</h3>
                <p className="text-forest-800 bg-sand-100 p-3 rounded-lg mt-1">{selectedLog.meals_and_hydration}</p>
              </div>
              {selectedLog.incidents_or_alerts && (
                <div>
                  <h3 className="font-bold text-terracotta-500 text-sm">Incidents ou Alertes</h3>
                  <p className="text-terracotta-500 bg-terracotta-500/10 p-3 rounded-lg mt-1">{selectedLog.incidents_or_alerts}</p>
                </div>
              )}
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 py-3 border-2 border-forest-800 text-forest-800 font-bold rounded-xl">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}