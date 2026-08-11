import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/documents.tsx?tsr-split=component
function DocumentsPage() {
	const { data: documents = [], isLoading } = useQuery({
		queryKey: ["documents"],
		queryFn: async () => {
			const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, {
		title: "Documents",
		subtitle: "Leases, receipts and records linked to your portfolio."
	}), /* @__PURE__ */ jsx("div", {
		className: "card-surface overflow-x-auto",
		children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
			/* @__PURE__ */ jsx(TableHead, { children: "Name" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Type" }),
			/* @__PURE__ */ jsx(TableHead, { children: "Uploaded" })
		] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
			colSpan: 4,
			className: "py-10 text-center text-muted-foreground",
			children: "Loading…"
		}) }) : documents.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
			colSpan: 4,
			className: "py-10 text-center text-muted-foreground",
			children: "No documents yet."
		}) }) : documents.map((d) => /* @__PURE__ */ jsxs(TableRow, {
			className: "odd:bg-muted/30",
			children: [
				/* @__PURE__ */ jsx(TableCell, {
					className: "font-medium",
					children: /* @__PURE__ */ jsx("a", {
						href: d.url,
						target: "_blank",
						rel: "noreferrer",
						className: "text-primary hover:underline",
						children: d.name
					})
				}),
				/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: d.category }) }),
				/* @__PURE__ */ jsx(TableCell, { children: d.file_type || "—" }),
				/* @__PURE__ */ jsx(TableCell, { children: formatDate(d.created_at) })
			]
		}, d.id)) })] })
	})] });
}
//#endregion
export { DocumentsPage as component };
