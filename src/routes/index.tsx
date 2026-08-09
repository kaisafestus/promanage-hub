import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { roleHome, type AppRole } from "@/lib/session";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PropertyMS · Kenya Property Management System" },
      { name: "description", content: "Multi-portal property management for Kenyan landlords: properties, units, tenants, KES invoicing, MPESA payments and maintenance." },
      { property: "og:title", content: "PropertyMS · Kenya Property Management" },
      { property: "og:description", content: "Landlord, tenant, vendor and admin portals with KES invoicing and MPESA payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      navigate({ to: roleHome((roles?.[0]?.role ?? "LANDLORD") as AppRole), replace: true });
    })();
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
