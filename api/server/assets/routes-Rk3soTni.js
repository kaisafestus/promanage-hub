import { t as supabase } from "./client-BYCWxCl7.js";
import { t as roleHome } from "./session-CZ3bZTox.js";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
import { Loader2 } from "lucide-react";
//#region src/routes/index.tsx?tsr-split=component
function Index() {
	const navigate = useNavigate();
	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getSession();
			const user = data.session?.user;
			if (!user) {
				navigate({
					to: "/auth",
					replace: true
				});
				return;
			}
			const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
			navigate({
				to: roleHome(roles?.[0]?.role ?? "LANDLORD"),
				replace: true
			});
		})();
	}, [navigate]);
	return /* @__PURE__ */ jsx("div", {
		className: "grid min-h-screen place-items-center bg-background",
		children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
	});
}
//#endregion
export { Index as component };
