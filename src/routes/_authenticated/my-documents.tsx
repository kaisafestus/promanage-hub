import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMyTenant } from "@/lib/tenant";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-documents")({
  head: () => ({
    meta: [
      { title: "My Documents · PropertyMS" },
      {
        name: "description",
        content:
          "View and download lease agreements, receipts, invoices and other documents related to your tenancy.",
      },
      { property: "og:title", content: "My Documents · PropertyMS" },
      { property: "og:description", content: "Your tenancy documents in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyDocumentsPage,
});

function MyDocumentsPage() {
  const { data: tenant, isLoading: tenantLoading } = useMyTenant();

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ["my-documents"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid || !tenant?.id) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .or(
          `entity_type.eq.TENANT,entity_type.eq.UNIT,entity_type.eq.PROPERTY,uploaded_by_id.eq.${uid}`,
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

  if (tenantLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!tenant) {
    return (
      <div>
        <PageHeader title="My documents" />
        <div className="card-surface p-6 text-sm text-muted-foreground">
          No tenancy linked to your account yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My documents"
        subtitle="Lease agreements, receipts, invoices and other files."
      />

      <div className="card-surface">
        {docsLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading documents…</p>
        ) : documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents available yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.category.replace(/_/g, " ")} · {formatDate(d.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusChip value={d.category} />
                  <Button asChild variant="ghost" size="sm">
                    <a href={d.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
