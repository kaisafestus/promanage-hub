import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { t as Checkbox } from "./checkbox-kt6FvQcE.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
//#region src/routes/_authenticated/units.tsx?tsr-split=component
var STATUSES = [
	"AVAILABLE",
	"UNDER_APPLICATION",
	"RESERVED",
	"OCCUPIED",
	"NOTICE",
	"MAINTENANCE"
];
var EMPTY = {
	property_id: "",
	unit_number: "",
	floor: "",
	bedrooms: "1",
	bathrooms: "1",
	size_sq_ft: "",
	monthly_rent: "",
	security_deposit: "",
	vacant: true,
	status: "AVAILABLE"
};
function UnitsPage() {
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
	const { data: units = [], isLoading } = useQuery({
		queryKey: ["units"],
		queryFn: async () => {
			const { data, error } = await supabase.from("units").select("*, properties(id, name)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const payload = {
				property_id: form.property_id,
				unit_number: form.unit_number.trim(),
				floor: form.floor.trim() || null,
				bedrooms: Number(form.bedrooms || 0),
				bathrooms: Number(form.bathrooms || 0),
				size_sq_ft: form.size_sq_ft ? Number(form.size_sq_ft) : null,
				monthly_rent: Number(form.monthly_rent || 0),
				security_deposit: Number(form.security_deposit || 0),
				vacant: form.vacant,
				status: form.status
			};
			if (editing) {
				const { error } = await supabase.from("units").update(payload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found for your account.");
				const { error } = await supabase.from("units").insert({
					...payload,
					org_id: orgId
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Unit updated" : "Unit created");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["units"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("units").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Unit deleted");
			queryClient.invalidateQueries({ queryKey: ["units"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = useMemo(() => units.filter((u) => `${u.unit_number} ${u.properties?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())), [units, search]);
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Units",
			subtitle: "Rent, deposits and occupancy for every unit in your portfolio.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => {
					setEditing(null);
					setForm({ ...EMPTY });
					setOpen(true);
				},
				disabled: properties.length === 0,
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Add unit"]
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
						placeholder: "Search units",
						value: search,
						onChange: (e) => setSearch(e.target.value)
					})]
				})
			}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Beds" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Baths" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Size" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Monthly rent"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Deposit"
				}),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 9,
				className: "py-10 text-center text-muted-foreground",
				children: properties.length === 0 ? "Add a property first, then create its units." : "No units yet."
			}) }) : filtered.map((u) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, {
						className: "font-medium",
						children: u.unit_number
					}),
					/* @__PURE__ */ jsx(TableCell, { children: u.properties?.name ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: u.bedrooms }),
					/* @__PURE__ */ jsx(TableCell, { children: u.bathrooms }),
					/* @__PURE__ */ jsx(TableCell, { children: u.size_sq_ft ? `${u.size_sq_ft} sq ft` : "—" }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: kes(u.monthly_rent)
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: kes(u.security_deposit)
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: u.status }) }),
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
								setEditing(u.id);
								setForm({
									property_id: u.property_id,
									unit_number: u.unit_number,
									floor: u.floor ?? "",
									bedrooms: String(u.bedrooms),
									bathrooms: String(u.bathrooms),
									size_sq_ft: u.size_sq_ft ? String(u.size_sq_ft) : "",
									monthly_rent: String(u.monthly_rent),
									security_deposit: String(u.security_deposit),
									vacant: u.vacant,
									status: u.status
								});
								setOpen(true);
							},
							children: "Edit"
						}), /* @__PURE__ */ jsx(DropdownMenuItem, {
							className: "text-destructive",
							onClick: () => remove.mutate(u.id),
							children: "Delete"
						})]
					})] }) })
				]
			}, u.id)) })] })]
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit unit" : "Add unit" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Property" }), /* @__PURE__ */ jsxs(Select, {
									value: form.property_id,
									onValueChange: (v) => setForm({
										...form,
										property_id: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select property" }) }), /* @__PURE__ */ jsx(SelectContent, { children: properties.map((p) => /* @__PURE__ */ jsx(SelectItem, {
										value: p.id,
										children: p.name
									}, p.id)) })]
								})]
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Unit number",
								value: form.unit_number,
								onChange: (v) => setForm({
									...form,
									unit_number: v
								}),
								type: "text"
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Floor",
								value: form.floor,
								onChange: (v) => setForm({
									...form,
									floor: v
								}),
								type: "text"
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Bedrooms",
								value: form.bedrooms,
								onChange: (v) => setForm({
									...form,
									bedrooms: v
								})
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Bathrooms",
								value: form.bathrooms,
								onChange: (v) => setForm({
									...form,
									bathrooms: v
								})
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Size (sq ft)",
								value: form.size_sq_ft,
								onChange: (v) => setForm({
									...form,
									size_sq_ft: v
								})
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Monthly rent (KES)",
								value: form.monthly_rent,
								onChange: (v) => setForm({
									...form,
									monthly_rent: v
								})
							}),
							/* @__PURE__ */ jsx(NumField, {
								label: "Security deposit (KES)",
								value: form.security_deposit,
								onChange: (v) => setForm({
									...form,
									security_deposit: v
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Status" }), /* @__PURE__ */ jsxs(Select, {
									value: form.status,
									onValueChange: (v) => setForm({
										...form,
										status: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: STATUSES.map((s) => /* @__PURE__ */ jsx(SelectItem, {
										value: s,
										children: s.replace(/_/g, " ")
									}, s)) })]
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "flex items-center gap-2 pt-6 text-sm",
								children: [/* @__PURE__ */ jsx(Checkbox, {
									checked: form.vacant,
									onCheckedChange: (c) => setForm({
										...form,
										vacant: Boolean(c)
									})
								}), "Vacant"]
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.property_id || !form.unit_number || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Create unit"
					})] })
				]
			})
		})
	] });
}
function NumField({ label, value, onChange, type = "number" }) {
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
export { UnitsPage as component };
