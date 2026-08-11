import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { t as useMyTenant } from "./tenant-CXuLukui.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
//#region src/routes/_authenticated/my-maintenance.tsx?tsr-split=component
var PRIORITIES = [
	"LOW",
	"MEDIUM",
	"HIGH",
	"EMERGENCY"
];
var CATEGORIES = [
	"Plumbing",
	"Electrical",
	"Appliance",
	"Structural",
	"Pest control",
	"Other"
];
var EMPTY = {
	title: "",
	description: "",
	category: "Plumbing",
	priority: "MEDIUM"
};
function MyMaintenancePage() {
	const { data: tenant } = useMyTenant();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ ...EMPTY });
	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["my-maintenance"],
		queryFn: async () => {
			const { data, error } = await supabase.from("maintenance_requests").select("*, units(unit_number)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			if (!tenant) throw new Error("No tenancy linked to your account.");
			if (!tenant.property_id) throw new Error("Your tenancy has no property assigned. Contact your landlord.");
			const { error } = await supabase.from("maintenance_requests").insert({
				org_id: tenant.org_id,
				tenant_id: tenant.id,
				property_id: tenant.property_id,
				unit_id: tenant.unit_id,
				title: form.title.trim(),
				description: form.description.trim(),
				category: form.category,
				priority: form.priority,
				status: "OPEN"
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Request submitted");
			setOpen(false);
			setForm({ ...EMPTY });
			queryClient.invalidateQueries({ queryKey: ["my-maintenance"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Maintenance",
			subtitle: "Report a problem in your unit and follow it to completion.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setForm({ ...EMPTY });
					setOpen(true);
				},
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " New request"]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Title" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Raised" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Scheduled" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Priority" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 7,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : requests.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 7,
				className: "py-10 text-center text-muted-foreground",
				children: "No requests raised yet."
			}) }) : requests.map((r) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsxs(TableCell, {
						className: "font-medium",
						children: [r.title, /* @__PURE__ */ jsx("div", {
							className: "max-w-[280px] truncate text-xs text-muted-foreground",
							children: r.description
						})]
					}),
					/* @__PURE__ */ jsx(TableCell, { children: r.category ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: r.units?.unit_number ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(r.created_at) }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(r.scheduled_date) }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.priority }) }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.status }) })
				]
			}, r.id)) })] })
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "New maintenance request" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Title" }), /* @__PURE__ */ jsx(Input, {
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value
									}),
									placeholder: "Leaking kitchen tap"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, { children: "Category" }), /* @__PURE__ */ jsxs(Select, {
										value: form.category,
										onValueChange: (v) => setForm({
											...form,
											category: v
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsx(SelectItem, {
											value: c,
											children: c
										}, c)) })]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, { children: "Priority" }), /* @__PURE__ */ jsxs(Select, {
										value: form.priority,
										onValueChange: (v) => setForm({
											...form,
											priority: v
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: PRIORITIES.map((p) => /* @__PURE__ */ jsx(SelectItem, {
											value: p,
											children: p
										}, p)) })]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Textarea, {
									rows: 4,
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									}),
									placeholder: "Describe the problem and the best time to visit."
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.title || !form.description || create.isPending,
						onClick: () => create.mutate(),
						children: "Submit request"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { MyMaintenancePage as component };
