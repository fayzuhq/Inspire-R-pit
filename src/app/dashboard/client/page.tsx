export default function ClientOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-sans text-forest-900 mb-8">
        Bienvenue dans votre espace client
      </h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage-200">
          <h2 className="text-xl font-bold font-sans text-forest-900 mb-2">Prochaine intervention</h2>
          <p className="text-forest-800">Aucune intervention prévue.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sage-200">
          <h2 className="text-xl font-bold font-sans text-forest-900 mb-2">Factures à régler</h2>
          <p className="text-forest-800">Tout est à jour.</p>
        </div>
      </div>
    </div>
  );
}