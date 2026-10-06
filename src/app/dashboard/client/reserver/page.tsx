'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type Beneficiary = { id: string; first_name: string; last_name: string };

export default function ReserverPage() {
  const [step, setStep] = useState(1);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [formula, setFormula] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase
          .from('beneficiaries')
          .select('id, first_name, last_name')
          .eq('client_id', userData.user.id);
        if (data) setBeneficiaries(data);
      }
    };
    fetchBeneficiaries();
  }, [supabase]);

  const calculateHoursAndRate = (formulaType: string) => {
    switch (formulaType) {
      case 'relais_court_2h': return { hours: 2, total: 55, rate: 27.5 };
      case 'demi_journee_4h': return { hours: 4, total: 100, rate: 25 };
      case 'journee_8h': return { hours: 8, total: 185, rate: 23.125 };
      default: return { hours: 1, total: 27, rate: 27 };
    }
  };

  const handleConfirm = async () => {
    if (!selectedBeneficiary || !formula || !date || !startTime) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { hours, total, rate } = calculateHoursAndRate(formula);

      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + hours * 60 * 60 * 1000);

      const { error } = await supabase.from('bookings').insert([{
        client_id: userData.user.id,
        beneficiary_id: selectedBeneficiary,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        service_formula: formula,
        status: 'pending',
        specific_mission_notes: notes,
        hourly_rate: rate,
        total_price: total
      }]);

      if (!error) {
        router.push('/dashboard/client/interventions');
      } else {
        alert("Une erreur est survenue lors de la réservation.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8 text-center">
        Réserver un créneau
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200">
        <div className="flex items-center justify-between mb-8 border-b border-sage-200 pb-4 text-sm md:text-base">
          <div className={`font-bold ${step === 1 ? 'text-forest-900' : 'text-sage-500'}`}>1. Bénéficiaire</div>
          <div className={`font-bold ${step === 2 ? 'text-forest-900' : 'text-sage-500'}`}>2. Formule & Date</div>
          <div className={`font-bold ${step === 3 ? 'text-forest-900' : 'text-sage-500'}`}>3. Consignes</div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Pour qui est cette réservation ?</h2>
            {beneficiaries.length === 0 ? (
              <div className="text-amber-500 bg-amber-50 p-4 rounded-lg">
                Vous devez d&apos;abord ajouter un bénéficiaire dans votre espace.
              </div>
            ) : (
              <select
                value={selectedBeneficiary}
                onChange={(e) => setSelectedBeneficiary(e.target.value)}
                className="w-full border border-sage-200 rounded-lg p-3"
              >
                <option value="">Sélectionnez un bénéficiaire</option>
                {beneficiaries.map(b => (
                  <option key={b.id} value={b.id}>{b.first_name} {b.last_name}</option>
                ))}
              </select>
            )}
            <button
              disabled={!selectedBeneficiary}
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 bg-forest-800 text-white rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Choisissez la formule</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border p-4 rounded-xl cursor-pointer flex flex-col items-center ${formula === 'relais_court_2h' ? 'border-forest-800 bg-mint-100' : 'hover:border-forest-800'}`}>
                <input type="radio" name="formula" value="relais_court_2h" onChange={(e) => setFormula(e.target.value)} className="hidden" />
                <span className="font-bold text-center">Relais 2h</span>
                <span className="text-sm text-forest-700">55 €</span>
              </label>
              <label className={`border p-4 rounded-xl cursor-pointer flex flex-col items-center ${formula === 'demi_journee_4h' ? 'border-forest-800 bg-mint-100' : 'hover:border-forest-800'}`}>
                <input type="radio" name="formula" value="demi_journee_4h" onChange={(e) => setFormula(e.target.value)} className="hidden" />
                <span className="font-bold text-center">Demi-journée 4h</span>
                <span className="text-sm text-forest-700">100 €</span>
              </label>
              <label className={`border p-4 rounded-xl cursor-pointer flex flex-col items-center ${formula === 'journee_8h' ? 'border-forest-800 bg-mint-100' : 'hover:border-forest-800'}`}>
                <input type="radio" name="formula" value="journee_8h" onChange={(e) => setFormula(e.target.value)} className="hidden" />
                <span className="font-bold text-center">Journée 8h</span>
                <span className="text-sm text-forest-700">185 €</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-forest-800 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-sage-200 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm text-forest-800 mb-1">Heure de début</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-sage-200 rounded-lg p-2" />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="w-1/3 py-3 border border-sage-200 text-forest-800 rounded-lg">
                Retour
              </button>
              <button
                disabled={!formula || !date || !startTime}
                onClick={() => setStep(3)}
                className="w-2/3 py-3 bg-forest-800 text-white rounded-lg disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-forest-900 mb-4">Consignes spécifiques</h2>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: L'infirmier passe à 14h, s'assurer que la porte est ouverte."
              className="w-full border border-sage-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-forest-800"
            ></textarea>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(2)} className="w-1/3 py-3 border border-sage-200 text-forest-800 rounded-lg">
                Retour
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-2/3 py-3 bg-terracotta-500 text-white font-bold rounded-lg hover:bg-terracotta-500/90 disabled:opacity-50"
              >
                {loading ? 'Traitement...' : 'Confirmer la réservation'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}