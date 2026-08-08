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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments · PropertyMS" },
      { name: "description", content: "Record and reconcile rent payments in KES via MPESA, bank transfer or cash, with automatic invoice status updates." },
      { property: "og:title", content: "Payments · PropertyMS" },
      { property: "og:description", content: "MPESA and bank rent payment tracking in KES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentsPage,
});

const METHODS = ["M_PESA", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD", "ACH", "CASH", "OTHER"] as const;
const PSTATUS = ["CONFIRMED", "PAID", "PENDING", "PARTIAL", "FAILED", "REFUNDED"] as const;

const EMPTY = {
  invoice_id: "", amount: "", method: "M_PESA" as (typeof METHODS)[number],
  reference: "", status: "CONFIRMED" as (typeof PSTATUS)[number], notes: "",
};

function PaymentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState("");

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices-open"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, tenant_id, property_id, unit_id, status")
        .neq("status", "PAID")
        .order("due_date");
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, tenants(first_name, last_name), properties(name), units(unit_number), invoices(invoice_number, total_amount)")
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function syncInvoiceStatus(invoiceId: string) {
    const { data: invoice } = await supabase
      .from("invoices").select("total_amount, due_date, status").eq("id", invoiceId).maybeSingle();
    if (!invoice) return;
    const { data: rows } = await supabase
      .from("payments").select("amount, status").eq("invoice_id", invoiceId);
    const paid = (rows ?? [])
      .filter((p) => p.status === "PAID" || p.status === "CONFIRMED")
      .reduce((s, p) => s + Number(p.amount), 0);
    const total = Number(invoice.total_amount);
    let status: "PAID" | "PARTIAL" | "OVERDUE" | "SENT" = "SENT";
    if (paid >= total && total > 0) status = "PAID";
    else if (paid > 0) status = "PARTIAL";
    else if (new Date(invoice.due_date) < new Date()) status = "OVERDUE";
    await supabase.from("invoices").update({ status }).eq("id", invoiceId);
  }

  const save = useMutation({
    mutationFn: async () => {
      const invoice = invoices.find((i) => i.id === form.invoice_id);
      if (!invoice) throw new Error("Select an invoice.");
      const amount = Number(form.amount || 0);
      if (amount <= 0) throw new Error("Amount must be greater than zero.");
      const orgId = session?.profile?.org_id;
      if (!orgId) throw new Error("No organization found for your account.");
      const { error } = await supabase.from("payments").insert({
        org_id: orgId,
        invoice_id: invoice.id,
        tenant_id: invoice.tenant_id,
        property_id: invoice.property_id,
        unit_id: invoice.unit_id,
        amount,
        method: form.method,
        reference: form.reference.trim() || null,
        status: form.status,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      await syncInvoiceStatus(invoice.id);
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setOpen(false);
      setForm({ ...EMPTY });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices-open"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (payment: { id: string; invoice_id: string | null }) => {
      const { error } = await supabase.from("payments").delete().eq("id", payment.id);
      if (error) throw error;
      if (payment.invoice_id) await syncInvoiceStatus(payment.invoice_id);
    },
    onSuccess: () => {
      toast.success("Payment deleted");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () =>
      payments.filter((p) => {
        const t = (p as { tenants?: { first_name?: string; last_name?: string } }).tenants;
        return `${t?.first_name ?? ""} ${t?.last_name ?? ""} ${p.reference ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [payments, search],
  );
  const total = filtered.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="MPESA, bank and cash rent collections, reconciled against invoices."
        actions={
          <Button onClick={() => { setForm({ ...EMPTY }); setOpen(true); }} disabled={invoices.length === 0}>
            <Plus className="mr-1.5 h-4 w-4" /> Record payment
          </Button>
        }
      />

      <div className="card-surface mb-4 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total received</div>
          <div className="mt-1 text-2xl font-bold">{kes(total)}</div>
        </div>
        <div className="relative w-60">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search tenant or reference" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property (unit)</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">No payments recorded yet.</TableCell></TableRow>
            ) : (
              filtered.map((p) => {
                const t = (p as { tenants?: { first_name?: string; last_name?: string } }).tenants;
                const prop = (p as { properties?: { name?: string } }).properties;
                const unit = (p as { units?: { unit_number?: string } }).units;
                return (
                  <TableRow key={p.id} className="odd:bg-muted/30">
                    <TableCell>{formatDate(p.paid_at)}</TableCell>
                    <TableCell className="font-medium">{shortId(p.id)}</TableCell>
                    <TableCell>{t ? `${t.first_name} ${t.last_name}` : "—"}</TableCell>
                    <TableCell>{prop?.name ?? "—"}{unit?.unit_number ? ` (${unit.unit_number})` : ""}</TableCell>
                    <TableCell>{p.method.replace(/_/g, " ")}</TableCell>
                    <TableCell>{p.reference ?? "—"}</TableCell>
                    <TableCell><StatusChip value={p.status} /></TableCell>
                    <TableCell className="text-right font-medium">{kes(p.amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => remove.mutate({ id: p.id, invoice_id: p.invoice_id })}
                          >
                            Delete
                          </DropdownMenuItem>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Invoice</Label>
              <Select
                value={form.invoice_id}
                onValueChange={(v) => {
                  const inv = invoices.find((i) => i.id === v);
                  setForm({ ...form, invoice_id: v, amount: inv ? String(inv.total_amount) : form.amount });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select unpaid invoice" /></SelectTrigger>
                <SelectContent>
                  {invoices.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.invoice_number} — {kes(i.total_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (KES)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v as typeof form.method })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="MPESA code" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PSTATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.invoice_id || !form.amount || save.isPending} onClick={() => save.mutate()}>
              Record payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}