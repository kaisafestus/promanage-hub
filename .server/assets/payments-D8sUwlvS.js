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
import { t as Textarea } from "./textarea-kko37XEX.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
//#region src/routes/_authenticated/payments.tsx?tsr-split=component
var METHODS = [
	"M_PESA",
	"BANK_TRANSFER",
	"CREDIT_CARD",
	"DEBIT_CARD",
	"ACH",
	"CASH",
	"OTHER"
];
var PSTATUS = [
	"CONFIRMED",
	"PAID",
	"PENDING",
	"PARTIAL",
	"FAILED",
	"REFUNDED"
];
var EMPTY = {
	invoice_id: "",
	amount: "",
	method: "M_PESA",
	reference: "",
	status: "CONFIRMED",
	notes: ""
};
function PaymentsPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ ...EMPTY });
	const [search, setSearch] = useState("");
	const { data: invoices = [] } = useQuery({
		queryKey: ["invoices-open"],
		queryFn: async () => {
			const { data, error } = await supabase.from("invoices").select("id, invoice_number, total_amount, tenant_id, property_id, unit_id, status").neq("status", "PAID").order("due_date");
			if (error) throw error;
			return data;
		}
	});
	const { data: payments = [], isLoading } = useQuery({
		queryKey: ["payments"],
		queryFn: async () => {
			const { data, error } = await supabase.from("payments").select("*, tenants(first_name, last_name), properties(name), units(unit_number), invoices(invoice_number, total_amount)").order("paid_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	async function syncInvoiceStatus(invoiceId) {
		const { data: invoice } = await supabase.from("invoices").select("total_amount, due_date, status").eq("id", invoiceId).maybeSingle();
		if (!invoice) return;
		const { data: rows } = await supabase.from("payments").select("amount, status").eq("invoice_id", invoiceId);
		const paid = (rows ?? []).filter((p) => p.status === "PAID" || p.status === "CONFIRMED").reduce((s, p) => s + Number(p.amount), 0);
		const total = Number(invoice.total_amount);
		let status = "SENT";
		if (paid >= total && total > 0) status = "PAID";
		else if (paid > 0) status = "PARTIAL";
		else if (new Date(invoice.due_date) < /* @__PURE__ */ new Date()) status = "OVERDUE";
		await supabase.from("invoices").update({ status }).eq("id", invoiceId);
	}
	const save = useMutation({
		mutationFn: async () => {
			const invoice = invoices.find((i) => i.id === form.invoice_id);
			if (!invoice) throw new Error("Select an invoice.");
			const amount = Number(form.amount || 0);
			if (amount <= 0) throw new Error("Amount must be greater than zero.");
			const orgId = session?.profile?.org_id;
			if (!orgId) throw new Error("No organization found for your account.");
			const { error } = await supabase.from("payments").insert({
				org_id: orgId,
				invoice_id: invoice.id,
				tenant_id: invoice.tenant_id,
				property_id: invoice.property_id,
				unit_id: invoice.unit_id,
				amount,
				method: form.method,
				reference: form.reference.trim() || null,
				status: form.status,
				notes: form.notes.trim() || null
			});
			if (error) throw error;
			await syncInvoiceStatus(invoice.id);
		},
		onSuccess: () => {
			toast.success("Payment recorded");
			setOpen(false);
			setForm({ ...EMPTY });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			queryClient.invalidateQueries({ queryKey: ["invoices-open"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (payment) => {
			const { error } = await supabase.from("payments").delete().eq("id", payment.id);
			if (error) throw error;
			if (payment.invoice_id) await syncInvoiceStatus(payment.invoice_id);
		},
		onSuccess: () => {
			toast.success("Payment deleted");
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = useMemo(() => payments.filter((p) => {
		const t = p.tenants;
		return `${t?.first_name ?? ""} ${t?.last_name ?? ""} ${p.reference ?? ""}`.toLowerCase().includes(search.toLowerCase());
	}), [payments, search]);
	const total = filtered.reduce((s, p) => s + Number(p.amount), 0);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Payments",
			subtitle: "MPESA, bank and cash rent collections, reconciled against invoices.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setForm({ ...EMPTY });
					setOpen(true);
				},
				disabled: invoices.length === 0,
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Record payment"]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface mb-4 flex flex-wrap items-center justify-between gap-4 p-5",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: "Total received"
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-2xl font-bold",
				children: kes(total)
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "relative w-60",
				children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
					className: "pl-8",
					placeholder: "Search tenant or reference",
					value: search,
					onChange: (e) => setSearch(e.target.value)
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface overflow-x-auto",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Date" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Payment" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Property (unit)" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Method" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Amount"
				}),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: "No payments recorded yet."
			}) }) : filtered.map((p) => {
				const t = p.tenants;
				const prop = p.properties;
				const unit = p.units;
				return /* @__PURE__ */ jsxs(TableRow, {
					className: "odd:bg-muted/30",
					children: [
						/* @__PURE__ */ jsx(TableCell, { children: formatDate(p.paid_at) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "font-medium",
							children: shortId(p.id)
						}),
						/* @__PURE__ */ jsx(TableCell, { children: t ? `${t.first_name} ${t.last_name}` : "—" }),
						/* @__PURE__ */ jsxs(TableCell, { children: [prop?.name ?? "—", unit?.unit_number ? ` (${unit.unit_number})` : ""] }),
						/* @__PURE__ */ jsx(TableCell, { children: p.method.replace(/_/g, " ") }),
						/* @__PURE__ */ jsx(TableCell, { children: p.reference ?? "—" }),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: p.status }) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right font-medium",
							children: kes(p.amount)
						}),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
							})
						}), /* @__PURE__ */ jsx(DropdownMenuContent, {
							align: "end",
							children: /* @__PURE__ */ jsx(DropdownMenuItem, {
								className: "text-destructive",
								onClick: () => remove.mutate({
									id: p.id,
									invoice_id: p.invoice_id
								}),
								children: "Delete"
							})
						})] }) })
					]
				}, p.id);
			}) })] })
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Record payment" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Invoice" }), /* @__PURE__ */ jsxs(Select, {
									value: form.invoice_id,
									onValueChange: (v) => {
										const inv = invoices.find((i) => i.id === v);
										setForm({
											...form,
											invoice_id: v,
											amount: inv ? String(inv.total_amount) : form.amount
										});
									},
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select unpaid invoice" }) }), /* @__PURE__ */ jsx(SelectContent, { children: invoices.map((i) => /* @__PURE__ */ jsxs(SelectItem, {
										value: i.id,
										children: [
											i.invoice_number,
											" — ",
											kes(i.total_amount)
										]
									}, i.id)) })]
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
								children: [/* @__PURE__ */ jsx(Label, { children: "Method" }), /* @__PURE__ */ jsxs(Select, {
									value: form.method,
									onValueChange: (v) => setForm({
										...form,
										method: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: METHODS.map((m) => /* @__PURE__ */ jsx(SelectItem, {
										value: m,
										children: m.replace(/_/g, " ")
									}, m)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Reference" }), /* @__PURE__ */ jsx(Input, {
									value: form.reference,
									onChange: (e) => setForm({
										...form,
										reference: e.target.value
									}),
									placeholder: "MPESA code"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Status" }), /* @__PURE__ */ jsxs(Select, {
									value: form.status,
									onValueChange: (v) => setForm({
										...form,
										status: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: PSTATUS.map((s) => /* @__PURE__ */ jsx(SelectItem, {
										value: s,
										children: s
									}, s)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Notes" }), /* @__PURE__ */ jsx(Textarea, {
									value: form.notes,
									onChange: (e) => setForm({
										...form,
										notes: e.target.value
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
						disabled: !form.invoice_id || !form.amount || save.isPending,
						onClick: () => save.mutate(),
						children: "Record payment"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { PaymentsPage as component };
