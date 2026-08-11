import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Users,
  Banknote,
  Wrench,
  ArrowRight,
  FileText,
  CalendarClock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes, formatDate, shortId } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Landlord Dashboard · PropertyMS" },
      {
        name: "description",
        content:
          "Portfolio overview: occupancy, rent collection in KES, outstanding balances and open maintenance requests.",
      },
      { property: "og:title", content: "Landlord Dashboard · PropertyMS" },
      {
        property: "og:description",
        content: "Occupancy, KES rent collection and maintenance at a glance.",
      },
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
        openMaintenance: (maintenance.data ?? []).filter(
          (m) => m.status === "OPEN" || m.status === "ASSIGNED",
        ).length,
        revenue: collected,
        outstanding: Math.max(invoiced - collected, 0),
        collectionRate: invoiced ? (collected / invoiced) * 100 : 0,
      };
    },
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function DashboardPage() {
  const { data: session } = useSession();
  const { data: d } = useDashboard();
  const s = d ?? {
    properties: 0,
    units: 0,
    occupied: 0,
    vacant: 0,
    occupancyRate: 0,
    tenants: 0,
    openMaintenance: 0,
    revenue: 0,
    outstanding: 0,
    collectionRate: 0,
  };

  const { data: recentInvoices = [] } = useQuery({
    queryKey: ["dashboard-recent-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "id, invoice_number, total_amount, status, due_date, tenants(first_name, last_name)",
        )
        .order("issue_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentMaintenance = [] } = useQuery({
    queryKey: ["dashboard-recent-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("id, title, status, priority, created_at, properties(name), units(unit_number)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: expiringLeases = [] } = useQuery({
    queryKey: ["dashboard-expiring-leases"],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const { data, error } = await supabase
        .from("leases")
        .select(
          "id, end_date, status, tenants(first_name, last_name), properties(name), units(unit_number)",
        )
        .lte("end_date", thirtyDaysFromNow.toISOString().slice(0, 10))
        .neq("status", "TERMINATED")
        .order("end_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <section
        className="rounded-xl p-8 text-navy-foreground"
        style={{ background: "var(--gradient-navy)", boxShadow: "var(--shadow-lift)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-active">
          Landlord dashboard
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight">
          Stay on top of your portfolio
        </h1>
        <p className="mt-2 max-w-xl text-sm text-navy-foreground/70">
          Occupancy, rent collection and maintenance across every property you manage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/properties">New property</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/maintenance">Review maintenance</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/invitations">Invite tenant</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Properties"
          value={String(s.properties)}
          hint={`${s.units} units total`}
        />
        <StatCard
          icon={Users}
          label="Tenants"
          value={String(s.tenants)}
          hint={`${(100 - s.occupancyRate).toFixed(1)}% vacancy rate`}
        />
        <StatCard
          icon={Banknote}
          label="Revenue"
          value={kes(s.revenue)}
          hint={`${s.collectionRate.toFixed(1)}% collection rate`}
        />
        <StatCard
          icon={Wrench}
          label="Open maintenance"
          value={String(s.openMaintenance)}
          hint={`${kes(s.outstanding)} outstanding`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Occupancy overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.occupied} occupied · {s.vacant} vacant
          </p>
          <Progress value={s.occupancyRate} className="mt-4" />
          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Occupied</div>
              <div className="font-semibold">{s.occupied}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Vacant</div>
              <div className="font-semibold">{s.vacant}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Collection rate</div>
              <div className="font-semibold">{s.collectionRate.toFixed(1)}%</div>
            </div>
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
              { label: "Send invitations", to: "/invitations" as const },
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
        <h2 className="text-base font-semibold">Financial snapshot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-success/10 p-4 text-success">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Rent collected
            </div>
            <div className="mt-2 text-lg font-bold">{kes(s.revenue)}</div>
          </div>
          <div className="rounded-lg bg-warning/15 p-4 text-warning">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Outstanding
            </div>
            <div className="mt-2 text-lg font-bold">{kes(s.outstanding)}</div>
          </div>
          <div className="rounded-lg bg-primary/10 p-4 text-primary">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Collection rate
            </div>
            <div className="mt-2 text-lg font-bold">{s.collectionRate.toFixed(1)}%</div>
          </div>
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Open maintenance
            </div>
            <div className="mt-2 text-lg font-bold">{String(s.openMaintenance)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent invoices</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/invoices">View all</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentInvoices.map((i: any) => (
                  <TableRow key={i.id} className="odd:bg-muted/30">
                    <TableCell className="font-medium">{shortId(i.id)}</TableCell>
                    <TableCell>
                      {[i.tenants?.first_name, i.tenants?.last_name].filter(Boolean).join(" ") ||
                        "—"}
                    </TableCell>
                    <TableCell className="text-right">{kes(i.total_amount)}</TableCell>
                    <TableCell>
                      <StatusChip value={i.status} />
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(i.due_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="card-surface">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent maintenance</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/maintenance">View all</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Summary</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Raised</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMaintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No maintenance requests.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentMaintenance.map((r: any) => (
                  <TableRow key={r.id} className="odd:bg-muted/30">
                    <TableCell>
                      <div className="font-medium text-sm">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.units?.unit_number ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{r.properties?.name ?? "—"}</TableCell>
                    <TableCell>
                      <StatusChip value={r.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusChip value={r.status} />
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(r.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="card-surface">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Upcoming lease expirations</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/tenants">View tenants</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lease end</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Monthly rent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiringLeases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                  No leases expiring in the next 30 days.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              expiringLeases.map((l: any) => (
                <TableRow key={l.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">
                    {[l.tenants?.first_name, l.tenants?.last_name].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm">{l.properties?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{l.units?.unit_number ?? "—"}</TableCell>
                  <TableCell className="text-sm">{formatDate(l.end_date)}</TableCell>
                  <TableCell>
                    <StatusChip value={l.status} />
                  </TableCell>
                  <TableCell className="text-right">{kes(l.monthly_rent)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-base font-semibold">Landlord priorities</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Occupancy rate",
              value: `${s.occupancyRate.toFixed(1)}%`,
              tone: "bg-success/10 text-success",
            },
            { label: "Rent collected", value: kes(s.revenue), tone: "bg-primary/10 text-primary" },
            {
              label: "Outstanding balance",
              value: kes(s.outstanding),
              tone: "bg-warning/15 text-warning",
            },
            {
              label: "Open maintenance",
              value: String(s.openMaintenance),
              tone: "bg-destructive/10 text-destructive",
            },
          ].map((m) => (
            <div key={m.label} className={`rounded-lg p-4 ${m.tone}`}>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {m.label}
              </div>
              <div className="mt-2 text-lg font-bold">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
