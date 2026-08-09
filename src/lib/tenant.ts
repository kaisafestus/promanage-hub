import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** The tenant record linked to the signed-in user (RLS restricts this to their own row). */
export function useMyTenant() {
  return useQuery({
    queryKey: ["my-tenant"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("*, properties(*), units(*)")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
