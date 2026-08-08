import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/invitations")({
  head: () => ({
    meta: [
      { title: "Invitations · PropertyMS" },
      { name: "description", content: "Invite tenants and vendors to their own portal, and track pending, accepted, expired and revoked invitations." },
      { property: "og:title", content: "Invitations · PropertyMS" },
      { property: "og:description", content: "Invite tenants and vendors to their portals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InvitationsPage,
});

const EMPTY = { email: "", role: "TENANT" as "TENANT" | "VENDOR", first_name: "", last_name: "", phone: "" };

function InvitationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const orgId = session?.profile?.org_id;
      if (!orgId) throw new Error("No organization found for your account.");
      const { error } = await supabase.from("invitations").insert({
        org_id: orgId,
        email: form.email.trim().toLowerCase(),
        role: form.role,
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        phone: form.phone.trim() || null,
        invited_by_id: session?.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invitation created");
      setOpen(false);
      setForm({ ...EMPTY });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "REVOKED" }) => {
      const { error } = await supabase.from("invitations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const counts = {
    total: invitations.length,
    pending: invitations.filter((i) => i.status === "PENDING").length,
    accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
    closed: invitations.filter((i) => i.status === "EXPIRED" || i.status === "REVOKED").length,
  };

  return (
    <div>
      <PageHeader
        title="Invitations"
        subtitle="Invite tenants and vendors into their own portals."
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Invite user</Button>}
      />

      <div className="card-surface mb-4 grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: "Total invites", value: counts.total },
          { label: "Pending", value: counts.pending },
          { label: "Accepted", value: counts.accepted },
          { label: "Expired / revoked", value: counts.closed },
        ].map((m) => (
          <div key={m.label} className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</div>
            <div className="mt-1 text-2xl font-bold">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : invitations.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No invitations yet.</TableCell></TableRow>
            ) : (
              invitations.map((i) => (
                <TableRow key={i.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">{i.email}</TableCell>
                  <TableCell><StatusChip value={i.role} /></TableCell>
                  <TableCell>{[i.first_name, i.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                  <TableCell>{i.phone ?? "—"}</TableCell>
                  <TableCell><StatusChip value={i.status} /></TableCell>
                  <TableCell>{formatDate(i.created_at)}</TableCell>
                  <TableCell>{formatDate(i.expires_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => update.mutate({ id: i.id, status: "REVOKED" })}>Revoke</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => remove.mutate(i.id)}>Delete</DropdownMenuItem>
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
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite user</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="VENDOR">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254712345678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.email || create.isPending} onClick={() => create.mutate()}>Send invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}