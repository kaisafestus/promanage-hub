import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/vendor-documents")({
  head: () => ({
    meta: [
      { title: "Vendor Documents · PropertyMS" },
      {
        name: "description",
        content: "Contracts, receipts and other documents shared with you by property managers.",
      },
      { property: "og:title", content: "Vendor Documents · PropertyMS" },
      { property: "og:description", content: "Your vendor documents and contracts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorDocumentsPage,
});

function VendorDocumentsPage() {
  const { data: session } = useSession();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["vendor-documents"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return [];
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (!vendor) return [];
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .or(`entity_type.eq.VENDOR,uploaded_by_id.eq.${uid}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="Documents" subtitle="Contracts, receipts and other shared files." />

      <div className="card-surface">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No documents yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id} className="odd:bg-muted/30">
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    <StatusChip value={d.category} />
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(d.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(d.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <a href={d.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
