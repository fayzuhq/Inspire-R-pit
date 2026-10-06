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
  mobilityStatus: z.enum(['autonome', 'canne_deambulateur', 'fauteuil_manuel', 'fauteuil_electrique', 'alite']),
  dietType: z.enum(['standard', 'mixe', 'hache', 'liquide_epaissi']),
  chokingRisk: z.boolean(),
  communicationMode: z.enum(['verbal', 'pictogrammes_pecs', 'langue_des_signes', 'gestes_regards', 'non_verbal']),
  reassuringFactors: z.string().min(5, 'Ce champ est requis'),
  anxietyTriggers: z.string().min(5, 'Ce champ est requis'),
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
        mobility_status: data.mobilityStatus,
        diet_type: data.dietType,
        choking_risk: data.chokingRisk,
        communication_mode: data.communicationMode,
        reassuring_factors: data.reassuringFactors,
        anxiety_triggers: data.anxietyTriggers,
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold font-sans text-forest-900 mb-6">Ajouter un bénéficiaire</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid md:grid-cols-2 gap-4 border-b border-sage-200 pb-4">
                <div>
                  <label className="block text-sm font-bold text-forest-900 mb-1">Prénom</label>
                  <input {...register('firstName')} className="w-full border border-sage-200 rounded-lg p-2" />
                  {errors.firstName && <p className="text-terracotta-500 text-xs">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest-900 mb-1">Nom</label>
                  <input {...register('lastName')} className="w-full border border-sage-200 rounded-lg p-2" />
                  {errors.lastName && <p className="text-terracotta-500 text-xs">{errors.lastName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-forest-900 mb-1">Date de naissance</label>
                  <input type="date" {...register('birthDate')} className="w-full border border-sage-200 rounded-lg p-2" />
                  {errors.birthDate && <p className="text-terracotta-500 text-xs">{errors.birthDate.message}</p>}
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

              <div>
                 <h3 className="font-bold text-forest-900 mb-2">Contact d&apos;urgence</h3>
                 <div className="grid md:grid-cols-3 gap-4 border-b border-sage-200 pb-4">
                    <div>
                      <label className="block text-sm text-forest-800 mb-1">Nom complet</label>
                      <input {...register('emergencyContactName')} className="w-full border border-sage-200 rounded-lg p-2" />
                      {errors.emergencyContactName && <p className="text-terracotta-500 text-xs">{errors.emergencyContactName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-forest-800 mb-1">Téléphone</label>
                      <input {...register('emergencyContactPhone')} className="w-full border border-sage-200 rounded-lg p-2" />
                      {errors.emergencyContactPhone && <p className="text-terracotta-500 text-xs">{errors.emergencyContactPhone.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-forest-800 mb-1">Lien de parenté/Rôle</label>
                      <input {...register('emergencyContactRelation')} placeholder="Ex: Mère, Tuteur" className="w-full border border-sage-200 rounded-lg p-2" />
                      {errors.emergencyContactRelation && <p className="text-terracotta-500 text-xs">{errors.emergencyContactRelation.message}</p>}
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 border-b border-sage-200 pb-4">
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
                  <label className="block text-sm font-bold text-forest-900 mb-1">Mode de communication</label>
                  <select {...register('communicationMode')} className="w-full border border-sage-200 rounded-lg p-2">
                    <option value="verbal">Verbal</option>
                    <option value="pictogrammes_pecs">Pictogrammes / PECS</option>
                    <option value="langue_des_signes">Langue des signes (LSF)</option>
                    <option value="gestes_regards">Gestes et regards</option>
                    <option value="non_verbal">Non verbal</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 border-b border-sage-200 pb-4">
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

              <div>
                <label className="block text-sm font-bold text-forest-900 mb-1">Ce qui rassure / apaise</label>
                <textarea {...register('reassuringFactors')} rows={2} className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                {errors.reassuringFactors && <p className="text-terracotta-500 text-xs">{errors.reassuringFactors.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-forest-900 mb-1">Déclencheurs d&apos;angoisse (Triggers)</label>
                <textarea {...register('anxietyTriggers')} rows={2} className="w-full border border-sage-200 rounded-lg p-2"></textarea>
                {errors.anxietyTriggers && <p className="text-terracotta-500 text-xs">{errors.anxietyTriggers.message}</p>}
              </div>

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