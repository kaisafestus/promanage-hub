
CREATE TYPE public.app_role AS ENUM ('ADMIN','LANDLORD','TENANT','VENDOR','APPLICANT');
CREATE TYPE public.user_status AS ENUM ('PENDING','ACTIVE','SUSPENDED','ARCHIVED');
CREATE TYPE public.org_status AS ENUM ('ACTIVE','SUSPENDED');
CREATE TYPE public.invoice_status AS ENUM ('DRAFT','SENT','PAID','PARTIAL','OVERDUE','CANCELLED','UNCOLLECTIBLE');
CREATE TYPE public.payment_status AS ENUM ('PENDING','CONFIRMED','PAID','PARTIAL','FAILED','REFUNDED','OVERDUE');
CREATE TYPE public.payment_method AS ENUM ('BANK_TRANSFER','CREDIT_CARD','DEBIT_CARD','M_PESA','ACH','CASH','OTHER');
CREATE TYPE public.maintenance_priority AS ENUM ('LOW','MEDIUM','HIGH','EMERGENCY');
CREATE TYPE public.maintenance_status AS ENUM ('OPEN','ASSIGNED','IN_PROGRESS','WAITING_PARTS','COMPLETED','CANCELLED');
CREATE TYPE public.document_category AS ENUM ('LEASE_AGREEMENT','RECEIPT','INVOICE','CONTRACT','MAINTENANCE_RECORD','PHOTO','OTHER');
CREATE TYPE public.invitation_status AS ENUM ('PENDING','ACCEPTED','EXPIRED','REVOKED');
CREATE TYPE public.notification_type AS ENUM ('SYSTEM','MESSAGE','PAYMENT','MAINTENANCE','REMINDER');
CREATE TYPE public.unit_status AS ENUM ('AVAILABLE','UNDER_APPLICATION','RESERVED','OCCUPIED','NOTICE','MAINTENANCE');
CREATE TYPE public.lease_status AS ENUM ('DRAFT','ACTIVE','EXPIRED','TERMINATED');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text, phone text, website text, logo text,
  status public.org_status NOT NULL DEFAULT 'ACTIVE',
  automatic_publishing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text,
  status public.user_status NOT NULL DEFAULT 'ACTIVE',
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(),'LANDLORD') OR public.has_role(auth.uid(),'ADMIN');
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_org uuid; r public.app_role;
BEGIN
  r := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'LANDLORD');
  IF r = 'LANDLORD' THEN
    INSERT INTO public.organizations (name, email)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'org_name','My Organization'), NEW.email)
    RETURNING id INTO new_org;
  END IF;
  INSERT INTO public.profiles (id, org_id, email, first_name, last_name, phone)
  VALUES (NEW.id, new_org, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name',''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',''),
    NEW.raw_user_meta_data->>'phone');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL, code text NOT NULL, description text,
  address_line1 text NOT NULL DEFAULT '', address_line2 text,
  city text NOT NULL DEFAULT '', county text NOT NULL DEFAULT '', postal_code text,
  property_type text, mpesa_paybill text, water_rate numeric(12,2),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number text NOT NULL, floor text,
  bedrooms int NOT NULL DEFAULT 1, bathrooms int NOT NULL DEFAULT 1,
  size_sq_ft numeric(10,2),
  monthly_rent numeric(12,2) NOT NULL DEFAULT 0,
  security_deposit numeric(12,2) NOT NULL DEFAULT 0,
  vacant boolean NOT NULL DEFAULT true,
  status public.unit_status NOT NULL DEFAULT 'AVAILABLE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name text NOT NULL DEFAULT '', last_name text NOT NULL DEFAULT '',
  email text, phone text,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  lease_start_date date, lease_end_date date,
  monthly_rent numeric(12,2) NOT NULL DEFAULT 0,
  security_deposit numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name text NOT NULL, phone text, email text, specialization text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL, role public.app_role NOT NULL,
  first_name text, last_name text, phone text,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  status public.invitation_status NOT NULL DEFAULT 'PENDING',
  invited_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  start_date date NOT NULL, end_date date NOT NULL,
  monthly_rent numeric(12,2) NOT NULL DEFAULT 0,
  security_deposit numeric(12,2) NOT NULL DEFAULT 0,
  rent_due_day int NOT NULL DEFAULT 1,
  status public.lease_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  issue_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL DEFAULT current_date,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  status public.invoice_status NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, invoice_number)
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  method public.payment_method NOT NULL DEFAULT 'M_PESA',
  reference text,
  status public.payment_status NOT NULL DEFAULT 'CONFIRMED',
  notes text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  title text NOT NULL, description text NOT NULL DEFAULT '',
  category text,
  priority public.maintenance_priority NOT NULL DEFAULT 'MEDIUM',
  status public.maintenance_status NOT NULL DEFAULT 'OPEN',
  scheduled_date date, completed_date date,
  cost numeric(12,2), notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'OTHER',
  description text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT current_date,
  receipt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL, url text NOT NULL,
  category public.document_category NOT NULL DEFAULT 'OTHER',
  file_type text NOT NULL DEFAULT '', size bigint NOT NULL DEFAULT 0,
  description text, entity_id uuid, entity_type text,
  uploaded_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'SYSTEM',
  title text NOT NULL, message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers
DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['organizations','profiles','properties','units','tenants','vendors','invitations','leases','invoices','payments','maintenance_requests','expenses','documents','notifications']
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

-- grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.profiles, public.user_roles, public.properties, public.units, public.tenants, public.vendors, public.invitations, public.leases, public.invoices, public.payments, public.maintenance_requests, public.expenses, public.documents, public.notifications TO authenticated;
GRANT ALL ON public.organizations, public.profiles, public.user_roles, public.properties, public.units, public.tenants, public.vendors, public.invitations, public.leases, public.invoices, public.payments, public.maintenance_requests, public.expenses, public.documents, public.notifications TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR org_id = public.current_org_id());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "roles read own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "org read" ON public.organizations FOR SELECT TO authenticated USING (id = public.current_org_id());
CREATE POLICY "org update" ON public.organizations FOR UPDATE TO authenticated USING (id = public.current_org_id() AND public.is_manager()) WITH CHECK (id = public.current_org_id());

DO $$ DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['properties','units','tenants','vendors','invitations','leases','invoices','payments','maintenance_requests','expenses','documents']
  LOOP
    EXECUTE format('CREATE POLICY "org members read" ON public.%I FOR SELECT TO authenticated USING (org_id = public.current_org_id())', t);
    EXECUTE format('CREATE POLICY "managers insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (org_id = public.current_org_id() AND public.is_manager())', t);
    EXECUTE format('CREATE POLICY "managers update" ON public.%I FOR UPDATE TO authenticated USING (org_id = public.current_org_id() AND public.is_manager()) WITH CHECK (org_id = public.current_org_id())', t);
    EXECUTE format('CREATE POLICY "managers delete" ON public.%I FOR DELETE TO authenticated USING (org_id = public.current_org_id() AND public.is_manager())', t);
  END LOOP;
END $$;

CREATE POLICY "notifications read own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR (org_id = public.current_org_id() AND public.is_manager()));
CREATE POLICY "notifications insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (org_id = public.current_org_id());
CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid() OR (org_id = public.current_org_id() AND public.is_manager()));
