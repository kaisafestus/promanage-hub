import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { t as useMyTenant } from "./tenant-CXuLukui.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
//#region src/routes/_authenticated/my-invoices.tsx?tsr-split=component
var METHODS = [
	"M_PESA",
	"BANK_TRANSFER",
	"CASH",
	"OTHER"
];
function MyInvoicesPage() {
	const { data: tenant } = useMyTenant();
	const queryClient = useQueryClient();
	const [target, setTarget] = useState(null);
	const [amount, setAmount] = useState("");
	const [method, setMethod] = useState("M_PESA");
	const [reference, setReference] = useState("");
	const { data: invoices = [], isLoading } = useQuery({
		queryKey: ["my-invoices"],
		queryFn: async () => {
			const { data, error } = await supabase.from("invoices").select("*").order("due_date", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: payments = [] } = useQuery({
		queryKey: ["my-payments"],
		queryFn: async () => {
			const { data, error } = await supabase.from("payments").select("*").order("paid_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const paidByInvoice = payments.reduce((acc, p) => {
		if (!p.invoice_id) return acc;
		if (p.status === "FAILED" || p.status === "REFUNDED") return acc;
		acc[p.invoice_id] = (acc[p.invoice_id] ?? 0) + Number(p.amount);
		return acc;
	}, {});
	const submit = useMutation({
		mutationFn: async () => {
			if (!tenant || !target) throw new Error("No invoice selected.");
			const value = Number(amount);
			if (!value || value <= 0) throw new Error("Enter a valid amount.");
			if (method === "M_PESA" && !reference.trim()) throw new Error("Enter the MPESA transaction code.");
			const { error } = await supabase.from("payments").insert({
				org_id: target.org_id,
				invoice_id: target.id,
				tenant_id: tenant.id,
				property_id: target.property_id,
				unit_id: target.unit_id,
				amount: value,
				method,
				reference: reference.trim() || null,
				status: "PENDING",
				paid_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Payment submitted — awaiting confirmation from your landlord.");
			setTarget(null);
			setAmount("");
			setReference("");
			setMethod("M_PESA");
			queryClient.invalidateQueries({ queryKey: ["my-payments"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const outstanding = invoices.reduce((s, i) => {
		const bal = Number(i.total_amount) - (paidByInvoice[i.id] ?? 0);
		return s + (bal > 0 && i.status !== "CANCELLED" ? bal : 0);
	}, 0);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Invoices & payments",
			subtitle: `Total outstanding: ${kes(outstanding)}`
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface",
			children: [/* @__PURE__ */ jsx("div", {
				className: "border-b border-border p-4 text-sm font-semibold",
				children: "Invoices"
			}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Invoice" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Description" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Issued" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Due" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Amount"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Balance"
				}),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
				/* @__PURE__ */ jsx(TableHead, { className: "w-28" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : invoices.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "No invoices yet."
			}) }) : invoices.map((i) => {
				const balance = Number(i.total_amount) - (paidByInvoice[i.id] ?? 0);
				return /* @__PURE__ */ jsxs(TableRow, {
					className: "odd:bg-muted/30",
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "font-medium",
							children: i.invoice_number
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "max-w-[220px] truncate",
							children: i.description
						}),
						/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.issue_date) }),
						/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.due_date) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: kes(i.total_amount)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: `text-right font-medium ${balance > 0 ? "text-destructive" : ""}`,
							children: kes(balance)
						}),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: i.status }) }),
						/* @__PURE__ */ jsx(TableCell, { children: balance > 0 && i.status !== "CANCELLED" ? /* @__PURE__ */ jsxs(Button, {
							size: "sm",
							onClick: () => {
								setTarget(i);
								setAmount(String(balance));
							},
							children: [/* @__PURE__ */ jsx(Smartphone, { className: "mr-1.5 h-3.5 w-3.5" }), " Pay"]
						}) : null })
					]
				}, i.id);
			}) })] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "border-b border-border p-4 text-sm font-semibold",
				children: "Payment history"
			}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Date" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Method" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Amount"
				}),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: payments.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 5,
				className: "py-10 text-center text-muted-foreground",
				children: "No payments recorded."
			}) }) : payments.map((p) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(p.paid_at) }),
					/* @__PURE__ */ jsx(TableCell, { children: p.method.replace(/_/g, " ") }),
					/* @__PURE__ */ jsx(TableCell, { children: p.reference ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: kes(p.amount)
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: p.status }) })
				]
			}, p.id)) })] })]
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open: !!target,
			onOpenChange: (o) => !o && setTarget(null),
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-md",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: ["Pay ", target?.invoice_number] }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "rounded-md bg-muted p-3 text-xs text-muted-foreground",
								children: "Send your payment via MPESA, then record the transaction code below. Your landlord confirms it and the invoice updates automatically."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Amount (KES)" }), /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: amount,
									onChange: (e) => setAmount(e.target.value)
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Method" }), /* @__PURE__ */ jsxs(Select, {
									value: method,
									onValueChange: setMethod,
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: METHODS.map((m) => /* @__PURE__ */ jsx(SelectItem, {
										value: m,
										children: m.replace(/_/g, " ")
									}, m)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: method === "M_PESA" ? "MPESA transaction code" : "Reference" }), /* @__PURE__ */ jsx(Input, {
									value: reference,
									onChange: (e) => setReference(e.target.value),
									placeholder: "e.g. SLK7XQ2P1M"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setTarget(null),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: submit.isPending,
						onClick: () => submit.mutate(),
						children: "Submit payment"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { MyInvoicesPage as component };
