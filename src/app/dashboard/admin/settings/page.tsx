'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';

const settingsSchema = z.object({
  id: z.string().optional(),
  provider_name: z.string().min(2),
  organization_name: z.string().optional(),
  legal_status: z.string().min(2),
  siret: z.string().min(14),
  sap_number: z.string().min(5),
  address: z.string().min(5),
  postal_code: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  iban: z.string().min(14),
  bic: z.string().min(8),
  nan_number: z.string().optional()
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema)
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('provider_settings').select('*').limit(1).single();
      if (data) {
        reset(data);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [supabase, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setSubmitting(true);
    setMessage('');

    if (data.id) {
        const { error } = await supabase.from('provider_settings').update(data).eq('id', data.id);
        if (error) setMessage("Erreur lors de la mise à jour.");
        else setMessage("Paramètres mis à jour avec succès.");
    } else {
        const { error } = await supabase.from('provider_settings').insert([data]);
        if (error) setMessage("Erreur lors de la création.");
        else setMessage("Paramètres créés avec succès.");
    }

    setSubmitting(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8 flex items-center gap-2">
        <Settings className="w-8 h-8 text-sage-500" />
        Paramètres de l&apos;entreprise
      </h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-mint-100 text-forest-900 border border-sage-200 font-bold">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 space-y-8">

        <section>
          <h2 className="text-xl font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">Informations Légales</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Nom du prestataire</label>
              <input {...register('provider_name')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Nom de l&apos;organisme (Optionnel)</label>
              <input {...register('organization_name')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Statut juridique</label>
              <input {...register('legal_status')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">SIRET</label>
              <input {...register('siret')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-forest-900 mb-1">Numéro d&apos;agrément SAP (Nova)</label>
              <input {...register('sap_number')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">Coordonnées</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-forest-900 mb-1">Adresse postale</label>
              <input {...register('address')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Code postal</label>
              <input {...register('postal_code')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Ville</label>
              <input {...register('city')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Téléphone</label>
              <input {...register('phone')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Email de contact</label>
              <input type="email" {...register('email')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-forest-900 mb-4 border-b border-sage-200 pb-2">Coordonnées Bancaires (Factures)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">IBAN</label>
              <input {...register('iban')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">BIC</label>
              <input {...register('bic')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-forest-900 mb-1">Numéro NAN (CESU) (Optionnel)</label>
              <input {...register('nan_number')} className="w-full border border-sage-200 rounded-lg p-2" />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={submitting} className="px-8 py-3 bg-forest-800 text-white font-bold rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50">
            {submitting ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}