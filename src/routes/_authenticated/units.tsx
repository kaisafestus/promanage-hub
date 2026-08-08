import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/units")({
  head: () => ({
    meta: [
      { title: "Units · PropertyMS" },
      { name: "description", content: "Track every rental unit: bedrooms, size, monthly rent in KES, deposits, occupancy status and vacancy." },
      { property: "og:title", content: "Units · PropertyMS" },
      { property: "og:description", content: "Rent, deposits and occupancy for every unit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UnitsPage,
});

const STATUSES = ["AVAILABLE", "UNDER_APPLICATION", "RESERVED", "OCCUPIED", "NOTICE", "MAINTENANCE"] as const;

const EMPTY = {
  property_id: "", unit_number: "", floor: "", bedrooms: "1", bathrooms: "1",
  size_sq_ft: "", monthly_rent: "", security_deposit: "", vacant: true,
  status: "AVAILABLE" as (typeof STATUSES)[number],
};

function UnitsPage() {
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

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, properties(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        property_id: form.property_id,
        unit_number: form.unit_number.trim(),
        floor: form.floor.trim() || null,
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        size_sq_ft: form.size_sq_ft ? Number(form.size_sq_ft) : null,
        monthly_rent: Number(form.monthly_rent || 0),
        security_deposit: Number(form.security_deposit || 0),
        vacant: form.vacant,
        status: form.status,
      };
      if (editing) {
        const { error } = await supabase.from("units").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found for your account.");
        const { error } = await supabase.from("units").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Unit updated" : "Unit created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Unit deleted");
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () =>
      units.filter((u) =>
        `${u.unit_number} ${(u as { properties?: { name?: string } }).properties?.name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [units, search],
  );

  return (
    <div>
      <PageHeader
        title="Units"
        subtitle="Rent, deposits and occupancy for every unit in your portfolio."
        actions={
          <Button
            onClick={() => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }}
            disabled={properties.length === 0}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add unit
          </Button>
        }
      />

      <div className="card-surface">
        <div className="border-b border-border p-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search units" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Beds</TableHead>
              <TableHead>Baths</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Monthly rent</TableHead>
              <TableHead className="text-right">Deposit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                {properties.length === 0 ? "Add a property first, then create its units." : "No units yet."}
              </TableCell></TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">{u.unit_number}</TableCell>
                  <TableCell>{(u as { properties?: { name?: string } }).properties?.name ?? "—"}</TableCell>
                  <TableCell>{u.bedrooms}</TableCell>
                  <TableCell>{u.bathrooms}</TableCell>
                  <TableCell>{u.size_sq_ft ? `${u.size_sq_ft} sq ft` : "—"}</TableCell>
                  <TableCell className="text-right">{kes(u.monthly_rent)}</TableCell>
                  <TableCell className="text-right">{kes(u.security_deposit)}</TableCell>
                  <TableCell><StatusChip value={u.status} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(u.id);
                            setForm({
                              property_id: u.property_id,
                              unit_number: u.unit_number,
                              floor: u.floor ?? "",
                              bedrooms: String(u.bedrooms),
                              bathrooms: String(u.bathrooms),
                              size_sq_ft: u.size_sq_ft ? String(u.size_sq_ft) : "",
                              monthly_rent: String(u.monthly_rent),
                              security_deposit: String(u.security_deposit),
                              vacant: u.vacant,
                              status: u.status,
                            });
                            setOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(u.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit unit" : "Add unit"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Property</Label>
              <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <NumField label="Unit number" value={form.unit_number} onChange={(v) => setForm({ ...form, unit_number: v })} type="text" />
            <NumField label="Floor" value={form.floor} onChange={(v) => setForm({ ...form, floor: v })} type="text" />
            <NumField label="Bedrooms" value={form.bedrooms} onChange={(v) => setForm({ ...form, bedrooms: v })} />
            <NumField label="Bathrooms" value={form.bathrooms} onChange={(v) => setForm({ ...form, bathrooms: v })} />
            <NumField label="Size (sq ft)" value={form.size_sq_ft} onChange={(v) => setForm({ ...form, size_sq_ft: v })} />
            <NumField label="Monthly rent (KES)" value={form.monthly_rent} onChange={(v) => setForm({ ...form, monthly_rent: v })} />
            <NumField label="Security deposit (KES)" value={form.security_deposit} onChange={(v) => setForm({ ...form, security_deposit: v })} />
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm">
              <Checkbox checked={form.vacant} onCheckedChange={(c) => setForm({ ...form, vacant: Boolean(c) })} />
              Vacant
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.property_id || !form.unit_number || save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Create unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NumField({
  label, value, onChange, type = "number",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}