-- 1. Table des paramètres légaux du prestataire (Inspire Répit)
CREATE TABLE IF NOT EXISTS public.provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  organization_name TEXT,
  legal_status TEXT NOT NULL DEFAULT 'Entrepreneur Individuel',
  siret TEXT NOT NULL,
  sap_number TEXT NOT NULL, -- Numéro de déclaration Nova / SAP
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  iban TEXT NOT NULL,
  bic TEXT NOT NULL,
  nan_number TEXT, -- Numéro d'affilié National d'Encaissement (CESU préfinancé)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertion de la ligne par défaut si vide
INSERT INTO public.provider_settings (
  provider_name, organization_name, legal_status, siret, sap_number,
  address, postal_code, city, phone, email, iban, bic
)
SELECT
  'Prestataire Inspire Répit', 'Inspire Répit Services', 'Entrepreneur Individuel',
  '00000000000000', 'SAP/000000000', 'Adresse Prestataire', '38000', 'Grenoble',
  '0600000000', 'contact@inspirerepit.fr', 'FR7600000000000000000000000', 'XXXXXXXXXXX'
WHERE NOT EXISTS (SELECT 1 FROM public.provider_settings);

-- 2. Mise à niveau de la table invoices
-- Drop existing invoices table completely so we can recreate it matching the requirements.
DROP TABLE IF EXISTS public.invoices CASCADE;

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE, -- Attribué STRICTEMENT lors du passage en statut 'issued'
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')) DEFAULT 'draft',
  issue_date DATE,
  due_date TEXT NOT NULL DEFAULT 'Paiement à réception',
  payment_method TEXT CHECK (payment_method IN ('virement', 'cesu', 'cheque', 'especes')),
  payment_date DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de { description, quantity, unit_price, total }
  total_ht NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  vat_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
  total_ttc NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  provider_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access provider_settings" ON public.provider_settings
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admin full access invoices" ON public.invoices
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Client view own issued invoices" ON public.invoices
  FOR SELECT USING (
    client_id = auth.uid() AND status IN ('issued', 'paid')
  );
