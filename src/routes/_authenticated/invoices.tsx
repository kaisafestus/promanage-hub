import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes, formatDate, shortId } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices · PropertyMS" },
      { name: "description", content: "Issue and track rent, water and utility invoices in KES with draft, sent, partial, paid and overdue statuses." },
      { property: "og:title", content: "Invoices · PropertyMS" },
      { property: "og:description", content: "Rent and utility invoicing in KES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvoicesPage,
});

const STATUSES = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELLED", "UNCOLLECTIBLE"] as const;
const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  tenant_id: "", invoice_number: "", issue_date: today(), due_date: today(),
  amount: "", status: "DRAFT" as (typeof STATUSES)[number], description: "Monthly rent",
};

function InvoicesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, first_name, last_name, property_id, unit_id, monthly_rent");
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, tenants(first_name, last_name), properties(name), units(unit_number)")
        .order("issue_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const tenant = tenants.find((t) => t.id === form.tenant_id);
      const amount = Number(form.amount || 0);
      if (amount <= 0) throw new Error("Amount must be greater than zero.");
      const payload = {
        tenant_id: form.tenant_id || null,
        property_id: tenant?.property_id ?? null,
        unit_id: tenant?.unit_id ?? null,
        invoice_number: form.invoice_number.trim(),
        issue_date: form.issue_date,
        due_date: form.due_date,
        amount,
        total_amount: amount,
        status: form.status,
        description: form.description.trim(),
      };
      if (editing) {
        const { error } = await supabase.from("invoices").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found for your account.");
        const { error } = await supabase.from("invoices").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Invoice updated" : "Invoice created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "That invoice number already exists." : e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invoice deleted");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () =>
      invoices.filter((i) => {
        const t = (i as { tenants?: { first_name?: string; last_name?: string } }).tenants;
        const haystack = `${i.invoice_number} ${t?.first_name ?? ""} ${t?.last_name ?? ""} ${i.description}`.toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(i.status);
        return matchesSearch && matchesStatus;
      }),
    [invoices, search, statusFilter],
  );
  const total = filtered.reduce((s, i) => s + Number(i.total_amount), 0);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Rent, water and utility billing in KES."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY, invoice_number: `INV-${Date.now().toString().slice(-6)}` });
              setOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add invoice
          </Button>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="card-surface h-fit w-full shrink-0 p-4 lg:w-60">
          <div className="space-y-1.5">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Invoice or tenant" />
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</div>
            <div className="space-y-2">
              {STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={statusFilter.includes(s)}
                    onCheckedChange={(c) =>
                      setStatusFilter((f) => (c ? [...f, s] : f.filter((x) => x !== s)))
                    }
                  />
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="card-surface mb-4 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total invoiced</div>
            <div className="mt-1 text-2xl font-bold">{kes(total)}</div>
          </div>

          <div className="card-surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property (unit)</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No invoices yet.</TableCell></TableRow>
                ) : (
                  filtered.map((i) => {
                    const t = (i as { tenants?: { first_name?: string; last_name?: string } }).tenants;
                    const p = (i as { properties?: { name?: string } }).properties;
                    const u = (i as { units?: { unit_number?: string } }).units;
                    return (
                      <TableRow key={i.id} className="odd:bg-muted/30">
                        <TableCell>{formatDate(i.issue_date)}</TableCell>
                        <TableCell className="font-medium">{i.invoice_number || shortId(i.id)}</TableCell>
                        <TableCell>{t ? `${t.first_name} ${t.last_name}` : "—"}</TableCell>
                        <TableCell>{p?.name ?? "—"}{u?.unit_number ? ` (${u.unit_number})` : ""}</TableCell>
                        <TableCell>{formatDate(i.due_date)}</TableCell>
                        <TableCell><StatusChip value={i.status} /></TableCell>
                        <TableCell className="text-right font-medium">{kes(i.total_amount)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(i.id);
                                  setForm({
                                    tenant_id: i.tenant_id ?? "",
                                    invoice_number: i.invoice_number,
                                    issue_date: i.issue_date,
                                    due_date: i.due_date,
                                    amount: String(i.amount),
                                    status: i.status,
                                    description: i.description,
                                  });
                                  setOpen(true);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(i.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit invoice" : "Add invoice"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Tenant</Label>
              <Select
                value={form.tenant_id}
                onValueChange={(v) => {
                  const t = tenants.find((x) => x.id === v);
                  setForm({ ...form, tenant_id: v, amount: t ? String(t.monthly_rent) : form.amount });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice number</Label>
              <Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (KES)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Issue date</Label>
              <Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.invoice_number || !form.amount || save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Create invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}