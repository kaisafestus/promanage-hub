import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { a as shortId, n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { t as Checkbox } from "./checkbox-kt6FvQcE.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
//#region src/routes/_authenticated/invoices.tsx?tsr-split=component
var STATUSES = [
	"DRAFT",
	"SENT",
	"PARTIAL",
	"PAID",
	"OVERDUE",
	"CANCELLED",
	"UNCOLLECTIBLE"
];
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var EMPTY = {
	tenant_id: "",
	invoice_number: "",
	issue_date: today(),
	due_date: today(),
	amount: "",
	status: "DRAFT",
	description: "Monthly rent"
};
function InvoicesPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ ...EMPTY });
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState([]);
	const { data: tenants = [] } = useQuery({
		queryKey: ["tenants-lite"],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("id, first_name, last_name, property_id, unit_id, monthly_rent");
			if (error) throw error;
			return data;
		}
	});
	const { data: invoices = [], isLoading } = useQuery({
		queryKey: ["invoices"],
		queryFn: async () => {
			const { data, error } = await supabase.from("invoices").select("*, tenants(first_name, last_name), properties(name), units(unit_number)").order("issue_date", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const tenant = tenants.find((t) => t.id === form.tenant_id);
			const amount = Number(form.amount || 0);
			if (amount <= 0) throw new Error("Amount must be greater than zero.");
			const payload = {
				tenant_id: form.tenant_id || null,
				property_id: tenant?.property_id ?? null,
				unit_id: tenant?.unit_id ?? null,
				invoice_number: form.invoice_number.trim(),
				issue_date: form.issue_date,
				due_date: form.due_date,
				amount,
				total_amount: amount,
				status: form.status,
				description: form.description.trim()
			};
			if (editing) {
				const { error } = await supabase.from("invoices").update(payload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found for your account.");
				const { error } = await supabase.from("invoices").insert({
					...payload,
					org_id: orgId
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Invoice updated" : "Invoice created");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
		onError: (e) => toast.error(e.message.includes("duplicate") ? "That invoice number already exists." : e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("invoices").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Invoice deleted");
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = useMemo(() => invoices.filter((i) => {
		const t = i.tenants;
		const matchesSearch = `${i.invoice_number} ${t?.first_name ?? ""} ${t?.last_name ?? ""} ${i.description}`.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter.length === 0 || statusFilter.includes(i.status);
		return matchesSearch && matchesStatus;
	}), [
		invoices,
		search,
		statusFilter
	]);
	const total = filtered.reduce((s, i) => s + Number(i.total_amount), 0);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Invoices",
			subtitle: "Rent, water and utility billing in KES.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setEditing(null);
					setForm({
						...EMPTY,
						invoice_number: `INV-${Date.now().toString().slice(-6)}`
					});
					setOpen(true);
				},
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Add invoice"]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-4 lg:flex-row",
			children: [/* @__PURE__ */ jsxs("aside", {
				className: "card-surface h-fit w-full shrink-0 p-4 lg:w-60",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ jsx(Label, { children: "Search" }), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
							className: "pl-8",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Invoice or tenant"
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Status"
					}), /* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: STATUSES.map((s) => /* @__PURE__ */ jsxs("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ jsx(Checkbox, {
								checked: statusFilter.includes(s),
								onCheckedChange: (c) => setStatusFilter((f) => c ? [...f, s] : f.filter((x) => x !== s))
							}), s.charAt(0) + s.slice(1).toLowerCase()]
						}, s))
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface mb-4 p-5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Total invoiced"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-1 text-2xl font-bold",
						children: kes(total)
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "card-surface overflow-x-auto",
					children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Date" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Invoice" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Property (unit)" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Due" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Amount"
						}),
						/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 8,
						className: "py-10 text-center text-muted-foreground",
						children: "Loading…"
					}) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 8,
						className: "py-10 text-center text-muted-foreground",
						children: "No invoices yet."
					}) }) : filtered.map((i) => {
						const t = i.tenants;
						const p = i.properties;
						const u = i.units;
						return /* @__PURE__ */ jsxs(TableRow, {
							className: "odd:bg-muted/30",
							children: [
								/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.issue_date) }),
								/* @__PURE__ */ jsx(TableCell, {
									className: "font-medium",
									children: i.invoice_number || shortId(i.id)
								}),
								/* @__PURE__ */ jsx(TableCell, { children: t ? `${t.first_name} ${t.last_name}` : "—" }),
								/* @__PURE__ */ jsxs(TableCell, { children: [p?.name ?? "—", u?.unit_number ? ` (${u.unit_number})` : ""] }),
								/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.due_date) }),
								/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: i.status }) }),
								/* @__PURE__ */ jsx(TableCell, {
									className: "text-right font-medium",
									children: kes(i.total_amount)
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
									children: [/* @__PURE__ */ jsx(DropdownMenuItem, {
										onClick: () => {
											setEditing(i.id);
											setForm({
												tenant_id: i.tenant_id ?? "",
												invoice_number: i.invoice_number,
												issue_date: i.issue_date,
												due_date: i.due_date,
												amount: String(i.amount),
												status: i.status,
												description: i.description
											});
											setOpen(true);
										},
										children: "Edit"
									}), /* @__PURE__ */ jsx(DropdownMenuItem, {
										className: "text-destructive",
										onClick: () => remove.mutate(i.id),
										children: "Delete"
									})]
								})] }) })
							]
						}, i.id);
					}) })] })
				})]
			})]
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit invoice" : "Add invoice" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Tenant" }), /* @__PURE__ */ jsxs(Select, {
									value: form.tenant_id,
									onValueChange: (v) => {
										const t = tenants.find((x) => x.id === v);
										setForm({
											...form,
											tenant_id: v,
											amount: t ? String(t.monthly_rent) : form.amount
										});
									},
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select tenant" }) }), /* @__PURE__ */ jsx(SelectContent, { children: tenants.map((t) => /* @__PURE__ */ jsxs(SelectItem, {
										value: t.id,
										children: [
											t.first_name,
											" ",
											t.last_name
										]
									}, t.id)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Invoice number" }), /* @__PURE__ */ jsx(Input, {
									value: form.invoice_number,
									onChange: (e) => setForm({
										...form,
										invoice_number: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Amount (KES)" }), /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: form.amount,
									onChange: (e) => setForm({
										...form,
										amount: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Issue date" }), /* @__PURE__ */ jsx(Input, {
									type: "date",
									value: form.issue_date,
									onChange: (e) => setForm({
										...form,
										issue_date: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Due date" }), /* @__PURE__ */ jsx(Input, {
									type: "date",
									value: form.due_date,
									onChange: (e) => setForm({
										...form,
										due_date: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Status" }), /* @__PURE__ */ jsxs(Select, {
									value: form.status,
									onValueChange: (v) => setForm({
										...form,
										status: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsx(SelectItem, {
										value: s,
										children: s
									}, s)) })]
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
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.invoice_number || !form.amount || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Create invoice"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { InvoicesPage as component };
