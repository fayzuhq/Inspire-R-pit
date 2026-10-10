'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Demande = {
  id: string;
  start_time: string;
  service_formula: string;
  client: { full_name: string };
  beneficiary: { first_name: string; last_name: string };
};

export default function AdminDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchDemandes = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id, start_time, service_formula,
        client:client_id (full_name),
        beneficiary:beneficiary_id (first_name, last_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) setDemandes(data as unknown as Demande[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDemandes();
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (!error) {
      fetchDemandes();
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8">
        Demandes en attente
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : demandes.length === 0 ? (
         <div className="bg-white p-8 rounded-2xl border border-sage-200 text-center text-forest-800">
          Aucune demande en attente.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-100 border-b border-sage-200 text-sm md:text-base">
                <th className="p-4 font-bold text-forest-900">Date souhaitée</th>
                <th className="p-4 font-bold text-forest-900">Client</th>
                <th className="p-4 font-bold text-forest-900 hidden md:table-cell">Bénéficiaire</th>
                <th className="p-4 font-bold text-forest-900">Formule</th>
                <th className="p-4 font-bold text-forest-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className="border-b border-sage-200 last:border-0 hover:bg-mint-100/50">
                  <td className="p-4 font-bold text-forest-800">
                    {format(new Date(d.start_time), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="p-4 text-forest-800">{d.client.full_name}</td>
                  <td className="p-4 text-forest-800 hidden md:table-cell">{d.beneficiary.first_name} {d.beneficiary.last_name}</td>
                  <td className="p-4 text-forest-800">{d.service_formula}</td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    <button onClick={() => updateStatus(d.id, 'confirmed')} className="px-3 py-1 bg-mint-100 text-forest-900 border border-sage-200 rounded font-bold hover:bg-sage-200">Accepter</button>
                    <button onClick={() => updateStatus(d.id, 'rejected')} className="px-3 py-1 bg-terracotta-500/10 text-terracotta-500 border border-terracotta-500 rounded font-bold hover:bg-terracotta-500 hover:text-white">Refuser</button>
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