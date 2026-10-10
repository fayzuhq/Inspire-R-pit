'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, User, AlertTriangle, Phone, Activity, Utensils, MessageSquare, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';

const beneficiarySchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  gender: z.enum(['homme', 'femme', 'autre', 'non_renseigné']),
  emergencyContactName: z.string().min(2, 'Le nom du contact d\'urgence est requis'),
  emergencyContactPhone: z.string().min(10, 'Le téléphone du contact d\'urgence est requis'),
  emergencyContactRelation: z.string().min(2, 'Le lien avec le bénéficiaire est requis'),
  secondaryEmergencyContact: z.string().optional(),
  treatingDoctorName: z.string().optional(),
  treatingDoctorPhone: z.string().optional(),
  hospitalPreference: z.string().optional(),
  mobilityStatus: z.enum(['autonome', 'canne_deambulateur', 'fauteuil_manuel', 'fauteuil_electrique', 'alite']),
  transferNotes: z.string().optional(),
  toiletHabits: z.string().optional(),
  dietType: z.enum(['standard', 'mixe', 'hache', 'liquide_epaissi']),
  allergiesAndIntolerances: z.string().optional(),
  chokingRisk: z.boolean(),
  mealAssistanceNotes: z.string().optional(),
  communicationMode: z.enum(['verbal', 'pictogrammes_pecs', 'langue_des_signes', 'gestes_regards', 'non_verbal']),
  reassuringFactors: z.string().min(5, 'Ce champ est requis'),
  anxietyTriggers: z.string().min(5, 'Ce champ est requis'),
  favoriteActivities: z.string().optional(),
  medicalProtocols: z.string().optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

type Beneficiary = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  secondary_emergency_contact?: string;
  treating_doctor_name?: string;
  treating_doctor_phone?: string;
  hospital_preference?: string;
  mobility_status: string;
  transfer_notes?: string;
  toilet_habits?: string;
  diet_type: string;
  allergies_and_intolerances?: string;
  choking_risk: boolean;
  meal_assistance_notes?: string;
  communication_mode: string;
  reassuring_factors: string;
  anxiety_triggers: string;
  favorite_activities?: string;
  medical_protocols?: string;
};

export default function BeneficiairesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      gender: 'non_renseigné',
      mobilityStatus: 'autonome',
      dietType: 'standard',
      chokingRisk: false,
      communicationMode: 'verbal',
    }
  });

  const fetchBeneficiaries = useCallback(async () => {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('client_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement bénéficiaires :', error);
    } else if (data) {
      setBeneficiaires(data as Beneficiary[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const onSubmit = async (data: BeneficiaryFormData) => {
    setSubmitting(true);
    setFormError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setFormError("Session expirée. Veuillez vous reconnecter.");
      setSubmitting(false);
      return;
    }

    const payload = {
      client_id: userData.user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      gender: data.gender,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_phone: data.emergencyContactPhone,
      emergency_contact_relation: data.emergencyContactRelation,
      secondary_emergency_contact: data.secondaryEmergencyContact || null,
      treating_doctor_name: data.treatingDoctorName || null,
      treating_doctor_phone: data.treatingDoctorPhone || null,
      hospital_preference: data.hospitalPreference || null,
      mobility_status: data.mobilityStatus,
      transfer_notes: data.transferNotes || null,
      toilet_habits: data.toiletHabits || null,
      diet_type: data.dietType,
      allergies_and_intolerances: data.allergiesAndIntolerances || null,
      choking_risk: Boolean(data.chokingRisk),
      meal_assistance_notes: data.mealAssistanceNotes || null,
      communication_mode: data.communicationMode,
      reassuring_factors: data.reassuringFactors,
      anxiety_triggers: data.anxietyTriggers,
      favorite_activities: data.favoriteActivities || null,
      medical_protocols: data.medicalProtocols || null,
    };

    const { error } = await supabase.from('beneficiaries').insert([payload]);

    if (!error) {
      setIsModalOpen(false);
      reset();
      await fetchBeneficiaries();
    } else {
      console.error('Erreur insertion Supabase :', error);
      setFormError(error.message || "Une erreur est survenue lors de l'enregistrement.");
    }
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sage-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-sans text-forest-900">
            Mes Bénéficiaires
          </h1>
          <p className="text-sm text-forest-700 mt-1">
            Gérez les fiches médico-sociales complètes des personnes accompagnées.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-800 text-white font-medium rounded-xl hover:bg-forest-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Ajouter une personne
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-forest-700">Chargement des fiches...</div>
      ) : beneficiaires.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-sage-200 p-8 space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-mint-100 rounded-full flex items-center justify-center mx-auto text-sage-500">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-forest-900">Aucun bénéficiaire enregistré</h3>
          <p className="text-sm text-forest-700 max-w-md mx-auto">
            Ajoutez votre premier profil bénéficiaire pour préparer vos futures demandes de prise de relais.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-forest-800 transition text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Ajouter un profil
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaires.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-200 space-y-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-3 border-b border-sage-200/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-sage-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-sans text-forest-900 capitalize leading-snug">
                      {b.first_name} {b.last_name}
                    </h2>
                    <p className="text-xs text-forest-700">
                      Né(e) le {b.birth_date} • {b.gender}
                    </p>
                  </div>
                </div>
              </div>

              {b.choking_risk && (
                <div className="flex items-center gap-2 text-terracotta-500 text-xs font-bold bg-terracotta-500/10 p-2.5 rounded-lg border border-terracotta-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Risque de fausse route avéré
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-forest-800 bg-sand-100/50 p-3 rounded-xl border border-sage-200/40">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sage-500 shrink-0" />
                  <span><strong>Mobilité :</strong> {b.mobility_status.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-sage-500 shrink-0" />
                  <span><strong>Repas :</strong> {b.diet_type}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <MessageSquare className="w-3.5 h-3.5 text-sage-500 shrink-0" />
                  <span><strong>Com. :</strong> {b.communication_mode.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="bg-sand-100 p-3 rounded-xl text-xs space-y-1.5 text-forest-900 border border-sage-200/60">
                <div className="flex items-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-forest-800 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{b.emergency_contact_name} ({b.emergency_contact_relation})</p>
                    <p className="text-forest-700">{b.emergency_contact_phone}</p>
                  </div>
                </div>
                {b.treating_doctor_name && (
                  <p className="text-[11px] text-forest-700 pt-1 border-t border-sage-200/50">
                    <strong>Médecin :</strong> {b.treating_doctor_name} {b.treating_doctor_phone ? `(${b.treating_doctor_phone})` : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajout Complet */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-sage-200 shadow-2xl my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-sage-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold font-sans text-forest-900">Ajouter un bénéficiaire</h2>
                <p className="text-xs text-forest-700 mt-0.5">Renseignez le profil médico-social complet pour sécuriser la prise de relais.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-forest-700 hover:text-forest-900 p-1.5 rounded-lg hover:bg-sand-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-3 bg-terracotta-500/10 border border-terracotta-500/30 text-terracotta-500 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Identité & Urgences Médicales */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-forest-900 border-b border-sage-200 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sage-500" /> 1. Identité & Urgences Médicales
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Prénom *</label>
                    <input {...register('firstName')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-forest-800 outline-none" />
                    {errors.firstName && <p className="text-terracotta-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Nom *</label>
                    <input {...register('lastName')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-forest-800 outline-none" />
                    {errors.lastName && <p className="text-terracotta-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Date de naissance *</label>
                    <input type="date" {...register('birthDate')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-forest-800 outline-none" />
                    {errors.birthDate && <p className="text-terracotta-500 text-xs mt-1">{errors.birthDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Genre</label>
                    <select {...register('gender')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-forest-800 outline-none">
                      <option value="non_renseigné">Non renseigné</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 bg-sand-100/60 p-4 rounded-xl border border-sage-200/60">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Contact d&apos;urgence principal *</label>
                    <input {...register('emergencyContactName')} placeholder="Nom complet" className="w-full border border-sage-200 rounded-lg p-2 text-sm bg-white" />
                    {errors.emergencyContactName && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Tél. urgence principal *</label>
                    <input {...register('emergencyContactPhone')} placeholder="Numéro de téléphone" className="w-full border border-sage-200 rounded-lg p-2 text-sm bg-white" />
                    {errors.emergencyContactPhone && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactPhone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Lien de parenté / statut *</label>
                    <input {...register('emergencyContactRelation')} placeholder="Ex: Mère, Tuteur" className="w-full border border-sage-200 rounded-lg p-2 text-sm bg-white" />
                    {errors.emergencyContactRelation && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactRelation.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Contact d&apos;urgence secondaire</label>
                    <input {...register('secondaryEmergencyContact')} placeholder="Nom et téléphone" className="w-full border border-sage-200 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Médecin traitant (Nom & Tél)</label>
                    <div className="flex gap-2">
                      <input {...register('treatingDoctorName')} placeholder="Nom" className="w-1/2 border border-sage-200 rounded-lg p-2.5 text-sm" />
                      <input {...register('treatingDoctorPhone')} placeholder="Tél" className="w-1/2 border border-sage-200 rounded-lg p-2.5 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Hôpital privilégié</label>
                    <input {...register('hospitalPreference')} placeholder="CHU ou clinique de secteur" className="w-full border border-sage-200 rounded-lg p-2.5 text-sm" />
                  </div>
                </div>
              </section>

              {/* Section 2: Autonomie Motrice & Gestes Quotidiens */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-forest-900 border-b border-sage-200 pb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sage-500" /> 2. Autonomie Motrice & Gestes Quotidiens
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Autonomie motrice</label>
                    <select {...register('mobilityStatus')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm">
                      <option value="autonome">Autonome</option>
                      <option value="canne_deambulateur">Canne / Déambulateur</option>
                      <option value="fauteuil_manuel">Fauteuil roulant manuel</option>
                      <option value="fauteuil_electrique">Fauteuil roulant électrique</option>
                      <option value="alite">Alité</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Aides aux transferts</label>
                    <input {...register('transferNotes')} placeholder="Aide humaine, verticalisateur..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Habitudes hygiène / toilettes</label>
                    <input {...register('toiletHabits')} placeholder="Autonomie, aide partielle, protections..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm" />
                  </div>
                </div>
              </section>

              {/* Section 3: Alimentation & Risques Vitaux */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-forest-900 border-b border-sage-200 pb-2 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-sage-500" /> 3. Alimentation & Risques Vitaux
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Alimentation (Texture)</label>
                    <select {...register('dietType')} className="w-full border border-sage-200 rounded-lg p-2.5 text-sm">
                      <option value="standard">Standard (Normale)</option>
                      <option value="hache">Hachée</option>
                      <option value="mixe">Mixée / Lisse</option>
                      <option value="liquide_epaissi">Liquide épaissi</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2.5 cursor-pointer text-terracotta-500 font-bold text-sm bg-terracotta-500/10 p-3 rounded-xl border border-terracotta-500/30 w-full">
                      <input type="checkbox" {...register('chokingRisk')} className="w-4 h-4 accent-terracotta-500 rounded" />
                      Risque avéré de fausse route (vigilance renforcée)
                    </label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Allergies et intolérances</label>
                    <textarea {...register('allergiesAndIntolerances')} rows={2} placeholder="Alimentaires ou médicamenteuses" className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Aide au repas (Consignes)</label>
                    <textarea {...register('mealAssistanceNotes')} rows={2} placeholder="Installation, découpe, aide à la cuillère..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                  </div>
                </div>
              </section>

              {/* Section 4: Communication, Habitudes & Protocoles */}
              <section className="space-y-4">
                <h3 className="text-base font-bold text-forest-900 border-b border-sage-200 pb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sage-500" /> 4. Communication, Habitudes & Protocoles
                </h3>
                <div>
                  <label className="block text-xs font-bold text-forest-900 mb-1">Mode de communication</label>
                  <select {...register('communicationMode')} className="w-full md:w-1/2 border border-sage-200 rounded-lg p-2.5 text-sm">
                    <option value="verbal">Verbal</option>
                    <option value="pictogrammes_pecs">Pictogrammes / PECS</option>
                    <option value="langue_des_signes">Langue des signes (LSF)</option>
                    <option value="gestes_regards">Gestes et regards</option>
                    <option value="non_verbal">Non verbal</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Ce qui rassure / apaise *</label>
                    <textarea {...register('reassuringFactors')} rows={2} placeholder="Musique douce, rituels spécifiques..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                    {errors.reassuringFactors && <p className="text-terracotta-500 text-xs mt-1">{errors.reassuringFactors.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-forest-900 mb-1">Déclencheurs d&apos;angoisse (Triggers) *</label>
                    <textarea {...register('anxietyTriggers')} rows={2} placeholder="Bruits soudains, gestes brusques..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                    {errors.anxietyTriggers && <p className="text-terracotta-500 text-xs mt-1">{errors.anxietyTriggers.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Activités favorites / Centres d&apos;intérêt</label>
                    <textarea {...register('favoriteActivities')} rows={2} placeholder="Jeux, promenades, musique..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800 mb-1">Protocoles médicaux spécifiques</label>
                    <textarea {...register('medicalProtocols')} rows={2} placeholder="Protocole PAI, crise d'épilepsie, asthme..." className="w-full border border-sage-200 rounded-lg p-2.5 text-sm"></textarea>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-4 border-t border-sage-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 border border-sage-200 text-forest-800 rounded-xl hover:bg-sand-100 transition text-sm"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-6 py-2.5 bg-forest-800 text-white font-bold rounded-xl hover:bg-forest-700 transition disabled:opacity-50 text-sm shadow-sm"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer le bénéficiaire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}