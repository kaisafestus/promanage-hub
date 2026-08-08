import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Banknote, Wrench, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { kes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Landlord Dashboard · PropertyMS" },
      { name: "description", content: "Portfolio overview: occupancy, rent collection in KES, outstanding balances and open maintenance requests." },
      { property: "og:title", content: "Landlord Dashboard · PropertyMS" },
      { property: "og:description", content: "Occupancy, KES rent collection and maintenance at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [properties, units, tenants, maintenance, invoices, payments] = await Promise.all([
        supabase.from("properties").select("id"),
        supabase.from("units").select("id, vacant"),
        supabase.from("tenants").select("id"),
        supabase.from("maintenance_requests").select("id, status"),
        supabase.from("invoices").select("id, total_amount, status"),
        supabase.from("payments").select("amount, status"),
      ]);
      const unitRows = units.data ?? [];
      const occupied = unitRows.filter((u) => !u.vacant).length;
      const invoiced = (invoices.data ?? []).reduce((s, i) => s + Number(i.total_amount), 0);
      const collected = (payments.data ?? [])
        .filter((p) => p.status === "PAID" || p.status === "CONFIRMED")
        .reduce((s, p) => s + Number(p.amount), 0);
      return {
        properties: properties.data?.length ?? 0,
        units: unitRows.length,
        occupied,
        vacant: unitRows.length - occupied,
        occupancyRate: unitRows.length ? (occupied / unitRows.length) * 100 : 0,
        tenants: tenants.data?.length ?? 0,
        openMaintenance: (maintenance.data ?? []).filter((m) => m.status === "OPEN" || m.status === "ASSIGNED").length,
        revenue: collected,
        outstanding: Math.max(invoiced - collected, 0),
        collectionRate: invoiced ? (collected / invoiced) * 100 : 0,
      };
    },
  });
}

function StatCard({
  icon: Icon, label, value, hint,
}: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function DashboardPage() {
  const { data: d } = useDashboard();
  const s = d ?? {
    properties: 0, units: 0, occupied: 0, vacant: 0, occupancyRate: 0, tenants: 0,
    openMaintenance: 0, revenue: 0, outstanding: 0, collectionRate: 0,
  };

  return (
    <div className="space-y-5">
      <section
        className="rounded-xl p-8 text-navy-foreground"
        style={{ background: "var(--gradient-navy)", boxShadow: "var(--shadow-lift)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-active">Landlord dashboard</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight">Stay on top of your portfolio</h1>
        <p className="mt-2 max-w-xl text-sm text-navy-foreground/70">
          Occupancy, rent collection and maintenance across every property you manage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild><Link to="/properties">New property</Link></Button>
          <Button asChild variant="secondary"><Link to="/maintenance">Review maintenance</Link></Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Properties" value={String(s.properties)} hint={`${s.units} units total`} />
        <StatCard icon={Users} label="Tenants" value={String(s.tenants)} hint={`${(100 - s.occupancyRate).toFixed(1)}% vacancy rate`} />
        <StatCard icon={Banknote} label="Revenue" value={kes(s.revenue)} hint={`${s.collectionRate.toFixed(1)}% collection rate`} />
        <StatCard icon={Wrench} label="Open maintenance" value={String(s.openMaintenance)} hint={`${kes(s.outstanding)} outstanding`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Occupancy overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">{s.occupied} occupied · {s.vacant} vacant</p>
          <Progress value={s.occupancyRate} className="mt-4" />
          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-xs text-muted-foreground">Occupied</div><div className="font-semibold">{s.occupied}</div></div>
            <div><div className="text-xs text-muted-foreground">Vacant</div><div className="font-semibold">{s.vacant}</div></div>
            <div><div className="text-xs text-muted-foreground">Collection rate</div><div className="font-semibold">{s.collectionRate.toFixed(1)}%</div></div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="text-base font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: "View properties", to: "/properties" as const },
              { label: "Manage tenants", to: "/tenants" as const },
              { label: "Open invoices", to: "/invoices" as const },
              { label: "Handle maintenance", to: "/maintenance" as const },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {a.label}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-base font-semibold">Landlord priorities</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Occupancy rate", value: `${s.occupancyRate.toFixed(1)}%`, tone: "bg-success/10 text-success" },
            { label: "Rent collected", value: kes(s.revenue), tone: "bg-primary/10 text-primary" },
            { label: "Outstanding balance", value: kes(s.outstanding), tone: "bg-warning/15 text-warning" },
            { label: "Open maintenance", value: String(s.openMaintenance), tone: "bg-destructive/10 text-destructive" },
          ].map((m) => (
            <div key={m.label} className={`rounded-lg p-4 ${m.tone}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{m.label}</div>
              <div className="mt-2 text-lg font-bold">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}