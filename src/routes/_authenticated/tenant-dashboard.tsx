import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, Receipt, Home, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenant } from "@/lib/tenant";
import { kes, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/tenant-dashboard")({
  head: () => ({
    meta: [
      { title: "My Home · PropertyMS Tenant Portal" },
      { name: "description", content: "Tenant portal overview: your unit, rent balance in KES, upcoming due dates and open maintenance requests." },
      { property: "og:title", content: "Tenant Portal · PropertyMS" },
      { property: "og:description", content: "Your unit, rent balance and maintenance requests in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TenantDashboard,
});

function TenantDashboard() {
  const { data: tenant, isLoading } = useMyTenant();

  const { data: invoices = [] } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("due_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*").order("paid_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["my-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invoiced = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const paid = payments
    .filter((p) => p.status === "PAID" || p.status === "CONFIRMED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const balance = invoiced - paid;
  const nextDue = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const openRequests = requests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading your home…</p>;
  }

  if (!tenant) {
    return (
      <div>
        <PageHeader title="Welcome" subtitle="Your tenant profile is not linked yet." />
        <div className="card-surface p-6 text-sm text-muted-foreground">
          Your landlord has not linked your account to a tenancy yet. Once they do, your unit, invoices and
          maintenance requests will appear here.
        </div>
      </div>
    );
  }

  const unit = (tenant as { units?: { unit_number?: string } }).units;
  const property = (tenant as { properties?: { name?: string; city?: string } }).properties;

  return (
    <div>
      <PageHeader
        title={`Karibu, ${tenant.first_name}`}
        subtitle="Your tenancy at a glance."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/my-maintenance">Request repair</Link></Button>
            <Button asChild><Link to="/my-invoices">Pay rent</Link></Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Home} label="Your unit" value={unit?.unit_number ?? "—"} hint={property?.name ?? ""} />
        <Stat icon={Receipt} label="Outstanding balance" value={kes(balance)} hint={balance > 0 ? "Payment due" : "All settled"} tone={balance > 0 ? "bad" : "good"} />
        <Stat icon={CalendarClock} label="Next due date" value={nextDue ? formatDate(nextDue.due_date) : "—"} hint={nextDue ? kes(nextDue.total_amount) : "No open invoices"} />
        <Stat icon={Wrench} label="Open requests" value={String(openRequests.length)} hint="Maintenance" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-3 text-sm font-semibold">Recent invoices</h2>
          {invoices.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {invoices.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{i.invoice_number}</div>
                    <div className="text-xs text-muted-foreground">Due {formatDate(i.due_date)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{kes(i.total_amount)}</span>
                    <StatusChip value={i.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-3 text-sm font-semibold">Maintenance activity</h2>
          {requests.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests raised.</p>
          ) : (
            <ul className="divide-y divide-border">
              {requests.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(r.created_at)}</div>
                  </div>
                  <StatusChip value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, hint, tone,
}: { icon: React.ElementType; label: string; value: string; hint?: string; tone?: "good" | "bad" }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className={`mt-2 text-2xl font-bold ${tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : "text-foreground"}`}>
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
