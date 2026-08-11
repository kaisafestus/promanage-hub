import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/session";
import { Wrench, Receipt, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { kes, formatDate } from "@/lib/format";
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

export const Route = createFileRoute("/_authenticated/vendor-dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard · PropertyMS" },
      {
        name: "description",
        content:
          "Vendor portal overview: assigned maintenance requests, completed jobs, payments received and upcoming schedules.",
      },
      { property: "og:title", content: "Vendor Dashboard · PropertyMS" },
      { property: "og:description", content: "Your maintenance jobs, payments and schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorDashboard,
});

function VendorDashboard() {
  const { data: session } = useSession();

  const { data: vendor } = useQuery({
    queryKey: ["my-vendor"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["vendor-stats"],
    queryFn: async () => {
      if (!vendor?.id) return { open: 0, inProgress: 0, completed: 0, revenue: 0 };
      const [openResult, inProgressResult, completedResult, paymentsResult] = await Promise.all([
        supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .eq("vendor_id", vendor.id)
          .eq("status", "OPEN"),
        supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .eq("vendor_id", vendor.id)
          .eq("status", "IN_PROGRESS"),
        supabase
          .from("maintenance_requests")
          .select("id", { count: "exact", head: true })
          .eq("vendor_id", vendor.id)
          .eq("status", "COMPLETED"),
        supabase.from("expenses").select("amount").eq("vendor_id", vendor.id),
      ]);
      const revenue = (paymentsResult.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      return {
        open: openResult.count ?? 0,
        inProgress: inProgressResult.count ?? 0,
        completed: completedResult.count ?? 0,
        revenue,
      };
    },
    enabled: !!vendor?.id,
  });

  const { data: assigned = [] } = useQuery({
    queryKey: ["vendor-assigned"],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, properties(name), units(unit_number), tenants(first_name, last_name)")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const { data: recentExpenses = [] } = useQuery({
    queryKey: ["vendor-expenses"],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*, properties(name)")
        .eq("vendor_id", vendor.id)
        .order("date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const s = stats ?? { open: 0, inProgress: 0, completed: 0, revenue: 0 };

  return (
    <div className="space-y-5">
      <section
        className="rounded-xl p-8 text-navy-foreground"
        style={{ background: "var(--gradient-navy)", boxShadow: "var(--shadow-lift)" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-active">
          Vendor portal
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight">Welcome to PropertyMS</h1>
        <p className="mt-2 max-w-xl text-sm text-navy-foreground/70">
          Track your assigned maintenance jobs, expenses and payments.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wrench} label="Open jobs" value={String(s.open)} hint="Awaiting action" />
        <StatCard
          icon={Clock}
          label="In progress"
          value={String(s.inProgress)}
          hint="Currently working"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={String(s.completed)}
          hint="Jobs done"
        />
        <StatCard icon={Receipt} label="Expenses" value={kes(s.revenue)} hint="Total logged" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Assigned maintenance</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/vendor-maintenance">View all</Link>
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
              {assigned.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No assignments yet.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                assigned.map((r: any) => (
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

        <div className="card-surface">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent expenses</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/vendor-expenses">View all</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground text-sm">
                    No expenses logged.
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recentExpenses.map((e: any) => (
                  <TableRow key={e.id} className="odd:bg-muted/30">
                    <TableCell className="font-medium text-sm">{e.description}</TableCell>
                    <TableCell className="text-sm">{e.properties?.name ?? "—"}</TableCell>
                    <TableCell>
                      <StatusChip value={e.category} />
                    </TableCell>
                    <TableCell className="text-right">{kes(e.amount)}</TableCell>
                    <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="card-surface p-6">
        <h2 className="text-base font-semibold">Completion rate</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {s.completed + s.inProgress + s.open > 0
            ? `${((s.completed / (s.completed + s.inProgress + s.open)) * 100).toFixed(1)}% of assigned jobs completed`
            : "No jobs assigned yet"}
        </p>
        <Progress
          value={
            s.completed + s.inProgress + s.open > 0
              ? (s.completed / (s.completed + s.inProgress + s.open)) * 100
              : 0
          }
          className="mt-4"
        />
      </div>
    </div>
  );
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
