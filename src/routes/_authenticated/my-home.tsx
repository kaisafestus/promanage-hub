import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenant } from "@/lib/tenant";
import { kes, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/my-home")({
  head: () => ({
    meta: [
      { title: "My Lease & Unit · PropertyMS" },
      { name: "description", content: "View your lease dates, monthly rent in KES, security deposit and the details of the unit you occupy." },
      { property: "og:title", content: "My Lease & Unit · PropertyMS" },
      { property: "og:description", content: "Lease terms, rent and unit details for your tenancy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyHomePage,
});

function MyHomePage() {
  const { data: tenant, isLoading } = useMyTenant();

  const { data: leases = [] } = useQuery({
    queryKey: ["my-leases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("*, units(unit_number), properties(name)")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!tenant) {
    return (
      <div>
        <PageHeader title="My lease & unit" />
        <div className="card-surface p-6 text-sm text-muted-foreground">No tenancy linked to your account yet.</div>
      </div>
    );
  }

  const unit = (tenant as { units?: Record<string, unknown> }).units as
    | { unit_number?: string; floor?: string; bedrooms?: number; bathrooms?: number; size_sq_ft?: number; status?: string }
    | undefined;
  const property = (tenant as { properties?: Record<string, unknown> }).properties as
    | { name?: string; address_line1?: string; city?: string; county?: string; mpesa_paybill?: string; water_rate?: number }
    | undefined;

  return (
    <div>
      <PageHeader title="My lease & unit" subtitle="Everything about your home and tenancy terms." />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">Unit</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Row label="Unit number" value={unit?.unit_number ?? "—"} />
            <Row label="Floor" value={unit?.floor ?? "—"} />
            <Row label="Bedrooms" value={String(unit?.bedrooms ?? "—")} />
            <Row label="Bathrooms" value={String(unit?.bathrooms ?? "—")} />
            <Row label="Size" value={unit?.size_sq_ft ? `${unit.size_sq_ft} sq ft` : "—"} />
            <div className="col-span-1">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Status</dt>
              <dd className="mt-1"><StatusChip value={unit?.status} /></dd>
            </div>
          </dl>
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">Property</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Row label="Name" value={property?.name ?? "—"} />
            <Row label="Address" value={property?.address_line1 ?? "—"} />
            <Row label="City" value={property?.city ?? "—"} />
            <Row label="County" value={property?.county ?? "—"} />
            <Row label="MPESA paybill" value={property?.mpesa_paybill ?? "—"} />
            <Row label="Water rate" value={property?.water_rate ? kes(property.water_rate) : "—"} />
          </dl>
        </div>
      </div>

      <div className="card-surface mt-4 p-5">
        <h2 className="mb-4 text-sm font-semibold">Tenancy terms</h2>
        <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4">
          <Row label="Lease start" value={formatDate(tenant.lease_start_date)} />
          <Row label="Lease end" value={formatDate(tenant.lease_end_date)} />
          <Row label="Monthly rent" value={kes(tenant.monthly_rent)} />
          <Row label="Security deposit" value={kes(tenant.security_deposit)} />
        </dl>
      </div>

      <div className="card-surface mt-4">
        <div className="border-b border-border p-4 text-sm font-semibold">Lease agreements</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-right">Rent</TableHead>
              <TableHead>Rent due day</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No lease documents recorded.</TableCell></TableRow>
            ) : (
              leases.map((l) => (
                <TableRow key={l.id} className="odd:bg-muted/30">
                  <TableCell>{(l as { properties?: { name?: string } }).properties?.name ?? "—"}</TableCell>
                  <TableCell>{(l as { units?: { unit_number?: string } }).units?.unit_number ?? "—"}</TableCell>
                  <TableCell>{formatDate(l.start_date)}</TableCell>
                  <TableCell>{formatDate(l.end_date)}</TableCell>
                  <TableCell className="text-right">{kes(l.monthly_rent)}</TableCell>
                  <TableCell>Day {l.rent_due_day}</TableCell>
                  <TableCell><StatusChip value={l.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}
