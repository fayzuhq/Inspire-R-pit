'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, FileEdit, Phone, ShieldAlert, Heart, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';

type ActiveBooking = {
  id: string;
  start_time: string;
  end_time: string;
  service_formula: string;
  specific_mission_notes: string;
  client: { full_name: string };
  beneficiary: {
    id: string;
    first_name: string;
    last_name: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    choking_risk: boolean;
    diet_type: string;
    anxiety_triggers: string;
    reassuring_factors: string;
  };
};

export default function AdminTodayPage() {
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isLiaisonModalOpen, setIsLiaisonModalOpen] = useState(false);
  const supabase = createClient();
  const { register, handleSubmit, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTodayBooking = async () => {
      // Pour la démo, on cherche la prochaine intervention confirmée
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, start_time, end_time, service_formula, specific_mission_notes,
          client:client_id (full_name),
          beneficiary:beneficiary_id (
            id, first_name, last_name, emergency_contact_name, emergency_contact_phone,
            choking_risk, diet_type, anxiety_triggers, reassuring_factors
          )
        `)
        .eq('status', 'confirmed')
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setActiveBooking(data as unknown as ActiveBooking);
      }
      setLoading(false);
    };
    fetchTodayBooking();
  }, [supabase]);

  const onSubmitLiaison = async (data: Record<string, string>) => {
    if (!activeBooking) return;
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      // 1. Insert log
      const { error: logError } = await supabase.from('liaison_logs').insert([{
        booking_id: activeBooking.id,
        author_id: userData.user.id,
        mood_observation: data.mood,
        activities_done: data.activities,
        meals_and_hydration: data.meals,
        incidents_or_alerts: data.incidents
      }]);

      if (logError) {
        alert("Erreur lors de l'enregistrement du cahier de liaison.");
        setSubmitting(false);
        return;
      }

      // 2. Update booking status
      await supabase.from('bookings').update({ status: 'completed' }).eq('id', activeBooking.id);

      setIsLiaisonModalOpen(false);
      reset();
      setActiveBooking(null); // Clear active view
    }
    setSubmitting(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
      <h1 className="text-2xl font-bold font-sans text-forest-900 mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6" /> Aujourd&apos;hui
      </h1>

      {activeBooking ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-sage-200 overflow-hidden mb-6">
          <div className="bg-sand-100 p-4 border-b border-sage-200 flex justify-between items-center">
            <div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                {new Date(activeBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(activeBooking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <span className="ml-2 text-sm font-bold text-forest-900">{activeBooking.service_formula}</span>
            </div>
            <span className="text-forest-800 font-medium">{activeBooking.beneficiary.first_name} {activeBooking.beneficiary.last_name}</span>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-forest-800">
              <strong>Client :</strong> {activeBooking.client.full_name}
            </p>
            <p className="text-sm text-forest-800">
              <strong>Consignes :</strong> {activeBooking.specific_mission_notes || "Aucune consigne spécifique."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setIsMedicalModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-500/90 shadow-sm"
              >
                <AlertCircle className="w-5 h-5" />
                Fiche Médicale & Urgence
              </button>

              <button
                onClick={() => setIsLiaisonModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-sage-500 text-white font-bold rounded-xl hover:bg-sage-500/90 shadow-sm"
              >
                <FileEdit className="w-5 h-5" />
                Cahier de liaison
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-sage-200 text-center text-forest-800">
          Aucune intervention confirmée prévue pour aujourd&apos;hui.
        </div>
      )}

      {/* Modal Fiche Médicale */}
      {isMedicalModalOpen && activeBooking && (
        <div className="fixed inset-0 bg-forest-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-sans text-terracotta-500 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" /> Fiche d&apos;Urgence
              </h2>
            </div>

            <div className="space-y-6">
              {activeBooking.beneficiary.choking_risk && (
                <div className="bg-terracotta-500/10 p-4 rounded-xl border border-terracotta-500">
                  <h3 className="font-bold text-terracotta-500 mb-2">Risque de fausse route !</h3>
                  <p className="text-sm text-forest-900">Texture des repas : <strong>{activeBooking.beneficiary.diet_type}</strong>. Surveiller la déglutition.</p>
                </div>
              )}

              <div>
                <h3 className="font-bold text-forest-900 mb-2">Contact d&apos;urgence principal</h3>
                <a href={`tel:${activeBooking.beneficiary.emergency_contact_phone}`} className="flex items-center gap-2 bg-mint-100 p-3 rounded-lg border border-sage-200 text-forest-800 hover:bg-sage-200 transition-colors">
                  <Phone className="w-5 h-5" />
                  <span className="font-bold">{activeBooking.beneficiary.emergency_contact_name}</span> - {activeBooking.beneficiary.emergency_contact_phone}
                </a>
              </div>

              <div>
                <h3 className="font-bold text-forest-900 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Déclencheurs de crise (Triggers)</h3>
                <p className="text-sm text-forest-800 bg-sand-100 p-3 rounded-lg">{activeBooking.beneficiary.anxiety_triggers}</p>
              </div>

              <div>
                <h3 className="font-bold text-forest-900 mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-terracotta-500"/> Ce qui rassure</h3>
                <p className="text-sm text-forest-800 bg-mint-100 p-3 rounded-lg">{activeBooking.beneficiary.reassuring_factors}</p>
              </div>
            </div>

            <button onClick={() => setIsMedicalModalOpen(false)} className="w-full mt-8 py-3 border-2 border-forest-800 text-forest-800 font-bold rounded-xl">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Cahier de Liaison */}
      {isLiaisonModalOpen && activeBooking && (
        <div className="fixed inset-0 bg-forest-900/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold font-sans text-forest-900 mb-6 flex items-center gap-2">
              <FileEdit className="w-6 h-6 text-sage-500" /> Cahier de liaison
            </h2>

            <form onSubmit={handleSubmit(onSubmitLiaison)} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-forest-900 mb-1">Humeur globale</label>
                <textarea {...register('mood')} required rows={2} className="w-full border border-sage-200 rounded-lg p-2" placeholder="Ex: Souriant, un peu fatigué en fin de journée..."></textarea>
              </div>
              <div>
                <label className="block font-bold text-forest-900 mb-1">Activités réalisées</label>
                <textarea {...register('activities')} required rows={2} className="w-full border border-sage-200 rounded-lg p-2" placeholder="Ex: Promenade, puzzle..."></textarea>
              </div>
              <div>
                <label className="block font-bold text-forest-900 mb-1">Repas et hydratation</label>
                <textarea {...register('meals')} required rows={2} className="w-full border border-sage-200 rounded-lg p-2" placeholder="Ex: A bien mangé, a bu 2 verres d&apos;eau..."></textarea>
              </div>
              <div>
                <label className="block font-bold text-forest-900 mb-1">Incidents ou Alertes (optionnel)</label>
                <textarea {...register('incidents')} rows={2} className="w-full border border-sage-200 rounded-lg p-2" placeholder="Ex: Petite rougeur au coude, ou RAS"></textarea>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsLiaisonModalOpen(false)} className="w-1/3 py-3 border border-sage-200 text-forest-800 font-bold rounded-xl">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="w-2/3 py-3 bg-sage-500 text-forest-900 font-bold rounded-xl hover:bg-sage-500/90 disabled:opacity-50">
                  {submitting ? 'Enregistrement...' : 'Enregistrer & Terminer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}