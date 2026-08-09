
-- Helper: tenant record ids linked to the signed-in user
CREATE OR REPLACE FUNCTION public.my_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.tenants WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.my_tenant_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_tenant_ids() TO authenticated;

CREATE OR REPLACE FUNCTION public.my_unit_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unit_id FROM public.tenants WHERE user_id = auth.uid() AND unit_id IS NOT NULL
  UNION
  SELECT unit_id FROM public.leases WHERE tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.my_unit_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_unit_ids() TO authenticated;

CREATE OR REPLACE FUNCTION public.my_property_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT property_id FROM public.tenants WHERE user_id = auth.uid() AND property_id IS NOT NULL
  UNION
  SELECT property_id FROM public.leases WHERE tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.my_property_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_property_ids() TO authenticated;

-- Tenant-scoped SELECT policies
CREATE POLICY "tenants read own tenant record" ON public.tenants
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "tenants read own leases" ON public.leases
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.my_tenant_ids()));

CREATE POLICY "tenants read own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.my_tenant_ids()));

CREATE POLICY "tenants read own payments" ON public.payments
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.my_tenant_ids()));

CREATE POLICY "tenants read own maintenance" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (tenant_id IN (SELECT public.my_tenant_ids()));

CREATE POLICY "tenants read own unit" ON public.units
  FOR SELECT TO authenticated USING (id IN (SELECT public.my_unit_ids()));

CREATE POLICY "tenants read own property" ON public.properties
  FOR SELECT TO authenticated USING (id IN (SELECT public.my_property_ids()));

CREATE POLICY "tenants read own documents" ON public.documents
  FOR SELECT TO authenticated USING (
    (entity_type = 'TENANT' AND entity_id IN (SELECT public.my_tenant_ids()))
    OR (entity_type = 'UNIT' AND entity_id IN (SELECT public.my_unit_ids()))
    OR uploaded_by_id = auth.uid()
  );

-- Tenants can raise their own maintenance requests
CREATE POLICY "tenants create own maintenance" ON public.maintenance_requests
  FOR INSERT TO authenticated WITH CHECK (
    tenant_id IN (SELECT public.my_tenant_ids())
    AND property_id IN (SELECT public.my_property_ids())
    AND status = 'OPEN'
  );

CREATE POLICY "tenants update own open maintenance" ON public.maintenance_requests
  FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT public.my_tenant_ids()) AND status = 'OPEN')
  WITH CHECK (tenant_id IN (SELECT public.my_tenant_ids()) AND status = 'OPEN');

-- Tenants can submit their own payment records (pending confirmation by manager)
CREATE POLICY "tenants create own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (
    tenant_id IN (SELECT public.my_tenant_ids())
    AND status = 'PENDING'
  );
