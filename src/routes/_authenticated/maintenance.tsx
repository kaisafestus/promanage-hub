import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { kes, formatDate } from "@/lib/format";
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

export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance · PropertyMS" },
      { name: "description", content: "Log, prioritise and close maintenance requests across properties, with costs tracked in KES." },
      { property: "og:title", content: "Maintenance · PropertyMS" },
      { property: "og:description", content: "Track repairs from open to completed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaintenancePage,
});

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as const;
const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_PARTS", "COMPLETED", "CANCELLED"] as const;

const EMPTY = {
  property_id: "", unit_id: "", title: "", description: "", category: "",
  priority: "MEDIUM" as (typeof PRIORITIES)[number],
  status: "OPEN" as (typeof STATUSES)[number],
  cost: "", scheduled_date: "",
};

function MaintenancePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, properties(name), units(unit_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        property_id: form.property_id,
        unit_id: form.unit_id || null,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || null,
        priority: form.priority,
        status: form.status,
        cost: form.cost ? Number(form.cost) : null,
        scheduled_date: form.scheduled_date || null,
        completed_date: form.status === "COMPLETED" ? new Date().toISOString().slice(0, 10) : null,
      };
      if (editing) {
        const { error } = await supabase.from("maintenance_requests").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found for your account.");
        const { error } = await supabase.from("maintenance_requests").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Request updated" : "Request created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: (typeof STATUSES)[number] }) => {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({
          status,
          completed_date: status === "COMPLETED" ? new Date().toISOString().slice(0, 10) : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maintenance_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request deleted");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unitOptions = units.filter((u) => !form.property_id || u.property_id === form.property_id);
  const openCount = requests.filter((r) => r.status === "OPEN" || r.status === "ASSIGNED").length;
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS" || r.status === "WAITING_PARTS").length;

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Repairs and callouts across your properties."
        actions={
          <Button
            onClick={() => { setEditing(null); setForm({ ...EMPTY }); setOpen(true); }}
            disabled={properties.length === 0}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add maintenance
          </Button>
        }
      />

      <div className="card-surface mb-4 grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open requests</div>
          <div className="mt-1 text-2xl font-bold">{openCount}</div>
        </div>
        <div className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">In progress</div>
          <div className="mt-1 text-2xl font-bold">{inProgress}</div>
        </div>
      </div>

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Summary</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No maintenance requests.</TableCell></TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id} className="odd:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{r.title}</div>
                    <div className="max-w-xs truncate text-xs text-muted-foreground">{r.description}</div>
                  </TableCell>
                  <TableCell>{(r as { properties?: { name?: string } }).properties?.name ?? "—"}</TableCell>
                  <TableCell>{(r as { units?: { unit_number?: string } }).units?.unit_number ?? "—"}</TableCell>
                  <TableCell><StatusChip value={r.priority} /></TableCell>
                  <TableCell><StatusChip value={r.status} /></TableCell>
                  <TableCell>{formatDate(r.scheduled_date)}</TableCell>
                  <TableCell className="text-right">{r.cost ? kes(r.cost) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(r.id);
                            setForm({
                              property_id: r.property_id, unit_id: r.unit_id ?? "",
                              title: r.title, description: r.description,
                              category: r.category ?? "", priority: r.priority,
                              status: r.status, cost: r.cost ? String(r.cost) : "",
                              scheduled_date: r.scheduled_date ?? "",
                            });
                            setOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatus.mutate({ id: r.id, status: "IN_PROGRESS" })}>Mark in progress</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatus.mutate({ id: r.id, status: "COMPLETED" })}>Mark completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(r.id)}>Delete</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editing ? "Edit request" : "Add maintenance request"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Property</Label>
              <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v, unit_id: "" })}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={form.unit_id} onValueChange={(v) => setForm({ ...form, unit_id: v })}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{unitOptions.map((u) => <SelectItem key={u.id} value={u.id}>{u.unit_number}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Plumbing" />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost (KES)</Label>
              <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Scheduled date</Label>
              <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.property_id || !form.title || save.isPending} onClick={() => save.mutate()}>
              {editing ? "Save changes" : "Create request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}