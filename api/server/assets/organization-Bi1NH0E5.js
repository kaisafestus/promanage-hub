import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
//#region src/routes/_authenticated/organization.tsx?tsr-split=component
function OrganizationPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const org = session?.org;
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: ""
	});
	useEffect(() => {
		if (org) setForm({
			name: org.name ?? "",
			email: org.email ?? "",
			phone: org.phone ?? ""
		});
	}, [org]);
	const save = useMutation({
		mutationFn: async () => {
			if (!org) throw new Error("No organization found.");
			const { error } = await supabase.from("organizations").update({
				name: form.name.trim(),
				email: form.email.trim() || null,
				phone: form.phone.trim() || null
			}).eq("id", org.id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Organization updated");
			queryClient.invalidateQueries({ queryKey: ["session-profile"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-2xl",
		children: [/* @__PURE__ */ jsx(PageHeader, {
			title: "Organization",
			subtitle: "Company details used across invoices and tenant communication."
		}), /* @__PURE__ */ jsxs("div", {
			className: "card-surface p-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex items-center gap-2 text-sm text-muted-foreground",
					children: ["Status ", /* @__PURE__ */ jsx(StatusChip, { value: org?.status ?? null })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5 sm:col-span-2",
							children: [/* @__PURE__ */ jsx(Label, { children: "Organization name" }), /* @__PURE__ */ jsx(Input, {
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, { children: "Email" }), /* @__PURE__ */ jsx(Input, {
								type: "email",
								value: form.email,
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ jsx(Label, { children: "Phone" }), /* @__PURE__ */ jsx(Input, {
								value: form.phone,
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								}),
								placeholder: "+254712345678"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx(Button, {
					className: "mt-6",
					disabled: save.isPending || !form.name,
					onClick: () => save.mutate(),
					children: "Save changes"
				})
			]
		})]
	});
}
//#endregion
export { OrganizationPage as component };
