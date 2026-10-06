import { Heart, Calendar, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 lg:px-8 py-6 border-b border-sage-200 bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-terracotta-500" />
            <span className="text-2xl font-bold font-sans text-forest-900 tracking-tight">
              Inspire Répit
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#services" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Services</a>
            <a href="#about" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Notre approche</a>
            <a href="#contact" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Contact</a>
          </nav>
          <div className="flex gap-4">
            <button className="hidden md:flex items-center justify-center px-4 py-2 text-forest-800 font-medium border border-forest-800 rounded-lg hover:bg-mint-100 transition-colors">
              Se connecter
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors">
              Réserver un créneau
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="px-6 lg:px-8 py-20 bg-mint-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-sans text-forest-900 leading-tight mb-6">
                Le relais de confiance pour vos proches vulnérables
              </h1>
              <p className="text-lg text-forest-800 mb-8 max-w-lg">
                Inspire Répit offre un accompagnement médico-social sur-mesure pour les personnes en situation de handicap et les personnes âgées, permettant aux aidants de souffler en toute sérénité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors text-center">
                  Découvrir nos services
                </button>
                <button className="px-6 py-3 bg-white text-forest-800 font-medium rounded-lg border border-sage-200 hover:bg-sage-200 hover:text-forest-900 transition-colors text-center">
                  Créer un compte
                </button>
              </div>
            </div>
            <div className="hidden md:block relative h-96 rounded-2xl overflow-hidden bg-sage-200 shadow-xl border border-sage-200">
              <div className="absolute inset-0 flex items-center justify-center text-forest-700/50 flex-col gap-4">
                 {/* Placeholder pour une image de qualité médicale/humaine */}
                 <Heart className="w-24 h-24" />
                 <span className="font-sans font-medium text-xl">Accompagnement humain</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 lg:px-8 py-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-16">
              Pourquoi choisir Inspire Répit ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-sage-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Sécurité & Expertise</h3>
                <p className="text-forest-800">
                  Des fiches de suivi médicalisées rigoureuses (protocoles d&apos;urgence, allergies, habitudes) pour une prise en charge sécurisée à 100%.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sand-100 rounded-lg flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Réservation flexible</h3>
                <p className="text-forest-800">
                  Réservez facilement des créneaux (relais court, demi-journée, journée) selon vos besoins et ceux de vos bénéficiaires.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-sage-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Liaison transparente</h3>
                <p className="text-forest-800">
                  Accédez à un cahier de liaison numérique détaillé après chaque intervention pour un suivi continu et rassurant.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-forest-900 text-cream-50 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-terracotta-500" />
            <span className="text-xl font-bold font-sans tracking-tight">Inspire Répit</span>
          </div>
          <p className="text-sage-200 text-sm">
            © {new Date().getFullYear()} Inspire Répit. Tous droits réservés. Service à la personne.
          </p>
        </div>
      </footer>
    </div>
  );
}
