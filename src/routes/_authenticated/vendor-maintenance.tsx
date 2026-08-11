import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/vendor-maintenance")({
  head: () => ({
    meta: [
      { title: "Vendor Maintenance · PropertyMS" },
      {
        name: "description",
        content:
          "View and update your assigned maintenance requests, update status and add completion notes.",
      },
      { property: "og:title", content: "Vendor Maintenance · PropertyMS" },
      { property: "og:description", content: "Your assigned maintenance jobs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorMaintenancePage,
});

const STATUSES = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_PARTS",
  "COMPLETED",
  "CANCELLED",
] as const;
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] as const;

const EMPTY = {
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM" as (typeof PRIORITIES)[number],
  cost: "",
  scheduled_date: "",
};

function VendorMaintenancePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["vendor-assigned-full"],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, properties(name), units(unit_number), tenants(first_name, last_name)")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const updateStatus = useMutation({
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
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["vendor-assigned-full"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-assigned"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!vendor?.id) throw new Error("No vendor profile found.");
      const basePayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || null,
        priority: form.priority,
        cost: form.cost ? Number(form.cost) : null,
        scheduled_date: form.scheduled_date || null,
      };
      if (editing) {
        const { error } = await supabase
          .from("maintenance_requests")
          .update(basePayload)
          .eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found.");
        const { error } = await supabase.from("maintenance_requests").insert({
          ...basePayload,
          org_id: orgId,
          vendor_id: vendor.id,
          status: "OPEN",
        } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Request updated" : "Request created");
      setOpen(false);
      setEditing(null);
      setForm({ ...EMPTY });
      queryClient.invalidateQueries({ queryKey: ["vendor-assigned-full"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-assigned"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Your assigned jobs across properties."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY });
              setOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> New request
          </Button>
        }
      />

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Summary</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No assignments yet.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              requests.map((r: any) => (
                <TableRow key={r.id} className="odd:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{r.title}</div>
                    <div className="max-w-xs truncate text-xs text-muted-foreground">
                      {r.description}
                    </div>
                  </TableCell>
                  <TableCell>{r.properties?.name ?? "—"}</TableCell>
                  <TableCell>{r.units?.unit_number ?? "—"}</TableCell>
                  <TableCell>
                    {[r.tenants?.first_name, r.tenants?.last_name].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusChip value={r.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusChip value={r.status} />
                  </TableCell>
                  <TableCell>{formatDate(r.scheduled_date)}</TableCell>
                  <TableCell className="text-right">{r.cost ? kes(r.cost) : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateStatus.mutate({ id: r.id, status: "IN_PROGRESS" })}
                        >
                          Mark in progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus.mutate({ id: r.id, status: "COMPLETED" })}
                        >
                          Mark completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(r.id);
                            setForm({
                              title: r.title,
                              description: r.description,
                              category: r.category ?? "",
                              priority: r.priority,
                              cost: r.cost ? String(r.cost) : "",
                              scheduled_date: r.scheduled_date ?? "",
                            });
                            setOpen(true);
                          }}
                        >
                          Edit details
                        </DropdownMenuItem>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit request" : "New request"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Plumbing"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cost (KES)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled date</Label>
              <Input
                type="date"
                value={form.scheduled_date}
                onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.title || !form.description || save.isPending}
              onClick={() => save.mutate()}
            >
              {editing ? "Save changes" : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
