import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes, formatDate, normalizeKenyanPhone, KE_PHONE_REGEX } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/tenants")({
  head: () => ({
    meta: [
      { title: "Tenants · PropertyMS" },
      { name: "description", content: "Manage tenants, their units, lease dates, monthly rent in KES and outstanding balances." },
      { property: "og:title", content: "Tenants · PropertyMS" },
      { property: "og:description", content: "Tenant records, leases and balances." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TenantsPage,
});

const EMPTY = {
  first_name: "", last_name: "", email: "", phone: "",
  property_id: "", unit_id: "", lease_start_date: "", lease_end_date: "",
  monthly_rent: "", security_deposit: "",
};

function TenantsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [search, setSearch] = useState("");

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("id, unit_number, property_id, monthly_rent");
      if (error) throw error;
      return data;
    },
  });

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*, properties(name), units(unit_number), invoices(total_amount), payments(amount, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const phone = form.phone ? normalizeKenyanPhone(form.phone) : null;
      if (phone && !KE_PHONE_REGEX.test(phone)) throw new Error("Phone must be a Kenyan number, e.g. +254712345678");
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone,
        property_id: form.property_id || null,
        unit_id: form.unit_id || null,
        lease_start_date: form.lease_start_date || null,
        lease_end_date: form.lease_end_date || null,
        monthly_rent: Number(form.monthly_rent || 0),
        security_deposit: Number(form.security_deposit || 0),
      };
      if (editing) {
        const { error } = await supabase.from("tenants").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found for your account.");
        const { error } = await supabase.from("tenants").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Tenant updated" : "Tenant added");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tenants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tenant removed");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unitOptions = units.filter((u) => !form.property_id || u.property_id === form.property_id);
  const filtered = useMemo(
    () =>
      tenants.filter((t) =>
        `${t.first_name} ${t.last_name} ${t.email ?? ""}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [tenants, search],
  );

  function balanceOf(t: (typeof tenants)[number]) {
    const invoiced = ((t as { invoices?: { total_amount: number }[] }).invoices ?? [])
      .reduce((s, i) => s + Number(i.total_amount), 0);
    const paid = ((t as { payments?: { amount: number; status: string }[] }).payments ?? [])
      .filter((p) => p.status === "PAID" || p.status === "CONFIRMED")
      .reduce((s, p) => s + Number(p.amount), 0);
    return invoiced - paid;
  }

  return (
    <div>
      <PageHeader
        title="Tenants"
        subtitle="Lease terms, contact details and outstanding balances."
        actions={
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> Add tenant
          </Button>
        }
      />

      <div className="card-surface">
        <div className="border-b border-border p-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search tenants" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Lease expiry</TableHead>
              <TableHead className="text-right">Monthly rent</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No tenants yet.</TableCell></TableRow>
            ) : (
              filtered.map((t) => {
                const balance = balanceOf(t);
                return (
                  <TableRow key={t.id} className="odd:bg-muted/30">
                    <TableCell className="font-medium">{t.first_name} {t.last_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{t.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{t.phone ?? "—"}</div>
                    </TableCell>
                    <TableCell>{(t as { properties?: { name?: string } }).properties?.name ?? "—"}</TableCell>
                    <TableCell>{(t as { units?: { unit_number?: string } }).units?.unit_number ?? "—"}</TableCell>
                    <TableCell>{formatDate(t.lease_end_date)}</TableCell>
                    <TableCell className="text-right">{kes(t.monthly_rent)}</TableCell>
                    <TableCell className={`text-right font-medium ${balance > 0 ? "text-destructive" : ""}`}>{kes(balance)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(t.id);
                              setForm({
                                first_name: t.first_name, last_name: t.last_name,
                                email: t.email ?? "", phone: t.phone ?? "",
                                property_id: t.property_id ?? "", unit_id: t.unit_id ?? "",
                                lease_start_date: t.lease_start_date ?? "",
                                lease_end_date: t.lease_end_date ?? "",
                                monthly_rent: String(t.monthly_rent),
                                security_deposit: String(t.security_deposit),
                              });
                              setOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(t.id)}>Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editing ? "Edit tenant" : "Add tenant"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <TField label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <TField label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
            <TField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
            <TField label="Phone (+254…)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <div className="space-y-1.5">
              <Label>Property</Label>
              <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v, unit_id: "" })}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit_id}
                onValueChange={(v) => {
                  const unit = units.find((u) => u.id === v);
                  setForm({ ...form, unit_id: v, monthly_rent: unit ? String(unit.monthly_rent) : form.monthly_rent });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>{unitOptions.map((u) => <SelectItem key={u.id} value={u.id}>{u.unit_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <TField label="Lease start" value={form.lease_start_date} onChange={(v) => setForm({ ...form, lease_start_date: v })} type="date" />
            <TField label="Lease end" value={form.lease_end_date} onChange={(v) => setForm({ ...form, lease_end_date: v })} type="date" />
            <TField label="Monthly rent (KES)" value={form.monthly_rent} onChange={(v) => setForm({ ...form, monthly_rent: v })} type="number" />
            <TField label="Security deposit (KES)" value={form.security_deposit} onChange={(v) => setForm({ ...form, security_deposit: v })} type="number" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.first_name || !form.last_name || save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Add tenant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TField({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}