import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenant } from "@/lib/tenant";
import { kes, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/my-invoices")({
  head: () => ({
    meta: [
      { title: "My Invoices & Payments · PropertyMS" },
      { name: "description", content: "View rent and utility invoices in KES, submit MPESA or bank payments and track your payment history." },
      { property: "og:title", content: "My Invoices & Payments · PropertyMS" },
      { property: "og:description", content: "Pay rent via MPESA and track invoice status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyInvoicesPage,
});

type Invoice = {
  id: string; invoice_number: string; issue_date: string; due_date: string;
  total_amount: number; description: string; status: string;
  property_id: string | null; unit_id: string | null; org_id: string;
};

const METHODS = ["M_PESA", "BANK_TRANSFER", "CASH", "OTHER"] as const;

function MyInvoicesPage() {
  const { data: tenant } = useMyTenant();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("M_PESA");
  const [reference, setReference] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["my-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("due_date", { ascending: false });
      if (error) throw error;
      return data as Invoice[];
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

  const paidByInvoice = payments.reduce<Record<string, number>>((acc, p) => {
    if (!p.invoice_id) return acc;
    if (p.status === "FAILED" || p.status === "REFUNDED") return acc;
    acc[p.invoice_id] = (acc[p.invoice_id] ?? 0) + Number(p.amount);
    return acc;
  }, {});

  const submit = useMutation({
    mutationFn: async () => {
      if (!tenant || !target) throw new Error("No invoice selected.");
      const value = Number(amount);
      if (!value || value <= 0) throw new Error("Enter a valid amount.");
      if (method === "M_PESA" && !reference.trim()) throw new Error("Enter the MPESA transaction code.");
      const { error } = await supabase.from("payments").insert({
        org_id: target.org_id,
        invoice_id: target.id,
        tenant_id: tenant.id,
        property_id: target.property_id,
        unit_id: target.unit_id,
        amount: value,
        method: method as (typeof METHODS)[number],
        reference: reference.trim() || null,
        status: "PENDING",
        paid_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment submitted — awaiting confirmation from your landlord.");
      setTarget(null);
      setAmount(""); setReference(""); setMethod("M_PESA");
      queryClient.invalidateQueries({ queryKey: ["my-payments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const outstanding = invoices.reduce((s, i) => {
    const bal = Number(i.total_amount) - (paidByInvoice[i.id] ?? 0);
    return s + (bal > 0 && i.status !== "CANCELLED" ? bal : 0);
  }, 0);

  return (
    <div>
      <PageHeader
        title="Invoices & payments"
        subtitle={`Total outstanding: ${kes(outstanding)}`}
      />

      <div className="card-surface">
        <div className="border-b border-border p-4 text-sm font-semibold">Invoices</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No invoices yet.</TableCell></TableRow>
            ) : (
              invoices.map((i) => {
                const balance = Number(i.total_amount) - (paidByInvoice[i.id] ?? 0);
                return (
                  <TableRow key={i.id} className="odd:bg-muted/30">
                    <TableCell className="font-medium">{i.invoice_number}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{i.description}</TableCell>
                    <TableCell>{formatDate(i.issue_date)}</TableCell>
                    <TableCell>{formatDate(i.due_date)}</TableCell>
                    <TableCell className="text-right">{kes(i.total_amount)}</TableCell>
                    <TableCell className={`text-right font-medium ${balance > 0 ? "text-destructive" : ""}`}>{kes(balance)}</TableCell>
                    <TableCell><StatusChip value={i.status} /></TableCell>
                    <TableCell>
                      {balance > 0 && i.status !== "CANCELLED" ? (
                        <Button size="sm" onClick={() => { setTarget(i); setAmount(String(balance)); }}>
                          <Smartphone className="mr-1.5 h-3.5 w-3.5" /> Pay
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="card-surface mt-4">
        <div className="border-b border-border p-4 text-sm font-semibold">Payment history</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No payments recorded.</TableCell></TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id} className="odd:bg-muted/30">
                  <TableCell>{formatDate(p.paid_at)}</TableCell>
                  <TableCell>{p.method.replace(/_/g, " ")}</TableCell>
                  <TableCell>{p.reference ?? "—"}</TableCell>
                  <TableCell className="text-right">{kes(p.amount)}</TableCell>
                  <TableCell><StatusChip value={p.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Pay {target?.invoice_number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Send your payment via MPESA, then record the transaction code below. Your landlord confirms it and the
              invoice updates automatically.
            </div>
            <div className="space-y-1.5">
              <Label>Amount (KES)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METHODS.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{method === "M_PESA" ? "MPESA transaction code" : "Reference"}</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. SLK7XQ2P1M" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>Cancel</Button>
            <Button disabled={submit.isPending} onClick={() => submit.mutate()}>Submit payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
