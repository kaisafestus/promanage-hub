import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { i as normalizeKenyanPhone, n as formatDate, r as kes, t as KE_PHONE_REGEX } from "./format-Dg8MMhg6.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
//#region src/routes/_authenticated/tenants.tsx?tsr-split=component
var EMPTY = {
	first_name: "",
	last_name: "",
	email: "",
	phone: "",
	property_id: "",
	unit_id: "",
	lease_start_date: "",
	lease_end_date: "",
	monthly_rent: "",
	security_deposit: ""
};
function TenantsPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ ...EMPTY });
	const [search, setSearch] = useState("");
	const { data: properties = [] } = useQuery({
		queryKey: ["properties-lite"],
		queryFn: async () => {
			const { data, error } = await supabase.from("properties").select("id, name").order("name");
			if (error) throw error;
			return data;
		}
	});
	const { data: units = [] } = useQuery({
		queryKey: ["units-lite"],
		queryFn: async () => {
			const { data, error } = await supabase.from("units").select("id, unit_number, property_id, monthly_rent");
			if (error) throw error;
			return data;
		}
	});
	const { data: tenants = [], isLoading } = useQuery({
		queryKey: ["tenants"],
		queryFn: async () => {
			const { data, error } = await supabase.from("tenants").select("*, properties(name), units(unit_number), invoices(total_amount), payments(amount, status)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const phone = form.phone ? normalizeKenyanPhone(form.phone) : null;
			if (phone && !KE_PHONE_REGEX.test(phone)) throw new Error("Phone must be a Kenyan number, e.g. +254712345678");
			const payload = {
				first_name: form.first_name.trim(),
				last_name: form.last_name.trim(),
				email: form.email.trim() || null,
				phone,
				property_id: form.property_id || null,
				unit_id: form.unit_id || null,
				lease_start_date: form.lease_start_date || null,
				lease_end_date: form.lease_end_date || null,
				monthly_rent: Number(form.monthly_rent || 0),
				security_deposit: Number(form.security_deposit || 0)
			};
			if (editing) {
				const { error } = await supabase.from("tenants").update(payload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found for your account.");
				const { error } = await supabase.from("tenants").insert({
					...payload,
					org_id: orgId
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Tenant updated" : "Tenant added");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("tenants").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Tenant removed");
			queryClient.invalidateQueries({ queryKey: ["tenants"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const unitOptions = units.filter((u) => !form.property_id || u.property_id === form.property_id);
	const filtered = useMemo(() => tenants.filter((t) => `${t.first_name} ${t.last_name} ${t.email ?? ""}`.toLowerCase().includes(search.toLowerCase())), [tenants, search]);
	function balanceOf(t) {
		return (t.invoices ?? []).reduce((s, i) => s + Number(i.total_amount), 0) - (t.payments ?? []).filter((p) => p.status === "PAID" || p.status === "CONFIRMED").reduce((s, p) => s + Number(p.amount), 0);
	}
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Tenants",
			subtitle: "Lease terms, contact details and outstanding balances.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setEditing(null);
					setForm({ ...EMPTY });
					setOpen(true);
				},
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Add tenant"]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface",
			children: [/* @__PURE__ */ jsx("div", {
				className: "border-b border-border p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "relative w-60",
					children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						className: "pl-8",
						placeholder: "Search tenants",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				})
			}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Contact" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Lease expiry" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Monthly rent"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Balance"
				}),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "No tenants yet."
			}) }) : filtered.map((t) => {
				const balance = balanceOf(t);
				return /* @__PURE__ */ jsxs(TableRow, {
					className: "odd:bg-muted/30",
					children: [
						/* @__PURE__ */ jsxs(TableCell, {
							className: "font-medium",
							children: [
								t.first_name,
								" ",
								t.last_name
							]
						}),
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("div", {
							className: "text-sm",
							children: t.email ?? "—"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: t.phone ?? "—"
						})] }),
						/* @__PURE__ */ jsx(TableCell, { children: t.properties?.name ?? "—" }),
						/* @__PURE__ */ jsx(TableCell, { children: t.units?.unit_number ?? "—" }),
						/* @__PURE__ */ jsx(TableCell, { children: formatDate(t.lease_end_date) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: kes(t.monthly_rent)
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: `text-right font-medium ${balance > 0 ? "text-destructive" : ""}`,
							children: kes(balance)
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
									setEditing(t.id);
									setForm({
										first_name: t.first_name,
										last_name: t.last_name,
										email: t.email ?? "",
										phone: t.phone ?? "",
										property_id: t.property_id ?? "",
										unit_id: t.unit_id ?? "",
										lease_start_date: t.lease_start_date ?? "",
										lease_end_date: t.lease_end_date ?? "",
										monthly_rent: String(t.monthly_rent),
										security_deposit: String(t.security_deposit)
									});
									setOpen(true);
								},
								children: "Edit"
							}), /* @__PURE__ */ jsx(DropdownMenuItem, {
								className: "text-destructive",
								onClick: () => remove.mutate(t.id),
								children: "Delete"
							})]
						})] }) })
					]
				}, t.id);
			}) })] })]
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit tenant" : "Add tenant" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(TField, {
								label: "First name",
								value: form.first_name,
								onChange: (v) => setForm({
									...form,
									first_name: v
								})
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Last name",
								value: form.last_name,
								onChange: (v) => setForm({
									...form,
									last_name: v
								})
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Email",
								value: form.email,
								onChange: (v) => setForm({
									...form,
									email: v
								}),
								type: "email"
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Phone (+254…)",
								value: form.phone,
								onChange: (v) => setForm({
									...form,
									phone: v
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Property" }), /* @__PURE__ */ jsxs(Select, {
									value: form.property_id,
									onValueChange: (v) => setForm({
										...form,
										property_id: v,
										unit_id: ""
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select property" }) }), /* @__PURE__ */ jsx(SelectContent, { children: properties.map((p) => /* @__PURE__ */ jsx(SelectItem, {
										value: p.id,
										children: p.name
									}, p.id)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Unit" }), /* @__PURE__ */ jsxs(Select, {
									value: form.unit_id,
									onValueChange: (v) => {
										const unit = units.find((u) => u.id === v);
										setForm({
											...form,
											unit_id: v,
											monthly_rent: unit ? String(unit.monthly_rent) : form.monthly_rent
										});
									},
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select unit" }) }), /* @__PURE__ */ jsx(SelectContent, { children: unitOptions.map((u) => /* @__PURE__ */ jsx(SelectItem, {
										value: u.id,
										children: u.unit_number
									}, u.id)) })]
								})]
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Lease start",
								value: form.lease_start_date,
								onChange: (v) => setForm({
									...form,
									lease_start_date: v
								}),
								type: "date"
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Lease end",
								value: form.lease_end_date,
								onChange: (v) => setForm({
									...form,
									lease_end_date: v
								}),
								type: "date"
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Monthly rent (KES)",
								value: form.monthly_rent,
								onChange: (v) => setForm({
									...form,
									monthly_rent: v
								}),
								type: "number"
							}),
							/* @__PURE__ */ jsx(TField, {
								label: "Security deposit (KES)",
								value: form.security_deposit,
								onChange: (v) => setForm({
									...form,
									security_deposit: v
								}),
								type: "number"
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.first_name || !form.last_name || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Add tenant"
					})] })
				]
			})
		})
	] });
}
function TField({ label, value, onChange, type = "text" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), /* @__PURE__ */ jsx(Input, {
			type,
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
//#endregion
export { TenantsPage as component };
