'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Intervention = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  client: { full_name: string };
  beneficiary: { first_name: string; last_name: string };
};

export default function AdminPlanningPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchInterventions = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, start_time, end_time, status,
          client:client_id (full_name),
          beneficiary:beneficiary_id (first_name, last_name)
        `)
        .order('start_time', { ascending: false });

      if (data) setInterventions(data as unknown as Intervention[]);
      setLoading(false);
    };
    fetchInterventions();
  }, [supabase]);

  return (
    <div>
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8">
        Planning Global
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-100 border-b border-sage-200 text-sm md:text-base">
                <th className="p-4 font-bold text-forest-900">Date & Heure</th>
                <th className="p-4 font-bold text-forest-900">Bénéficiaire</th>
                <th className="p-4 font-bold text-forest-900">Statut</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map((i) => (
                <tr key={i.id} className="border-b border-sage-200 last:border-0 hover:bg-mint-100/50">
                  <td className="p-4 font-bold text-forest-800">
                    {format(new Date(i.start_time), 'dd MMM yyyy', { locale: fr })}
                    <span className="font-normal text-sm block">{format(new Date(i.start_time), 'HH:mm')} - {format(new Date(i.end_time), 'HH:mm')}</span>
                  </td>
                  <td className="p-4 text-forest-800">
                    {i.beneficiary.first_name} {i.beneficiary.last_name}
                    <span className="font-normal text-xs block text-sage-500">Client: {i.client.full_name}</span>
                  </td>
                  <td className="p-4">
                    {i.status === 'confirmed' && <span className="bg-mint-100 text-forest-900 px-2 py-1 rounded text-xs font-bold border border-sage-200">Confirmé</span>}
                    {i.status === 'pending' && <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-200">En attente</span>}
                    {i.status === 'completed' && <span className="bg-sage-200 text-forest-900 px-2 py-1 rounded text-xs font-bold">Terminé</span>}
                    {i.status === 'cancelled' && <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold">Annulé</span>}
                    {i.status === 'rejected' && <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded text-xs font-bold">Refusé</span>}
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