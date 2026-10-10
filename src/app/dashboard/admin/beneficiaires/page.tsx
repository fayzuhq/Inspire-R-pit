'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Beneficiary = {
  id: string;
  first_name: string;
  last_name: string;
  choking_risk: boolean;
  client: { full_name: string; phone: string };
};

export default function AdminBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      const { data } = await supabase
        .from('beneficiaries')
        .select(`
          id, first_name, last_name, choking_risk,
          client:client_id (full_name, phone)
        `)
        .order('last_name', { ascending: true });

      if (data) setBeneficiaires(data as unknown as Beneficiary[]);
      setLoading(false);
    };
    fetchBeneficiaries();
  }, [supabase]);

  const filtered = beneficiaires.filter(b =>
    b.first_name.toLowerCase().includes(search.toLowerCase()) ||
    b.last_name.toLowerCase().includes(search.toLowerCase()) ||
    b.client.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold font-sans text-forest-900">
          Répertoire Bénéficiaires
        </h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full md:w-auto px-4 py-2 border border-sage-200 rounded-lg outline-none focus:ring-2 focus:ring-sage-500"
        />
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sage-200">
              <h2 className="text-xl font-bold font-sans text-forest-900 mb-2">{b.first_name} {b.last_name}</h2>
              <p className="text-sm text-forest-800 mb-1"><strong>Client:</strong> {b.client.full_name}</p>
              <p className="text-sm text-forest-800 mb-4"><strong>Tél:</strong> {b.client.phone}</p>
              {b.choking_risk && (
                <span className="bg-terracotta-500/10 text-terracotta-500 px-2 py-1 rounded text-xs font-bold border border-terracotta-500">Risque Fausse route</span>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-forest-800">Aucun résultat.</p>}
        </div>
      )}
    </div>
  );
}