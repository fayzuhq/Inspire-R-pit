'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  FileEdit, 
  Phone, 
  ShieldAlert, 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  X,
  Stethoscope
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';

interface BeneficiaryData {
  id: string;
  first_name: string;
  last_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  secondary_emergency_contact?: string | null;
  treating_doctor_name?: string | null;
  treating_doctor_phone?: string | null;
  hospital_preference?: string | null;
  choking_risk: boolean;
  diet_type: string;
  allergies_and_intolerances?: string | null;
  anxiety_triggers: string;
  reassuring_factors: string;
  medical_protocols?: string | null;
  mobility_status: string;
  transfer_notes?: string | null;
}

interface TodayBooking {
  id: string;
  start_time: string;
  end_time: string;
  service_formula: string;
  specific_mission_notes?: string | null;
  client: { 
    full_name: string;
    phone: string;
  } | null;
  beneficiary: BeneficiaryData;
}

interface LiaisonFormData {
  mood: string;
  activities: string;
  meals: string;
  incidents?: string;
}

export default function AdminTodayPage() {
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicalBooking, setSelectedMedicalBooking] = useState<TodayBooking | null>(null);
  const [selectedLiaisonBooking, setSelectedLiaisonBooking] = useState<TodayBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { register, handleSubmit, reset } = useForm<LiaisonFormData>();

  const fetchTodayBookings = useCallback(async () => {
    setLoading(true);

    // Délimitation stricte de la journée courante locale (00:00:00 à 23:59:59)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        service_formula,
        specific_mission_notes,
        client:client_id (
          full_name,
          phone
        ),
        beneficiary:beneficiary_id (
          id,
          first_name,
          last_name,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relation,
          secondary_emergency_contact,
          treating_doctor_name,
          treating_doctor_phone,
          hospital_preference,
          choking_risk,
          diet_type,
          allergies_and_intolerances,
          anxiety_triggers,
          reassuring_factors,
          medical_protocols,
          mobility_status,
          transfer_notes
        )
      `)
      .eq('status', 'confirmed')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true });

    if (!error && data) {
      setTodayBookings(data as unknown as TodayBooking[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTodayBookings();
  }, [fetchTodayBookings]);

  const onSubmitLiaison = async (data: LiaisonFormData) => {
    if (!selectedLiaisonBooking) return;
    setSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        alert('Session expirée. Veuillez vous reconnecter.');
        setSubmitting(false);
        return;
      }

      // 1. Enregistrement dans le cahier de liaison
      const { error: logError } = await supabase.from('liaison_logs').insert([{
        booking_id: selectedLiaisonBooking.id,
        author_id: userData.user.id,
        mood_observation: data.mood,
        activities_done: data.activities,
        meals_and_hydration: data.meals,
        incidents_or_alerts: data.incidents || 'RAS'
      }]);

      if (logError) throw logError;

      // 2. Bascule du statut de la réservation en "completed"
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', selectedLiaisonBooking.id);

      if (updateError) throw updateError;

      setSelectedLiaisonBooking(null);
      reset();
      await fetchTodayBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      alert(`Erreur lors de l'enregistrement du cahier de liaison : ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatHours = (isoDate: string) => {
    return new Date(isoDate).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-forest-700">
        Chargement des interventions du jour...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 md:pb-6 space-y-6">
      <div className="border-b border-sage-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-sans text-forest-900 flex items-center gap-2.5">
          <Calendar className="w-7 h-7 text-sage-500" /> Aujourd&apos;hui
        </h1>
        <p className="text-sm text-forest-700 mt-1">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      {todayBookings.length > 0 ? (
        <div className="space-y-6">
          {todayBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-sage-200 overflow-hidden"
            >
              <div className="bg-sand-100/70 p-4 border-b border-sage-200 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-forest-800 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    {formatHours(booking.start_time)} - {formatHours(booking.end_time)}
                  </span>
                  <span className="text-xs font-semibold text-forest-900 bg-mint-100 px-2 py-0.5 rounded border border-sage-500/20 capitalize">
                    {booking.service_formula.replace(/_/g, ' ')}
                  </span>
                </div>

                <span className="text-base font-bold text-forest-900 capitalize">
                  {booking.beneficiary.first_name} {booking.beneficiary.last_name}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-forest-800 bg-sand-100/40 p-3.5 rounded-xl border border-sage-200/50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sage-500 shrink-0" />
                    <span>
                      <strong>Client :</strong> {booking.client?.full_name || 'Non renseigné'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-sage-500 shrink-0" />
                    <span>
                      <strong>Tél. :</strong>{' '}
                      <a href={`tel:${booking.client?.phone}`} className="underline font-medium">
                        {booking.client?.phone || 'N/C'}
                      </a>
                    </span>
                  </div>
                </div>

                {booking.specific_mission_notes && (
                  <div className="text-xs sm:text-sm text-forest-800 bg-white p-3 rounded-xl border border-sage-200">
                    <strong className="text-forest-900 block mb-1">Consignes spécifiques :</strong>
                    <p className="whitespace-pre-line">{booking.specific_mission_notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMedicalBooking(booking)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-500/90 shadow-xs transition text-sm"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    Fiche Médicale & Urgence
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setSelectedLiaisonBooking(booking);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-sage-500 text-white font-bold rounded-xl hover:bg-forest-800 shadow-xs transition text-sm"
                  >
                    <FileEdit className="w-5 h-5 shrink-0" />
                    Remplir cahier de liaison
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-sage-200 text-center space-y-2 shadow-xs">
          <Calendar className="w-10 h-10 text-sage-500 mx-auto" />
          <h3 className="text-lg font-bold text-forest-900">Aucune intervention confirmée aujourd&apos;hui</h3>
          <p className="text-sm text-forest-700 max-w-sm mx-auto">
            Les demandes de garde acceptées programmées pour la journée s&apos;afficheront ici automatiquement.
          </p>
        </div>
      )}

      {/* Modale Fiche Médicale d'Urgence */}
      {selectedMedicalBooking && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-xl max-h-[92vh] overflow-y-auto border border-sage-200 shadow-2xl space-y-5 my-auto">
            <div className="flex justify-between items-start border-b border-sage-200 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-terracotta-500 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 shrink-0" /> Fiche d&apos;Urgence
                </h2>
                <p className="text-xs text-forest-700 mt-1 capitalize font-medium">
                  {selectedMedicalBooking.beneficiary.first_name} {selectedMedicalBooking.beneficiary.last_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedicalBooking(null)}
                className="text-forest-700 hover:text-forest-900 p-1 rounded-lg hover:bg-sand-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Alerte Risque fausse route */}
              {selectedMedicalBooking.beneficiary.choking_risk ? (
                <div className="bg-terracotta-500/10 p-4 rounded-xl border border-terracotta-500/30 space-y-1">
                  <h3 className="font-bold text-terracotta-500 flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4" /> Risque avéré de fausse route !
                  </h3>
                  <p className="text-forest-900">
                    Texture requise : <strong className="capitalize">{selectedMedicalBooking.beneficiary.diet_type}</strong>.
                    Surveiller attentivement chaque déglutition.
                  </p>
                </div>
              ) : (
                <div className="bg-sand-100/60 p-3 rounded-xl border border-sage-200/50">
                  Texture des repas : <strong className="capitalize">{selectedMedicalBooking.beneficiary.diet_type}</strong>
                </div>
              )}

              {/* Protocoles spécifiques */}
              {selectedMedicalBooking.beneficiary.medical_protocols && (
                <div className="p-3.5 bg-terracotta-500/10 border border-terracotta-500/30 rounded-xl space-y-1">
                  <h4 className="font-bold text-terracotta-500 flex items-center gap-1.5 uppercase text-xs">
                    <FileText className="w-4 h-4" /> Protocole d&apos;urgence spécifique (PAI)
                  </h4>
                  <p className="text-forest-900 whitespace-pre-line text-xs leading-relaxed">
                    {selectedMedicalBooking.beneficiary.medical_protocols}
                  </p>
                </div>
              )}

              {/* Contacts d'urgence */}
              <div className="space-y-2">
                <h4 className="font-bold text-forest-900 text-xs uppercase tracking-wider text-sage-500">
                  Numéros d&apos;urgence
                </h4>
                <a
                  href={`tel:${selectedMedicalBooking.beneficiary.emergency_contact_phone}`}
                  className="flex items-center justify-between bg-mint-100/80 p-3.5 rounded-xl border border-sage-500/30 text-forest-900 hover:bg-sage-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-forest-800" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm">
                        {selectedMedicalBooking.beneficiary.emergency_contact_name} ({selectedMedicalBooking.beneficiary.emergency_contact_relation})
                      </p>
                      <p className="text-xs text-forest-700">{selectedMedicalBooking.beneficiary.emergency_contact_phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-forest-900 bg-white px-2 py-1 rounded border border-sage-200">
                    Appeler
                  </span>
                </a>

                {selectedMedicalBooking.beneficiary.treating_doctor_name && (
                  <div className="flex items-center gap-2 p-3 bg-sand-100/60 rounded-xl border border-sage-200 text-xs">
                    <Stethoscope className="w-4 h-4 text-sage-500 shrink-0" />
                    <div>
                      <strong>Médecin traitant :</strong> {selectedMedicalBooking.beneficiary.treating_doctor_name}{' '}
                      {selectedMedicalBooking.beneficiary.treating_doctor_phone && (
                        <span>({selectedMedicalBooking.beneficiary.treating_doctor_phone})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Déclencheurs et apaisement */}
              <div className="space-y-2 pt-1">
                <div>
                  <h4 className="font-bold text-forest-900 mb-1 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-terracotta-500" /> Ce qui angoisse (Triggers)
                  </h4>
                  <p className="text-xs text-forest-800 bg-sand-100 p-3 rounded-xl border border-sage-200">
                    {selectedMedicalBooking.beneficiary.anxiety_triggers || 'Non renseigné'}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-forest-900 mb-1 flex items-center gap-1.5 text-xs">
                    <Heart className="w-3.5 h-3.5 text-terracotta-500" /> Ce qui rassure et apaise
                  </h4>
                  <p className="text-xs text-forest-800 bg-mint-100/60 p-3 rounded-xl border border-sage-200">
                    {selectedMedicalBooking.beneficiary.reassuring_factors || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMedicalBooking(null)}
              className="w-full mt-4 py-3 bg-forest-800 text-white font-bold rounded-xl hover:bg-forest-700 transition text-sm"
            >
              Fermer la fiche
            </button>
          </div>
        </div>
      )}

      {/* Modale Cahier de Liaison */}
      {selectedLiaisonBooking && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[92vh] overflow-y-auto border border-sage-200 shadow-2xl space-y-5 my-auto">
            <div className="flex justify-between items-start border-b border-sage-200 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-forest-900 flex items-center gap-2">
                  <FileEdit className="w-6 h-6 text-sage-500" /> Cahier de liaison
                </h2>
                <p className="text-xs text-forest-700 mt-1 capitalize font-medium">
                  Relais avec {selectedLiaisonBooking.beneficiary.first_name} {selectedLiaisonBooking.beneficiary.last_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLiaisonBooking(null)}
                className="text-forest-700 hover:text-forest-900 p-1 rounded-lg hover:bg-sand-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitLiaison)} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-forest-900 mb-1">Humeur & observations *</label>
                <textarea
                  {...register('mood')}
                  required
                  rows={2}
                  className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
                  placeholder="Ex. : Souriant, calme, un peu fatigué après le déjeuner..."
                />
              </div>

              <div>
                <label className="block font-bold text-forest-900 mb-1">Activités réalisées *</label>
                <textarea
                  {...register('activities')}
                  required
                  rows={2}
                  className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
                  placeholder="Ex. : Promenade dans le parc, écoute musicale, jeux calmes..."
                />
              </div>

              <div>
                <label className="block font-bold text-forest-900 mb-1">Repas & hydratation *</label>
                <textarea
                  {...register('meals')}
                  required
                  rows={2}
                  className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
                  placeholder="Ex. : A pris son repas complet sans difficulté, 3 verres d'eau..."
                />
              </div>

              <div>
                <label className="block font-bold text-forest-900 mb-1">Incidents ou points de vigilance (optionnel)</label>
                <textarea
                  {...register('incidents')}
                  rows={2}
                  className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
                  placeholder="Ex. : RAS, ou petite angoisse au départ des parents apaisée rapidement."
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-sage-200">
                <button
                  type="button"
                  onClick={() => setSelectedLiaisonBooking(null)}
                  className="w-1/3 py-2.5 border border-sage-200 text-forest-800 font-bold rounded-xl hover:bg-sand-100 transition text-xs sm:text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-2.5 bg-forest-800 text-white font-bold rounded-xl hover:bg-forest-700 transition disabled:opacity-50 text-xs sm:text-sm shadow-xs"
                >
                  {submitting ? 'Enregistrement...' : 'Valider & Clôturer la garde'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}