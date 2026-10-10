'use client';

import { useState, useEffect } from 'react';
import { Plus, User, AlertTriangle } from 'lucide-react';
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
  mobility_status: string;
  choking_risk: boolean;
};

export default function BeneficiairesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const fetchBeneficiaries = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data } = await supabase
        .from('beneficiaries')
        .select('id, first_name, last_name, mobility_status, choking_risk')
        .eq('client_id', userData.user.id);
      if (data) setBeneficiaires(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBeneficiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: BeneficiaryFormData) => {
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { error } = await supabase.from('beneficiaries').insert([{
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
        choking_risk: data.chokingRisk,
        meal_assistance_notes: data.mealAssistanceNotes || null,
        communication_mode: data.communicationMode,
        reassuring_factors: data.reassuringFactors,
        anxiety_triggers: data.anxietyTriggers,
        favorite_activities: data.favoriteActivities || null,
        medical_protocols: data.medicalProtocols || null,
      }]);

      if (!error) {
        setIsModalOpen(false);
        reset();
        fetchBeneficiaries();
      } else {
        alert("Une erreur est survenue.");
      }
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans text-forest-900">
          Mes Bénéficiaires
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Ajouter une personne
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : beneficiaires.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-sage-200">
          <p className="text-forest-800 mb-4">Vous n&apos;avez pas encore ajouté de bénéficiaire.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-sage-500 font-bold hover:underline">Ajouter un profil</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beneficiaires.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-sage-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-sans text-forest-900">{b.first_name} {b.last_name}</h2>
                </div>
              </div>
              {b.choking_risk && (
                <div className="flex items-center gap-2 text-terracotta-500 text-sm font-medium bg-terracotta-500/10 p-2 rounded-lg mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risque de fausse route
                </div>
              )}
              <p className="text-sm text-forest-800">Mobilité : {b.mobility_status}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-forest-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold font-sans text-forest-900 mb-6">Ajouter un bénéficiaire</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Section 1: Identité & Urgences Médicales */}
              <section>
                <h3 className="text-lg font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">1. Identité & Urgences Médicales</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Prénom</label>
                    <input {...register('firstName')} className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.firstName && <p className="text-terracotta-500 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Nom</label>
                    <input {...register('lastName')} className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.lastName && <p className="text-terracotta-500 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Date de naissance</label>
                    <input type="date" {...register('birthDate')} className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.birthDate && <p className="text-terracotta-500 text-xs mt-1">{errors.birthDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Genre</label>
                    <select {...register('gender')} className="w-full border border-sage-200 rounded-lg p-2">
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="autre">Autre</option>
                      <option value="non_renseigné">Non renseigné</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Contact d&apos;urgence principal</label>
                    <input {...register('emergencyContactName')} placeholder="Nom complet" className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.emergencyContactName && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Tél. urgence principal</label>
                    <input {...register('emergencyContactPhone')} placeholder="Numéro de téléphone" className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.emergencyContactPhone && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactPhone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Lien avec le bénéficiaire</label>
                    <input {...register('emergencyContactRelation')} placeholder="Ex: Mère, Tuteur" className="w-full border border-sage-200 rounded-lg p-2" />
                    {errors.emergencyContactRelation && <p className="text-terracotta-500 text-xs mt-1">{errors.emergencyContactRelation.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Contact d&apos;urgence secondaire</label>
                    <input {...register('secondaryEmergencyContact')} placeholder="Nom et téléphone" className="w-full border border-sage-200 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Médecin traitant (Nom & Tél)</label>
                    <div className="flex gap-2">
                      <input {...register('treatingDoctorName')} placeholder="Nom" className="w-1/2 border border-sage-200 rounded-lg p-2" />
                      <input {...register('treatingDoctorPhone')} placeholder="Tél" className="w-1/2 border border-sage-200 rounded-lg p-2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Hôpital de secteur privilégié</label>
                    <input {...register('hospitalPreference')} placeholder="Nom de l'hôpital" className="w-full border border-sage-200 rounded-lg p-2" />
                  </div>
                </div>
              </section>

              {/* Section 2: Autonomie Motrice & Gestes Quotidiens */}
              <section>
                <h3 className="text-lg font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">2. Autonomie Motrice & Gestes Quotidiens</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Autonomie motrice</label>
                    <select {...register('mobilityStatus')} className="w-full border border-sage-200 rounded-lg p-2">
                      <option value="autonome">Autonome</option>
                      <option value="canne_deambulateur">Canne / Déambulateur</option>
                      <option value="fauteuil_manuel">Fauteuil manuel</option>
                      <option value="fauteuil_electrique">Fauteuil électrique</option>
                      <option value="alite">Alité</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Aides aux transferts (Notes)</label>
                    <input {...register('transferNotes')} placeholder="Ex: Aide humaine, verticalisateur..." className="w-full border border-sage-200 rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Habitudes d&apos;hygiène/toilettes</label>
                    <input {...register('toiletHabits')} placeholder="Ex: Autonomie, aide partielle, protections..." className="w-full border border-sage-200 rounded-lg p-2" />
                  </div>
                </div>
              </section>

              {/* Section 3: Alimentation & Risques Vitaux */}
              <section>
                <h3 className="text-lg font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">3. Alimentation & Risques Vitaux</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Alimentation (Texture)</label>
                    <select {...register('dietType')} className="w-full border border-sage-200 rounded-lg p-2">
                      <option value="standard">Standard (Normale)</option>
                      <option value="mixe">Mixée</option>
                      <option value="hache">Hachée</option>
                      <option value="liquide_epaissi">Liquide épaissi</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-terracotta-500 font-bold">
                      <input type="checkbox" {...register('chokingRisk')} className="w-5 h-5 accent-terracotta-500" />
                      Risque de fausse route avéré
                    </label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Allergies et intolérances</label>
                    <textarea {...register('allergiesAndIntolerances')} rows={2} placeholder="Alimentaires ou médicamenteuses" className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Aide au repas (Notes)</label>
                    <textarea {...register('mealAssistanceNotes')} rows={2} placeholder="Ex: Installation, découpe, aide totale à la cuillère..." className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                  </div>
                </div>
              </section>

              {/* Section 4: Communication, Habitudes & Protocoles */}
              <section>
                <h3 className="text-lg font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">4. Communication, Habitudes & Protocoles</h3>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-forest-900 mb-1">Mode de communication</label>
                  <select {...register('communicationMode')} className="w-full border border-sage-200 rounded-lg p-2 md:w-1/3">
                    <option value="verbal">Verbal</option>
                    <option value="pictogrammes_pecs">Pictogrammes / PECS</option>
                    <option value="langue_des_signes">Langue des signes (LSF)</option>
                    <option value="gestes_regards">Gestes et regards</option>
                    <option value="non_verbal">Non verbal</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Ce qui rassure / apaise</label>
                    <textarea {...register('reassuringFactors')} rows={2} placeholder="Ex: Musique douce, rituels spécifiques..." className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                    {errors.reassuringFactors && <p className="text-terracotta-500 text-xs mt-1">{errors.reassuringFactors.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest-900 mb-1">Déclencheurs d&apos;angoisse (Triggers)</label>
                    <textarea {...register('anxietyTriggers')} rows={2} placeholder="Ex: Bruits forts, gestes à proscrire..." className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                    {errors.anxietyTriggers && <p className="text-terracotta-500 text-xs mt-1">{errors.anxietyTriggers.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Activités favorites / Centres d&apos;intérêt</label>
                    <textarea {...register('favoriteActivities')} rows={2} placeholder="Ex: Jeux, promenades, musique..." className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm text-forest-800 mb-1">Protocoles médicaux spécifiques</label>
                    <textarea {...register('medicalProtocols')} rows={2} placeholder="Ex: Consignes en cas de crise d'épilepsie, asthme..." className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 mt-8 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 border border-sage-200 text-forest-800 rounded-lg hover:bg-sage-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-3 bg-forest-800 text-white font-bold rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
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