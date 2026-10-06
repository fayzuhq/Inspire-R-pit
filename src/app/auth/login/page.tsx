'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Identifiants incorrects.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre adresse email avant de vous connecter.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Middleware will handle redirection, but let's refresh
      router.push('/dashboard/client');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-sage-200">
        <div className="flex justify-center mb-6">
          <Heart className="w-12 h-12 text-terracotta-500" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-forest-900 text-center mb-8">
          Connexion à Inspire Répit
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-terracotta-500/10 border border-terracotta-500 text-terracotta-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest-900 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-forest-900 mb-1" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-forest-800">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-sage-500 font-bold hover:underline">
            Créer un compte
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
