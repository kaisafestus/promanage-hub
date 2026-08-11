import { t as supabase } from "./client-BYCWxCl7.js";
import { useQuery } from "@tanstack/react-query";
//#region src/lib/session.ts
function useSession() {
	return useQuery({
		queryKey: ["session-profile"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const user = userData.user;
			if (!user) return null;
			const [{ data: profile }, { data: roles }] = await Promise.all([supabase.from("profiles").select("*, organizations(*)").eq("id", user.id).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", user.id)]);
			return {
				user,
				profile,
				role: roles?.[0]?.role ?? "LANDLORD",
				org: profile?.organizations ?? null
			};
		}
	});
}
function roleHome(role) {
	if (role === "TENANT") return "/tenant-dashboard";
	if (role === "VENDOR") return "/vendor-dashboard";
	return "/dashboard";
}
//#endregion
export { useSession as n, roleHome as t };
