import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { t as useMyTenant } from "./tenant-CXuLukui.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
//#region src/routes/_authenticated/my-documents.tsx?tsr-split=component
function MyDocumentsPage() {
	const { data: tenant, isLoading: tenantLoading } = useMyTenant();
	const { data: documents = [], isLoading: docsLoading } = useQuery({
		queryKey: ["my-documents"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const uid = userData.user?.id;
			if (!uid || !tenant?.id) return [];
			const { data, error } = await supabase.from("documents").select("*").or(`entity_type.eq.TENANT,entity_type.eq.UNIT,entity_type.eq.PROPERTY,uploaded_by_id.eq.${uid}`).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!tenant?.id
	});
	if (tenantLoading) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!tenant) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, { title: "My documents" }), /* @__PURE__ */ jsx("div", {
		className: "card-surface p-6 text-sm text-muted-foreground",
		children: "No tenancy linked to your account yet."
	})] });
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, {
		title: "My documents",
		subtitle: "Lease agreements, receipts, invoices and other files."
	}), /* @__PURE__ */ jsx("div", {
		className: "card-surface",
		children: docsLoading ? /* @__PURE__ */ jsx("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Loading documents…"
		}) : documents.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "No documents available yet."
		}) : /* @__PURE__ */ jsx("ul", {
			className: "divide-y divide-border",
			children: documents.map((d) => /* @__PURE__ */ jsxs("li", {
				className: "flex items-center justify-between py-3 text-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
						className: "font-medium",
						children: d.name
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xs text-muted-foreground",
						children: [
							d.category.replace(/_/g, " "),
							" · ",
							formatDate(d.created_at)
						]
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx(StatusChip, { value: d.category }), /* @__PURE__ */ jsx(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ jsx("a", {
							href: d.url,
							target: "_blank",
							rel: "noopener noreferrer",
							children: "View"
						})
					})]
				})]
			}, d.id))
		})
	})] });
}
//#endregion
export { MyDocumentsPage as component };
