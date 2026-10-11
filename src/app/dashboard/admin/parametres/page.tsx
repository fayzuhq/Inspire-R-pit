'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building, MapPin, Check, FileText } from 'lucide-react';

const providerSettingsSchema = z.object({
  id: z.string().optional(),
  provider_name: z.string().min(1, 'Requis'),
  organization_name: z.string().optional(),
  legal_status: z.string().min(1, 'Requis'),
  siret: z.string().min(14, 'Doit contenir au moins 14 caractères'),
  sap_number: z.string().min(1, 'Requis'),
  address: z.string().min(1, 'Requis'),
  postal_code: z.string().min(5, 'Requis'),
  city: z.string().min(1, 'Requis'),
  phone: z.string().min(10, 'Requis'),
  email: z.string().email('Email invalide'),
  iban: z.string().min(14, 'Requis'),
  bic: z.string().min(8, 'Requis'),
  nan_number: z.string().optional(),
});

type ProviderSettingsForm = z.infer<typeof providerSettingsSchema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProviderSettingsForm>({
    resolver: zodResolver(providerSettingsSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('provider_settings')
        .select('*')
        .single();

      if (data) {
        reset(data);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [supabase, reset]);

  const onSubmit = async (data: ProviderSettingsForm) => {
    setSaving(true);
    setSuccess(false);

    try {
      if (data.id) {
        await supabase
          .from('provider_settings')
          .update({
            provider_name: data.provider_name,
            organization_name: data.organization_name,
            legal_status: data.legal_status,
            siret: data.siret,
            sap_number: data.sap_number,
            address: data.address,
            postal_code: data.postal_code,
            city: data.city,
            phone: data.phone,
            email: data.email,
            iban: data.iban,
            bic: data.bic,
            nan_number: data.nan_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
      } else {
        await supabase
          .from('provider_settings')
          .insert([data]);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement des paramètres...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans text-forest-900 mb-2">
          Paramètres du Prestataire
        </h1>
        <p className="text-forest-700">
          Ces informations seront utilisées pour générer les factures et les attestations fiscales.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-sage-200 p-6 md:p-8 space-y-8 shadow-sm">

        {/* Identité & Statut Légal */}
        <div>
          <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2 border-b border-sage-200 pb-2">
            <Building className="w-5 h-5 text-sage-500" /> Identité & Légal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Nom du Prestataire *</label>
              <input
                {...register('provider_name')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.provider_name && <p className="text-terracotta-500 text-xs mt-1">{errors.provider_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Nom de l&apos;Organisation (Optionnel)</label>
              <input
                {...register('organization_name')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Statut Légal *</label>
              <input
                {...register('legal_status')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
                placeholder="Ex: Entrepreneur Individuel"
              />
              {errors.legal_status && <p className="text-terracotta-500 text-xs mt-1">{errors.legal_status.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">SIRET *</label>
              <input
                {...register('siret')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.siret && <p className="text-terracotta-500 text-xs mt-1">{errors.siret.message}</p>}
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div>
          <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2 border-b border-sage-200 pb-2">
            <MapPin className="w-5 h-5 text-sage-500" /> Coordonnées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-forest-900 mb-1">Adresse *</label>
              <input
                {...register('address')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.address && <p className="text-terracotta-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Code Postal *</label>
              <input
                {...register('postal_code')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.postal_code && <p className="text-terracotta-500 text-xs mt-1">{errors.postal_code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Ville *</label>
              <input
                {...register('city')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.city && <p className="text-terracotta-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Téléphone *</label>
              <input
                {...register('phone')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.phone && <p className="text-terracotta-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Email *</label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.email && <p className="text-terracotta-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Agréments & Banque */}
        <div>
          <h2 className="text-xl font-bold text-forest-900 mb-4 flex items-center gap-2 border-b border-sage-200 pb-2">
            <FileText className="w-5 h-5 text-sage-500" /> Agréments & Banque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Numéro de déclaration Nova / SAP *</label>
              <input
                {...register('sap_number')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              <p className="text-xs text-forest-700 mt-1">Nécessaire pour les attestations fiscales (CESU).</p>
              {errors.sap_number && <p className="text-terracotta-500 text-xs mt-1">{errors.sap_number.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">Numéro d&apos;affiliation NAN (Optionnel)</label>
              <input
                {...register('nan_number')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              <p className="text-xs text-forest-700 mt-1">Numéro d&apos;affilié National d&apos;Encaissement (CESU préfinancé).</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">IBAN *</label>
              <input
                {...register('iban')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.iban && <p className="text-terracotta-500 text-xs mt-1">{errors.iban.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-forest-900 mb-1">BIC *</label>
              <input
                {...register('bic')}
                className="w-full border border-sage-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-forest-800"
              />
              {errors.bic && <p className="text-terracotta-500 text-xs mt-1">{errors.bic.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-sage-200 flex justify-end items-center gap-4">
          {success && (
            <span className="text-mint-600 font-bold flex items-center gap-1 bg-mint-100 px-3 py-1.5 rounded-lg border border-mint-200">
              <Check className="w-4 h-4" /> Sauvegardé avec succès
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-forest-800 text-white font-bold rounded-xl hover:bg-forest-700 transition disabled:opacity-50"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </div>
  );
}
