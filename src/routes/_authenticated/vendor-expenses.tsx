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

export const Route = createFileRoute("/_authenticated/vendor-expenses")({
  head: () => ({
    meta: [
      { title: "Vendor Expenses · PropertyMS" },
      {
        name: "description",
        content:
          "Log and track expenses for maintenance jobs, including parts, transport and labour costs in KES.",
      },
      { property: "og:title", content: "Vendor Expenses · PropertyMS" },
      { property: "og:description", content: "Track your job expenses in KES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorExpensesPage,
});

const CATEGORIES = ["Parts", "Transport", "Labour", "Materials", "Other"];

const EMPTY = {
  description: "",
  category: "Parts",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  property_id: "",
};

function VendorExpensesPage() {
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

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["vendor-expenses-full"],
    queryFn: async () => {
      if (!vendor?.id) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*, properties(name)")
        .eq("vendor_id", vendor.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!vendor?.id) throw new Error("No vendor profile found.");
      const payload = {
        description: form.description.trim(),
        category: form.category,
        amount: Number(form.amount || 0),
        date: form.date,
        property_id: form.property_id || null,
        vendor_id: vendor.id,
      };
      if (editing) {
        const { error } = await supabase.from("expenses").update(payload).eq("id", editing);
        if (error) throw error;
      } else {
        const orgId = session?.profile?.org_id;
        if (!orgId) throw new Error("No organization found.");
        const { error } = await supabase.from("expenses").insert({ ...payload, org_id: orgId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Expense updated" : "Expense logged");
      setOpen(false);
      setEditing(null);
      setForm({ ...EMPTY });
      queryClient.invalidateQueries({ queryKey: ["vendor-expenses-full"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: ["vendor-expenses-full"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Parts, transport, labour and materials for your jobs."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ ...EMPTY });
              setOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Log expense
          </Button>
        }
      />

      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No expenses logged yet.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              expenses.map((e: any) => (
                <TableRow key={e.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell className="text-sm">{e.properties?.name ?? "—"}</TableCell>
                  <TableCell>
                    <StatusChip value={e.category} />
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(e.date)}</TableCell>
                  <TableCell className="text-right">{kes(e.amount)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(e.id)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>{editing ? "Edit expense" : "Log expense"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (KES)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Property</Label>
              <Select
                value={form.property_id}
                onValueChange={(v) => setForm({ ...form, property_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!form.description || !form.amount || save.isPending}
              onClick={() => save.mutate()}
            >
              {editing ? "Save changes" : "Log expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
