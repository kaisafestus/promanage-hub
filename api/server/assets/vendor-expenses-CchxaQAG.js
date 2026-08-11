import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
//#region src/routes/_authenticated/vendor-expenses.tsx?tsr-split=component
var CATEGORIES = [
	"Parts",
	"Transport",
	"Labour",
	"Materials",
	"Other"
];
var EMPTY = {
	description: "",
	category: "Parts",
	amount: "",
	date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	property_id: ""
};
function VendorExpensesPage() {
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
	const { data: properties = [] } = useQuery({
		queryKey: ["properties-lite"],
		queryFn: async () => {
			const { data, error } = await supabase.from("properties").select("id, name").order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: expenses = [], isLoading } = useQuery({
		queryKey: ["vendor-expenses-full"],
		queryFn: async () => {
			if (!vendor?.id) return [];
			const { data, error } = await supabase.from("expenses").select("*, properties(name)").eq("vendor_id", vendor.id).order("date", { ascending: false });
			if (error) throw error;
			return data;
		},
		enabled: !!vendor?.id
	});
	const save = useMutation({
		mutationFn: async () => {
			if (!vendor?.id) throw new Error("No vendor profile found.");
			const payload = {
				description: form.description.trim(),
				category: form.category,
				amount: Number(form.amount || 0),
				date: form.date,
				property_id: form.property_id || null,
				vendor_id: vendor.id
			};
			if (editing) {
				const { error } = await supabase.from("expenses").update(payload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found.");
				const { error } = await supabase.from("expenses").insert({
					...payload,
					org_id: orgId
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Expense updated" : "Expense logged");
			setOpen(false);
			setEditing(null);
			setForm({ ...EMPTY });
			queryClient.invalidateQueries({ queryKey: ["vendor-expenses-full"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-expenses"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("expenses").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Expense deleted");
			queryClient.invalidateQueries({ queryKey: ["vendor-expenses-full"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-expenses"] });
			queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Expenses",
			subtitle: "Parts, transport, labour and materials for your jobs.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setEditing(null);
					setForm({ ...EMPTY });
					setOpen(true);
				},
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Log expense"]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface overflow-x-auto",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Description" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Date" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Amount"
				}),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 6,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : expenses.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 6,
				className: "py-10 text-center text-muted-foreground",
				children: "No expenses logged yet."
			}) }) : expenses.map((e) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, {
						className: "font-medium",
						children: e.description
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-sm",
						children: e.properties?.name ?? "—"
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: e.category }) }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-sm",
						children: formatDate(e.date)
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: kes(e.amount)
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => remove.mutate(e.id),
						children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
					}) })
				]
			}, e.id)) })] })
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit expense" : "Log expense" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Input, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
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
								children: [/* @__PURE__ */ jsx(Label, { children: "Property" }), /* @__PURE__ */ jsxs(Select, {
									value: form.property_id,
									onValueChange: (v) => setForm({
										...form,
										property_id: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Optional" }) }), /* @__PURE__ */ jsx(SelectContent, { children: properties.map((p) => /* @__PURE__ */ jsx(SelectItem, {
										value: p.id,
										children: p.name
									}, p.id)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Date" }), /* @__PURE__ */ jsx(Input, {
									type: "date",
									value: form.date,
									onChange: (e) => setForm({
										...form,
										date: e.target.value
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
						disabled: !form.description || !form.amount || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Log expense"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { VendorExpensesPage as component };
