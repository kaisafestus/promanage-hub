import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/properties")({
  head: () => ({
    meta: [
      { title: "Properties · PropertyMS" },
      { name: "description", content: "Create and manage rental properties, units, MPESA paybills and water rates across your Kenyan portfolio." },
      { property: "og:title", content: "Properties · PropertyMS" },
      { property: "og:description", content: "Manage your rental properties and their units." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PropertiesPage,
});

type PropertyRow = {
  id: string; name: string; code: string; description: string | null;
  address_line1: string; city: string; county: string; postal_code: string | null;
  mpesa_paybill: string | null; water_rate: number | null;
  units: { id: string; vacant: boolean }[];
};

const EMPTY = {
  name: "", code: "", description: "", address_line1: "", city: "", county: "",
  postal_code: "", mpesa_paybill: "", water_rate: "",
};

function PropertiesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, units(id, vacant)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PropertyRow[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description.trim() || null,
        address_line1: form.address_line1.trim(),
        city: form.city.trim(),
        county: form.county.trim(),
        postal_code: form.postal_code.trim() || null,
        mpesa_paybill: form.mpesa_paybill.trim() || null,
        water_rate: form.water_rate ? Number(form.water_rate) : null,
      };
      if (editing) {
        const { error } = await supabase.from("properties").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found for your account.");
        const { error } = await supabase.from("properties").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Property updated" : "Property created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "That property code already exists." : e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Property deleted");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(
    () =>
      properties.filter((p) =>
        `${p.name} ${p.code} ${p.city}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [properties, search],
  );
  const pageRows = filtered.slice(page * 10, page * 10 + 10);
  const totalUnits = properties.reduce((s, p) => s + (p.units?.length ?? 0), 0);
  const totalVacancies = properties.reduce(
    (s, p) => s + (p.units?.filter((u) => u.vacant).length ?? 0), 0,
  );

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  }
  function openEdit(p: PropertyRow) {
    setEditing(p.id);
    setForm({
      name: p.name, code: p.code, description: p.description ?? "",
      address_line1: p.address_line1, city: p.city, county: p.county,
      postal_code: p.postal_code ?? "", mpesa_paybill: p.mpesa_paybill ?? "",
      water_rate: p.water_rate ? String(p.water_rate) : "",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Every building in your portfolio, with units and vacancies."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> Add property
          </Button>
        }
      />

      <div className="card-surface mb-4 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          { label: "Total properties", value: properties.length },
          { label: "Total units", value: totalUnits },
          { label: "Total vacancies", value: totalVacancies },
        ].map((m) => (
          <div key={m.label} className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</div>
            <div className="mt-1 text-2xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search properties"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property name</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>City</TableHead>
              <TableHead>County</TableHead>
              <TableHead>MPESA paybill</TableHead>
              <TableHead className="text-right">Water rate</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No properties yet.</TableCell></TableRow>
            ) : (
              pageRows.map((p) => (
                <TableRow key={p.id} className="odd:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.code}</div>
                  </TableCell>
                  <TableCell>{p.units?.length ?? 0}</TableCell>
                  <TableCell>{p.city || "—"}</TableCell>
                  <TableCell>{p.county || "—"}</TableCell>
                  <TableCell>{p.mpesa_paybill || "—"}</TableCell>
                  <TableCell className="text-right">{p.water_rate ? kes(p.water_rate) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(p)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => remove.mutate(p.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border p-3 text-sm text-muted-foreground">
          <span>Page {page + 1} of {Math.max(1, Math.ceil(filtered.length / 10))}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={(page + 1) * 10 >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit property" : "Add property"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Field label="Address" value={form.address_line1} onChange={(v) => setForm({ ...form, address_line1: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="County" value={form.county} onChange={(v) => setForm({ ...form, county: v })} />
            <Field label="Postal code" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} />
            <Field label="MPESA paybill" value={form.mpesa_paybill} onChange={(v) => setForm({ ...form, mpesa_paybill: v })} />
            <Field label="Water rate (KES)" value={form.water_rate} onChange={(v) => setForm({ ...form, water_rate: v })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name || !form.code || save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Create property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}