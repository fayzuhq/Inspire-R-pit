import { Heart, Calendar, Shield, Users, Clock, Coffee, HeartHandshake, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="px-6 lg:px-8 py-6 border-b border-sage-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-terracotta-500" />
            <span className="text-2xl font-bold font-sans text-forest-900 tracking-tight">
              Inspire Répit
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#services" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Services</a>
            <a href="#fonctionnement" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Fonctionnement</a>
            <a href="#tarifs" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Tarifs</a>
            <a href="#apropos" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Notre approche</a>
            <a href="#faq" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">FAQ</a>
            <a href="#contact" className="text-forest-800 hover:text-sage-500 font-medium transition-colors">Contact</a>
          </nav>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="hidden md:flex items-center justify-center px-4 py-2 text-forest-800 font-medium border border-forest-800 rounded-lg hover:bg-mint-100 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/dashboard/client/reserver"
              className="flex items-center justify-center px-4 py-2 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors"
            >
              Réserver un créneau
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
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
                <a
                  href="#services"
                  className="px-6 py-3 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors text-center inline-block"
                >
                  Découvrir nos services
                </a>
                <Link
                  href="/auth/register"
                  className="px-6 py-3 bg-white text-forest-800 font-medium rounded-lg border border-sage-200 hover:bg-sage-200 hover:text-forest-900 transition-colors text-center"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative h-96 rounded-2xl overflow-hidden bg-sage-200 shadow-xl border border-sage-200">
              <div className="absolute inset-0 flex items-center justify-center text-forest-700/50 flex-col gap-4">
                 <Heart className="w-24 h-24" />
                 <span className="font-sans font-medium text-xl">Accompagnement humain</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Services Section */}
        <section id="services" className="px-6 lg:px-8 py-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-16">
              Nos services d&apos;accompagnement
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-sage-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Relais à domicile</h3>
                <p className="text-forest-800">
                  Présence rassurante et sécurisante au domicile. Aide aux gestes du quotidien, stimulation, et veille bienveillante.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sand-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Sorties & Lien social</h3>
                <p className="text-forest-800">
                  Accompagnement extérieur, promenades, rendez-vous médicaux ou loisirs pour maintenir le lien social et l&apos;autonomie.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-mint-100 rounded-lg flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6 text-sage-500" />
                </div>
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4">Accompagnement personnalisé</h3>
                <p className="text-forest-800">
                  Prise en charge adaptée aux pathologies spécifiques (autisme, Alzheimer, polyhandicap) avec des protocoles stricts.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-terracotta-500" /> Relais ponctuel
                </h3>
                <p className="text-forest-800">Besoin de souffler quelques heures ? Intervention d&apos;urgence ou prévue pour vous permettre de vous absenter sereinement.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-sage-200 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold font-sans text-forest-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sage-500" /> Relais régulier
                </h3>
                <p className="text-forest-800">Mise en place d&apos;interventions hebdomadaires ou mensuelles pour vous offrir un répit structuré et prévisible.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnement Section */}
        <section id="fonctionnement" className="px-6 lg:px-8 py-20 bg-sand-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-16">
              Comment ça fonctionne ?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-forest-800 font-bold text-2xl mx-auto mb-4 border-2 border-sage-200 shadow-sm">1</div>
                <h3 className="font-bold text-forest-900 mb-2">Inscription</h3>
                <p className="text-sm text-forest-800">Créez votre compte et ajoutez les profils de vos bénéficiaires.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-forest-800 font-bold text-2xl mx-auto mb-4 border-2 border-sage-200 shadow-sm">2</div>
                <h3 className="font-bold text-forest-900 mb-2">Réservation</h3>
                <p className="text-sm text-forest-800">Choisissez la formule et les horaires qui vous conviennent.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-forest-800 font-bold text-2xl mx-auto mb-4 border-2 border-sage-200 shadow-sm">3</div>
                <h3 className="font-bold text-forest-900 mb-2">Intervention</h3>
                <p className="text-sm text-forest-800">Notre intervenant prend le relais en toute sécurité.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-forest-800 font-bold text-2xl mx-auto mb-4 border-2 border-sage-200 shadow-sm">4</div>
                <h3 className="font-bold text-forest-900 mb-2">Suivi</h3>
                <p className="text-sm text-forest-800">Consultez le cahier de liaison numérique après chaque garde.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tarifs Section */}
        <section id="tarifs" className="px-6 lg:px-8 py-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-16">
              Nos tarifs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Carte Tarif 1 */}
              <div className="bg-white p-6 rounded-2xl border border-sage-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-forest-900 mb-2">Relais court</h3>
                <p className="text-forest-700 text-sm mb-4">2 heures d&apos;intervention</p>
                <div className="text-3xl font-bold text-terracotta-500 mb-6">55 €</div>
                <ul className="text-sm text-forest-800 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Idéal pour une course</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Présence sécurisante</li>
                </ul>
                <Link href="/dashboard/client/reserver" className="w-full py-2 bg-mint-100 text-forest-800 font-medium rounded-lg text-center hover:bg-sage-200 transition-colors">Réserver</Link>
              </div>
              {/* Carte Tarif 2 */}
              <div className="bg-white p-6 rounded-2xl border border-sage-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Populaire</div>
                <h3 className="text-xl font-bold text-forest-900 mb-2">Demi-journée</h3>
                <p className="text-forest-700 text-sm mb-4">4 heures d&apos;intervention</p>
                <div className="text-3xl font-bold text-terracotta-500 mb-6">100 €</div>
                <ul className="text-sm text-forest-800 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Sortie ou activité</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Aide au repas</li>
                </ul>
                <Link href="/dashboard/client/reserver" className="w-full py-2 bg-forest-800 text-white font-medium rounded-lg text-center hover:bg-forest-700 transition-colors">Réserver</Link>
              </div>
              {/* Carte Tarif 3 */}
              <div className="bg-white p-6 rounded-2xl border border-sage-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-forest-900 mb-2">Journée répit</h3>
                <p className="text-forest-700 text-sm mb-4">8 heures d&apos;intervention</p>
                <div className="text-3xl font-bold text-terracotta-500 mb-6">185 €</div>
                <ul className="text-sm text-forest-800 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Répit complet</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Accompagnement global</li>
                </ul>
                <Link href="/dashboard/client/reserver" className="w-full py-2 bg-mint-100 text-forest-800 font-medium rounded-lg text-center hover:bg-sage-200 transition-colors">Réserver</Link>
              </div>
              {/* Carte Tarif 4 */}
              <div className="bg-white p-6 rounded-2xl border border-sage-200 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold text-forest-900 mb-2">À l&apos;heure</h3>
                <p className="text-forest-700 text-sm mb-4">Sur mesure</p>
                <div className="text-3xl font-bold text-terracotta-500 mb-6">Dès 27 €<span className="text-lg text-forest-700">/h</span></div>
                <ul className="text-sm text-forest-800 space-y-2 mb-6 flex-grow">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Flexibilité totale</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Selon vos besoins</li>
                </ul>
                <Link href="/dashboard/client/reserver" className="w-full py-2 bg-mint-100 text-forest-800 font-medium rounded-lg text-center hover:bg-sage-200 transition-colors">Réserver</Link>
              </div>
            </div>

            <div className="mt-8 bg-mint-100 p-6 rounded-2xl text-forest-800 text-sm">
              <strong>Majorations applicables :</strong> Samedi dès 28 €/h • Soirée (après 20h) dès 29 €/h • Dimanche et jours fériés dès 30 €/h.
            </div>
          </div>
        </section>

        {/* Relaxation & Aides Section */}
        <section id="relaxation" className="px-6 lg:px-8 py-20 bg-forest-900 text-cream-50">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-sans mb-6">Le bien-être des aidants est notre priorité</h2>
              <p className="mb-6 text-sage-200">
                Prendre soin d&apos;un proche est gratifiant mais peut être épuisant. Inspire Répit vous permet de retrouver du temps pour vous, sans culpabilité, en sachant votre proche entre de bonnes mains.
              </p>
              <div className="bg-forest-800 p-6 rounded-xl border border-forest-700">
                <h3 className="font-bold text-lg mb-2 text-white">Aides financières possibles</h3>
                <p className="text-sm text-sage-200">
                  Nos prestations peuvent être financées en partie par différentes aides selon votre situation :
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> APA (Allocation Personnalisée d&apos;Autonomie)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> PCH (Prestation de Compensation du Handicap)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sage-500"/> Aides des caisses de retraite et mutuelles</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-forest-800 rounded-2xl h-48 flex items-center justify-center border border-forest-700">
                 <Coffee className="w-12 h-12 text-sage-500" />
               </div>
               <div className="bg-forest-800 rounded-2xl h-48 flex items-center justify-center border border-forest-700 mt-8">
                 <Heart className="w-12 h-12 text-terracotta-500" />
               </div>
            </div>
          </div>
        </section>

        {/* À Propos Section */}
        <section id="apropos" className="px-6 lg:px-8 py-20 bg-background">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-16">
              Notre démarche médico-sociale
            </h2>
            <div className="max-w-3xl mx-auto text-forest-800 space-y-6 text-lg">
              <p>
                Chez Inspire Répit, nous croyons qu&apos;un accompagnement de qualité repose sur une connaissance approfondie de chaque personne.
              </p>
              <p>
                Notre plateforme permet de centraliser toutes les informations vitales et les habitudes de vie de vos proches (protocoles médicaux, allergies, modes de communication, etc.). Ainsi, chaque intervention est préparée et sécurisée.
              </p>
              <p>
                Nous nous engageons à offrir une présence humaine, chaleureuse et professionnelle, respectueuse de la dignité et du rythme de chaque bénéficiaire.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-6 lg:px-8 py-20 bg-sand-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-sans text-forest-900 text-center mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              <details className="bg-white p-6 rounded-xl border border-sage-200 group cursor-pointer">
                <summary className="font-bold text-forest-900 flex justify-between items-center">
                  Quels types de profils accompagnez-vous ?
                  <span className="text-sage-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-forest-800 text-sm">
                  Nous accompagnons les personnes âgées en perte d&apos;autonomie (Alzheimer, etc.) ainsi que les enfants et adultes en situation de handicap (autisme, polyhandicap, handicaps moteurs ou cognitifs).
                </p>
              </details>
              <details className="bg-white p-6 rounded-xl border border-sage-200 group cursor-pointer">
                <summary className="font-bold text-forest-900 flex justify-between items-center">
                  Comment garantissez-vous la sécurité de mon proche ?
                  <span className="text-sage-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-forest-800 text-sm">
                  Lors de l&apos;inscription, vous remplissez une fiche médicale détaillée. L&apos;intervenant a accès à ces consignes d&apos;urgence, aux allergies, aux risques spécifiques (fausse route) et aux éléments qui rassurent votre proche.
                </p>
              </details>
              <details className="bg-white p-6 rounded-xl border border-sage-200 group cursor-pointer">
                <summary className="font-bold text-forest-900 flex justify-between items-center">
                  Puis-je utiliser le CESU ?
                  <span className="text-sage-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-forest-800 text-sm">
                  Oui, en tant que service à la personne, nous acceptons le CESU (Chèque Emploi Service Universel) et nos prestations vous donnent droit à un crédit d&apos;impôt de 50% selon la législation en vigueur.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-6 lg:px-8 py-20 bg-background border-t border-sage-200">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold font-sans text-forest-900 mb-6">Contactez-nous</h2>
              <p className="text-forest-800 mb-8">
                Vous avez des questions spécifiques ? Vous souhaitez échanger sur la situation de votre proche avant de réserver ? N&apos;hésitez pas à nous écrire.
              </p>
              <div className="space-y-4 text-forest-800">
                <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
                <p><strong>Email :</strong> contact@inspirerepit.fr</p>
                <p><strong>Horaires :</strong> Lundi - Vendredi, 9h - 18h</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-sage-200 shadow-sm">
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-forest-900 mb-1">Nom complet</label>
                  <input type="text" id="name" className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-forest-900 mb-1">Email</label>
                  <input type="email" id="email" className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-forest-900 mb-1">Message</label>
                  <textarea id="message" rows={4} className="w-full px-4 py-2 border border-sage-200 rounded-lg focus:ring-2 focus:ring-forest-800 focus:border-transparent outline-none"></textarea>
                </div>
                <button type="button" className="w-full py-3 bg-forest-800 text-white font-medium rounded-lg hover:bg-forest-700 transition-colors">
                  Envoyer le message
                </button>
              </form>
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
          <div className="flex gap-4 text-sm text-sage-200">
            <a href="#" className="hover:text-white">Mentions légales</a>
            <a href="#" className="hover:text-white">CGU</a>
            <a href="#" className="hover:text-white">Confidentialité</a>
          </div>
          <p className="text-sage-200 text-sm">
            © {new Date().getFullYear()} Inspire Répit. Tous droits réservés. Service à la personne.
          </p>
        </div>
      </footer>
    </div>
  );
}