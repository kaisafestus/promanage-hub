import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "ADMIN" | "LANDLORD" | "TENANT" | "VENDOR" | "APPLICANT";

export function useSession() {
  return useQuery({
    queryKey: ["session-profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("*, organizations(*)").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const role = (roles?.[0]?.role ?? "LANDLORD") as AppRole;
      return { user, profile, role, org: profile?.organizations ?? null };
    },
  });
}

export function roleHome(role: AppRole | undefined): string {
  if (role === "TENANT") return "/tenant-dashboard";
  if (role === "VENDOR") return "/vendor-dashboard";
  return "/dashboard";
}