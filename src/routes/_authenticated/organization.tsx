import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/organization")({
  head: () => ({
    meta: [
      { title: "Organization settings · PropertyMS" },
      { name: "description", content: "Update your property management company name, contact email and Kenyan phone number." },
      { property: "og:title", content: "Organization settings · PropertyMS" },
      { property: "og:description", content: "Company details for your property management organization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrganizationPage,
});

function OrganizationPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const org = session?.org as { id: string; name: string; email: string | null; phone: string | null; status: string } | null;
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (org) setForm({ name: org.name ?? "", email: org.email ?? "", phone: org.phone ?? "" });
  }, [org]);

  const save = useMutation({
    mutationFn: async () => {
      if (!org) throw new Error("No organization found.");
      const { error } = await supabase
        .from("organizations")
        .update({ name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Organization updated");
      queryClient.invalidateQueries({ queryKey: ["session-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Organization" subtitle="Company details used across invoices and tenant communication." />
      <div className="card-surface p-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          Status <StatusChip value={org?.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Organization name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254712345678" />
          </div>
        </div>
        <Button className="mt-6" disabled={save.isPending || !form.name} onClick={() => save.mutate()}>
          Save changes
        </Button>
      </div>
    </div>
  );
}