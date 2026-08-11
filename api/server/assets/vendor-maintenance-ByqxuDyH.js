import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
//#region src/routes/_authenticated/vendor-maintenance.tsx?tsr-split=component
var PRIORITIES = [
	"LOW",
	"MEDIUM",
	"HIGH",
	"EMERGENCY"
];
var EMPTY = {
	title: "",
	description: "",
	category: "",
	priority: "MEDIUM",
	cost: "",
	scheduled_date: ""
};
function VendorMaintenancePage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ ...EMPTY });
	const { data: vendor } = useQuery({
		queryKey: ["my-vendor"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const uid = userData.user?.id;
			if (!uid) return null;
			const { data, error } = await supabase.from("vendors").select("id").eq("user_id", uid).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const { data: requests = [], isLoading } = useQuery({
		queryKey: ["vendor-assigned-full"],
		queryFn: async () => {
			if (!vendor?.id) return [];
			const { data, error } = await supabase.from("maintenance_requests").select("*, properties(name), units(unit_number), tenants(first_name, last_name)").eq("vendor_id", vendor.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!vendor?.id
	});
	const updateStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("maintenance_requests").update({
				status,
				completed_date: status === "COMPLETED" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : null
			}).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Status updated");
			queryClient.invalidateQueries({ queryKey: ["vendor-assigned-full"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-assigned"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!vendor?.id) throw new Error("No vendor profile found.");
			const basePayload = {
				title: form.title.trim(),
				description: form.description.trim(),
				category: form.category.trim() || null,
				priority: form.priority,
				cost: form.cost ? Number(form.cost) : null,
				scheduled_date: form.scheduled_date || null
			};
			if (editing) {
				const { error } = await supabase.from("maintenance_requests").update(basePayload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found.");
				const { error } = await supabase.from("maintenance_requests").insert({
					...basePayload,
					org_id: orgId,
					vendor_id: vendor.id,
					status: "OPEN"
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Request updated" : "Request created");
			setOpen(false);
			setEditing(null);
			setForm({ ...EMPTY });
			queryClient.invalidateQueries({ queryKey: ["vendor-assigned-full"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-assigned"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Maintenance",
			subtitle: "Your assigned jobs across properties.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setEditing(null);
					setForm({ ...EMPTY });
					setOpen(true);
				},
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " New request"]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface overflow-x-auto",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Summary" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Priority" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Scheduled" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Cost"
				}),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : requests.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: "No assignments yet."
			}) }) : requests.map((r) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("div", {
						className: "font-medium",
						children: r.title
					}), /* @__PURE__ */ jsx("div", {
						className: "max-w-xs truncate text-xs text-muted-foreground",
						children: r.description
					})] }),
					/* @__PURE__ */ jsx(TableCell, { children: r.properties?.name ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: r.units?.unit_number ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: [r.tenants?.first_name, r.tenants?.last_name].filter(Boolean).join(" ") || "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.priority }) }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.status }) }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(r.scheduled_date) }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: r.cost ? kes(r.cost) : "—"
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
						align: "end",
						children: [
							/* @__PURE__ */ jsx(DropdownMenuItem, {
								onClick: () => updateStatus.mutate({
									id: r.id,
									status: "IN_PROGRESS"
								}),
								children: "Mark in progress"
							}),
							/* @__PURE__ */ jsx(DropdownMenuItem, {
								onClick: () => updateStatus.mutate({
									id: r.id,
									status: "COMPLETED"
								}),
								children: "Mark completed"
							}),
							/* @__PURE__ */ jsx(DropdownMenuItem, {
								onClick: () => {
									setEditing(r.id);
									setForm({
										title: r.title,
										description: r.description,
										category: r.category ?? "",
										priority: r.priority,
										cost: r.cost ? String(r.cost) : "",
										scheduled_date: r.scheduled_date ?? ""
									});
									setOpen(true);
								},
								children: "Edit details"
							})
						]
					})] }) })
				]
			}, r.id)) })] })
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit request" : "New request" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Title" }), /* @__PURE__ */ jsx(Input, {
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Textarea, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Category" }), /* @__PURE__ */ jsx(Input, {
									value: form.category,
									onChange: (e) => setForm({
										...form,
										category: e.target.value
									}),
									placeholder: "Plumbing"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
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
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Cost (KES)" }), /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: form.cost,
									onChange: (e) => setForm({
										...form,
										cost: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Scheduled date" }), /* @__PURE__ */ jsx(Input, {
									type: "date",
									value: form.scheduled_date,
									onChange: (e) => setForm({
										...form,
										scheduled_date: e.target.value
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.title || !form.description || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Submit request"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { VendorMaintenancePage as component };
