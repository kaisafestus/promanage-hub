import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { n as formatDate } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/vendor-documents.tsx?tsr-split=component
function VendorDocumentsPage() {
	const { data: session } = useSession();
	const { data: documents = [], isLoading } = useQuery({
		queryKey: ["vendor-documents"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const uid = userData.user?.id;
			if (!uid) return [];
			const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", uid).maybeSingle();
			if (!vendor) return [];
			const { data, error } = await supabase.from("documents").select("*").or(`entity_type.eq.VENDOR,uploaded_by_id.eq.${uid}`).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, {
		title: "Documents",
		subtitle: "Contracts, receipts and other shared files."
	}), /* @__PURE__ */ jsx("div", {
		className: "card-surface",
		children: isLoading ? /* @__PURE__ */ jsx("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "Loading…"
		}) : documents.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "No documents yet."
		}) : /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
			/* @__PURE__ */ jsx(TableHead, { children: "Name" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Uploaded" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Size" }),
			/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
		] }) }), /* @__PURE__ */ jsx(TableBody, { children: documents.map((d) => /* @__PURE__ */ jsxs(TableRow, {
			className: "odd:bg-muted/30",
			children: [
				/* @__PURE__ */ jsx(TableCell, {
					className: "font-medium",
					children: d.name
				}),
				/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: d.category }) }),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-sm",
					children: formatDate(d.created_at)
				}),
				/* @__PURE__ */ jsxs(TableCell, {
					className: "text-sm text-muted-foreground",
					children: [(d.size / 1024).toFixed(1), " KB"]
				}),
				/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ jsx("a", {
						href: d.url,
						target: "_blank",
						rel: "noopener noreferrer",
						children: "View"
					})
				}) })
			]
		}, d.id)) })] })
	})] });
}
//#endregion
export { VendorDocumentsPage as component };
