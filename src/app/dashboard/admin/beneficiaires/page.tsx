'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  X, 
  Phone, 
  AlertTriangle, 
  Activity, 
  Utensils, 
  MessageSquare, 
  FileText,
  Search,
  ShieldAlert
} from 'lucide-react';

interface Beneficiary {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  secondary_emergency_contact?: string | null;
  treating_doctor_name?: string | null;
  treating_doctor_phone?: string | null;
  hospital_preference?: string | null;
  mobility_status: string;
  transfer_notes?: string | null;
  toilet_habits?: string | null;
  diet_type: string;
  allergies_and_intolerances?: string | null;
  choking_risk: boolean;
  meal_assistance_notes?: string | null;
  communication_mode: string;
  reassuring_factors: string;
  anxiety_triggers: string;
  favorite_activities?: string | null;
  medical_protocols?: string | null;
  client?: {
    full_name: string;
    phone: string;
    billing_city?: string;
  } | null;
}

export default function AdminBeneficiairesPage() {
  const [beneficiaires, setBeneficiaires] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('beneficiaries')
        .select(`
          *,
          client:client_id (
            full_name,
            phone,
            billing_city
          )
        `)
        .order('last_name', { ascending: true });

      if (!error && data) {
        setBeneficiaires(data as unknown as Beneficiary[]);
      }
      setLoading(false);
    };
    fetchBeneficiaries();
  }, [supabase]);

  const filtered = beneficiaires.filter((b) => {
    const q = search.toLowerCase();
    const fullName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    const clientName = b.client?.full_name?.toLowerCase() || '';
    return fullName.includes(q) || clientName.includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sage-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold font-sans text-forest-900">
            Répertoire Bénéficiaires
          </h1>
          <p className="text-sm text-forest-700 mt-1">
            Dossiers complets et fiches d&apos;accompagnement à domicile.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-sage-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou client..."
            className="w-full pl-9 pr-4 py-2 border border-sage-200 rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-forest-800"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-forest-700 py-12 text-center">Chargement des fiches...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelected(b)}
              className="bg-white p-6 rounded-2xl shadow-xs border border-sage-200 hover:border-forest-800 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold font-sans text-forest-900 capitalize">
                    {b.first_name} {b.last_name}
                  </h2>
                  {b.choking_risk && (
                    <span className="p-1.5 bg-terracotta-500/10 text-terracotta-500 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div className="text-sm text-forest-800 space-y-1">
                  <p>
                    <strong>Client :</strong> {b.client?.full_name || 'Non renseigné'}
                  </p>
                  <p>
                    <strong>Tél :</strong> {b.client?.phone || b.emergency_contact_phone || 'N/C'}
                  </p>
                  <p className="text-xs text-forest-700 pt-1">
                    Mobilité : <span className="capitalize">{b.mobility_status.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-sage-200/50 flex justify-between items-center text-xs">
                {b.choking_risk ? (
                  <span className="text-terracotta-500 font-bold">Fausse route avérée</span>
                ) : (
                  <span className="text-forest-700">Texture : {b.diet_type}</span>
                )}
                <span className="font-semibold text-sage-500 hover:text-forest-800">
                  Fiche complète →
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-sage-200 text-forest-700">
              Aucun bénéficiaire trouvé.
            </div>
          )}
        </div>
      )}

      {/* Modale de la fiche complète */}
      {selected && (
        <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-sage-200 shadow-2xl my-auto space-y-6">
            <div className="flex justify-between items-start border-b border-sage-200 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold font-sans text-forest-900 capitalize">
                    {selected.first_name} {selected.last_name}
                  </h2>
                  {selected.choking_risk && (
                    <span className="px-2.5 py-1 bg-terracotta-500/15 border border-terracotta-500/30 text-terracotta-500 text-xs font-bold rounded-md flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Risque fausse route
                    </span>
                  )}
                </div>
                <p className="text-xs text-forest-700 mt-1">
                  Né(e) le {selected.birth_date} • Genre : {selected.gender}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-forest-700 hover:text-forest-900 p-1.5 rounded-lg hover:bg-sand-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 4 Pôles d'informations */}
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              {/* Pôle Urgences & Contacts */}
              <div className="bg-sand-100/60 p-4 rounded-xl border border-sage-200/60 space-y-3">
                <h3 className="font-bold text-forest-900 flex items-center gap-2 border-b border-sage-200 pb-2 text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4 text-sage-500" /> Contacts & Urgences
                </h3>
                <div className="space-y-1.5 text-xs text-forest-800">
                  <p>
                    <strong>Contact principal :</strong> {selected.emergency_contact_name} ({selected.emergency_contact_relation})
                  </p>
                  <p>
                    <strong>Tél. principal :</strong>{' '}
                    <a href={`tel:${selected.emergency_contact_phone}`} className="text-forest-900 font-semibold underline">
                      {selected.emergency_contact_phone}
                    </a>
                  </p>
                  {selected.secondary_emergency_contact && (
                    <p>
                      <strong>Contact secondaire :</strong> {selected.secondary_emergency_contact}
                    </p>
                  )}
                  <p>
                    <strong>Médecin traitant :</strong> {selected.treating_doctor_name || 'Non renseigné'}{' '}
                    {selected.treating_doctor_phone ? `(${selected.treating_doctor_phone})` : ''}
                  </p>
                  <p>
                    <strong>Hôpital de secteur :</strong> {selected.hospital_preference || 'Non précisé'}
                  </p>
                  <p>
                    <strong>Client rattaché :</strong> {selected.client?.full_name || 'N/C'}{' '}
                    {selected.client?.billing_city ? `(${selected.client.billing_city})` : ''}
                  </p>
                </div>
              </div>

              {/* Pôle Mobilité & Quotidien */}
              <div className="bg-sand-100/60 p-4 rounded-xl border border-sage-200/60 space-y-3">
                <h3 className="font-bold text-forest-900 flex items-center gap-2 border-b border-sage-200 pb-2 text-xs uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-sage-500" /> Motricité & Hygiène
                </h3>
                <div className="space-y-2 text-xs text-forest-800">
                  <p>
                    <strong>Statut de mobilité :</strong>{' '}
                    <span className="capitalize">{selected.mobility_status.replace('_', ' ')}</span>
                  </p>
                  <p>
                    <strong>Aide aux transferts :</strong>{' '}
                    {selected.transfer_notes || 'Aucune note particulière'}
                  </p>
                  <p>
                    <strong>Hygiène & Toilettes :</strong>{' '}
                    {selected.toilet_habits || 'Autonome ou non renseigné'}
                  </p>
                </div>
              </div>

              {/* Pôle Alimentation */}
              <div className="bg-sand-100/60 p-4 rounded-xl border border-sage-200/60 space-y-3">
                <h3 className="font-bold text-forest-900 flex items-center gap-2 border-b border-sage-200 pb-2 text-xs uppercase tracking-wider">
                  <Utensils className="w-4 h-4 text-sage-500" /> Alimentation & Repas
                </h3>
                <div className="space-y-2 text-xs text-forest-800">
                  <p>
                    <strong>Texture du repas :</strong>{' '}
                    <span className="capitalize">{selected.diet_type}</span>
                  </p>
                  <p>
                    <strong>Allergies / Intolérances :</strong>{' '}
                    {selected.allergies_and_intolerances || 'Aucune allergie signalée'}
                  </p>
                  <p>
                    <strong>Aide au repas :</strong>{' '}
                    {selected.meal_assistance_notes || 'Installation habituelle'}
                  </p>
                </div>
              </div>

              {/* Pôle Communication & Habitudes */}
              <div className="bg-sand-100/60 p-4 rounded-xl border border-sage-200/60 space-y-3">
                <h3 className="font-bold text-forest-900 flex items-center gap-2 border-b border-sage-200 pb-2 text-xs uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-sage-500" /> Communication & Habitudes
                </h3>
                <div className="space-y-2 text-xs text-forest-800">
                  <p>
                    <strong>Mode d&apos;expression :</strong>{' '}
                    <span className="capitalize">{selected.communication_mode.replace('_', ' ')}</span>
                  </p>
                  <p>
                    <strong>Ce qui apaise :</strong> {selected.reassuring_factors}
                  </p>
                  <p>
                    <strong>Facteurs d&apos;angoisse :</strong> {selected.anxiety_triggers}
                  </p>
                  <p>
                    <strong>Activités favorites :</strong>{' '}
                    {selected.favorite_activities || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>

            {/* Protocole médical d'urgence (si renseigné) */}
            {selected.medical_protocols && (
              <div className="p-4 bg-terracotta-500/10 border border-terracotta-500/30 rounded-xl space-y-1">
                <h4 className="text-xs font-bold uppercase text-terracotta-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Protocole Médical Spécifique (PAI / Épilepsie)
                </h4>
                <p className="text-xs text-forest-900 whitespace-pre-line">
                  {selected.medical_protocols}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 bg-forest-800 text-white rounded-xl text-sm font-medium hover:bg-forest-700 transition"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}