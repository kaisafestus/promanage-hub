import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenant } from "@/lib/tenant";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/my-maintenance")({
  head: () => ({
    meta: [
      { title: "My Maintenance Requests · PropertyMS" },
      { name: "description", content: "Raise repair requests for your unit, set the priority and follow progress until the job is completed." },
      { property: "og:title", content: "My Maintenance Requests · PropertyMS" },
      { property: "og:description", content: "Report repairs and track their status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyMaintenancePage,
});

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as const;
const CATEGORIES = ["Plumbing", "Electrical", "Appliance", "Structural", "Pest control", "Other"];
const EMPTY = { title: "", description: "", category: "Plumbing", priority: "MEDIUM" };

function MyMaintenancePage() {
  const { data: tenant } = useMyTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, units(unit_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!tenant) throw new Error("No tenancy linked to your account.");
      if (!tenant.property_id) throw new Error("Your tenancy has no property assigned. Contact your landlord.");
      const { error } = await supabase.from("maintenance_requests").insert({
        org_id: tenant.org_id,
        tenant_id: tenant.id,
        property_id: tenant.property_id,
        unit_id: tenant.unit_id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority as (typeof PRIORITIES)[number],
        status: "OPEN",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request submitted");
      setOpen(false);
      setForm({ ...EMPTY });
      queryClient.invalidateQueries({ queryKey: ["my-maintenance"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Report a problem in your unit and follow it to completion."
        actions={
          <Button onClick={() => { setForm({ ...EMPTY }); setOpen(true); }}>
            <Plus className="mr-1.5 h-4 w-4" /> New request
          </Button>
        }
      />

      <div className="card-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Raised</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No requests raised yet.</TableCell></TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">
                    {r.title}
                    <div className="max-w-[280px] truncate text-xs text-muted-foreground">{r.description}</div>
                  </TableCell>
                  <TableCell>{r.category ?? "—"}</TableCell>
                  <TableCell>{(r as { units?: { unit_number?: string } }).units?.unit_number ?? "—"}</TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell>{formatDate(r.scheduled_date)}</TableCell>
                  <TableCell><StatusChip value={r.priority} /></TableCell>
                  <TableCell><StatusChip value={r.status} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New maintenance request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Leaking kitchen tap" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the problem and the best time to visit."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.title || !form.description || create.isPending} onClick={() => create.mutate()}>
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
