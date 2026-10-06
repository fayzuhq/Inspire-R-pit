'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  fullName: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  phone: z.string().min(10, 'Le numéro de téléphone est requis'),
  billingAddress: z.string().min(5, 'L\'adresse est requise'),
  billingPostalCode: z.string().min(5, 'Le code postal est requis'),
  billingCity: z.string().min(2, 'La ville est requise'),
  organizationName: z.string().optional(),
  siret: z.string().optional(),
}).refine(data => {
  if (data.accountType === 'organization') {
    return !!data.organizationName && !!data.siret;
  }
  return true;
}, {
  message: "Le nom de l'organisme et le SIRET sont requis pour un compte organisme",
  path: ["siret"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: 'individual',
    },
  });

  const accountType = watch('accountType');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Profile
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            role: 'client',
            account_type: data.accountType,
            full_name: data.fullName,
            phone: data.phone,
            billing_address: data.billingAddress,
            billing_postal_code: data.billingPostalCode,
            billing_city: data.billingCity,
            organization_name: data.accountType === 'organization' ? data.organizationName : null,
            siret: data.accountType === 'organization' ? data.siret : null,
          }
        ]);

        if (profileError) throw profileError;

        router.push('/dashboard/client');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg border border-sage-200">
        <div className="flex justify-center mb-6">
          <Heart className="w-12 h-12 text-terracotta-500" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-forest-900 text-center mb-8">
          Créer un compte Inspire Répit
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-terracotta-500/10 border border-terracotta-500 text-terracotta-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors ${accountType === 'individual' ? 'border-forest-800 bg-mint-100' : 'border-sage-200 hover:border-sage-500'}`}>
              <input type="radio" value="individual" {...register('accountType')} className="hidden" />
              <span className="font-bold text-forest-900">Particulier / Aidant familial</span>
            </label>
            <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors ${accountType === 'organization' ? 'border-forest-800 bg-mint-100' : 'border-sage-200 hover:border-sage-500'}`}>
              <input type="radio" value="organization" {...register('accountType')} className="hidden" />
              <span className="font-bold text-forest-900 text-center">Organisme / Foyer / Mandataire judiciaire</span>
            </label>
          </div>

          {accountType === 'organization' && (
            <div className="grid md:grid-cols-2 gap-4 bg-sand-100 p-4 rounded-xl border border-sage-200">
              <div>
                <label className="block text-sm font-medium text-forest-900 mb-1">Raison sociale</label>
                <input {...register('organizationName')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
                {errors.organizationName && <p className="text-terracotta-500 text-xs mt-1">{errors.organizationName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-900 mb-1">SIRET</label>
                <input {...register('siret')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
                {errors.siret && <p className="text-terracotta-500 text-xs mt-1">{errors.siret.message}</p>}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Nom complet (Contact)</label>
              <input {...register('fullName')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.fullName && <p className="text-terracotta-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Téléphone</label>
              <input {...register('phone')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.phone && <p className="text-terracotta-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Email</label>
              <input type="email" {...register('email')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.email && <p className="text-terracotta-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Mot de passe</label>
              <input type="password" {...register('password')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.password && <p className="text-terracotta-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-900 mb-1">Adresse de facturation complète</label>
            <input {...register('billingAddress')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
            {errors.billingAddress && <p className="text-terracotta-500 text-xs mt-1">{errors.billingAddress.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Code postal</label>
              <input {...register('billingPostalCode')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.billingPostalCode && <p className="text-terracotta-500 text-xs mt-1">{errors.billingPostalCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-900 mb-1">Ville</label>
              <input {...register('billingCity')} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 outline-none" />
              {errors.billingCity && <p className="text-terracotta-500 text-xs mt-1">{errors.billingCity.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-800">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-sage-500 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-forest-800">
          <Link href="/" className="text-sage-500 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
