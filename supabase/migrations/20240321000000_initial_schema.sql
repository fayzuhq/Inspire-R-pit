-- Extensions requises
create extension if not exists "uuid-ossp";

-- 1. Table des Utilisateurs / Profils
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'client' check (role in ('admin', 'client')),
  account_type text not null default 'individual' check (account_type in ('individual', 'organization')),
  full_name text not null,
  organization_name text, -- Ex: "Foyer d'Accueil Médicalisé Les Glycines"
  siret text,             -- Requis si account_type = 'organization'
  phone text not null,
  billing_address text not null,
  billing_postal_code text not null,
  billing_city text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Table des Bénéficiaires (personnes accompagnées)
create table public.beneficiaries (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  gender text check (gender in ('homme', 'femme', 'autre', 'non_renseigné')),

  -- Sécurité & Contacts d'Urgence
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  emergency_contact_relation text not null, -- Ex: "Père", "Tutrice", "Infirmier coordinateur"
  secondary_emergency_contact text,
  treating_doctor_name text,
  treating_doctor_phone text,
  hospital_preference text,

  -- Autonomie Motrice & Transferts
  mobility_status text not null check (mobility_status in ('autonome', 'canne_deambulateur', 'fauteuil_manuel', 'fauteuil_electrique', 'alite')),
  transfer_notes text, -- Aide humaine requise, utilisation de verticalisateur/lève-personne
  toilet_habits text,   -- Protections, horaires de change, aide partielle

  -- Alimentation & Risques
  diet_type text not null default 'standard' check (diet_type in ('standard', 'mixe', 'hache', 'liquide_epaissi')),
  allergies_and_intolerances text,
  choking_risk boolean default false not null, -- Risque de fausse route (OUI/NON)
  meal_assistance_notes text,

  -- Communication, Sensoriel & Comportement
  communication_mode text not null check (communication_mode in ('verbal', 'pictogrammes_pecs', 'langue_des_signes', 'gestes_regards', 'non_verbal')),
  reassuring_factors text not null, -- Ce qui apaise, musique, rituels
  anxiety_triggers text not null,    -- Ce qui stresse, bruits, gestes à proscrire
  favorite_activities text,

  -- Protocoles Médicaux Spécifiques
  medical_protocols text, -- Consignes spécifiques en cas de crise (épilepsie, asthme, diabète)

  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Table des Réservations / Missions
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete cascade not null,
  beneficiary_id uuid references public.beneficiaries(id) on delete restrict not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  service_formula text not null check (service_formula in ('relais_court_2h', 'demi_journee_4h', 'journee_8h', 'horaire_libre')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  specific_mission_notes text,
  hourly_rate numeric(10,2) not null,
  total_price numeric(10,2) not null,
  admin_notes text, -- Notes privées visibles par l'admin uniquement
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Cahier de Liaison Numérique (Transmissions post-garde)
create table public.liaison_logs (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  author_id uuid references public.profiles(id) not null,
  mood_observation text not null, -- Humeur globale
  activities_done text not null,  -- Activités réalisées (promenade, jeux, repos)
  meals_and_hydration text not null, -- Repas et boisson pris
  incidents_or_alerts text,       -- Renseigné si problème ou mention "RAS"
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. Facturation Électronique
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text not null unique, -- Format : FA-YYYYMM-XXXX
  client_id uuid references public.profiles(id) not null,
  booking_id uuid references public.bookings(id) on delete set null,
  amount_ht numeric(10,2) not null,
  vat_rate numeric(5,2) not null default 0.00, -- Exonération SAP art. 261-7-1°b du CGI
  amount_ttc numeric(10,2) not null,
  pdf_storage_path text,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'cesu_processing')),
  issued_at date not null default current_date,
  paid_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- POLITIQUES ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.bookings enable row level security;
alter table public.liaison_logs enable row level security;
alter table public.invoices enable row level security;

-- Règles Profiles : Un utilisateur lit/modifie son propre profil, l'admin a accès à tout
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Règles Beneficiaries : Le client gère ses bénéficiaires, l'admin lit et modifie tout
create policy "Client manages own beneficiaries" on public.beneficiaries for all using (client_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');

-- Règles Bookings : Le client crée et consulte ses réservations, l'admin gère tout
create policy "Client manages own bookings" on public.bookings for select using (client_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Client creates bookings" on public.bookings for insert with check (client_id = auth.uid());
create policy "Admin full access bookings" on public.bookings for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Règles Liaison Logs : Lecture par le client associé et l'admin, écriture par l'admin
create policy "Client reads liaison log" on public.liaison_logs for select using (
  exists (select 1 from public.bookings b where b.id = liaison_logs.booking_id and (b.client_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin'))
);
create policy "Admin creates liaison log" on public.liaison_logs for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Règles Invoices : Lecture par le client concerné, gestion totale par l'admin
create policy "Client reads own invoices" on public.invoices for select using (client_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin');
create policy "Admin manages invoices" on public.invoices for all using ((select role from public.profiles where id = auth.uid()) = 'admin');
