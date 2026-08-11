import { t as supabase } from "./client-BYCWxCl7.js";
import { useQuery } from "@tanstack/react-query";
//#region src/lib/tenant.ts
/** The tenant record linked to the signed-in user (RLS restricts this to their own row). */
function useMyTenant() {
	return useQuery({
		queryKey: ["my-tenant"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const uid = userData.user?.id;
			if (!uid) return null;
			const { data, error } = await supabase.from("tenants").select("*, properties(*), units(*)").eq("user_id", uid).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
//#endregion
export { useMyTenant as t };
