import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents · PropertyMS" },
      { name: "description", content: "Lease agreements, receipts, invoices and maintenance records stored against your properties and tenants." },
      { property: "og:title", content: "Documents · PropertyMS" },
      { property: "og:description", content: "Leases, receipts and property records in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="Documents" subtitle="Leases, receipts and records linked to your portfolio." />
      <div className="card-surface overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : documents.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No documents yet.</TableCell></TableRow>
            ) : (
              documents.map((d) => (
                <TableRow key={d.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{d.name}</a>
                  </TableCell>
                  <TableCell><StatusChip value={d.category} /></TableCell>
                  <TableCell>{d.file_type || "—"}</TableCell>
                  <TableCell>{formatDate(d.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}