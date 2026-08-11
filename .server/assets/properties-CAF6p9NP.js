import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { r as kes } from "./format-Dg8MMhg6.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Search } from "lucide-react";
//#region src/routes/_authenticated/properties.tsx?tsr-split=component
var EMPTY = {
	name: "",
	code: "",
	description: "",
	address_line1: "",
	city: "",
	county: "",
	postal_code: "",
	mpesa_paybill: "",
	water_rate: ""
};
function PropertiesPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(0);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({ ...EMPTY });
	const { data: properties = [], isLoading } = useQuery({
		queryKey: ["properties"],
		queryFn: async () => {
			const { data, error } = await supabase.from("properties").select("*, units(id, vacant)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const save = useMutation({
		mutationFn: async () => {
			const payload = {
				name: form.name.trim(),
				code: form.code.trim(),
				description: form.description.trim() || null,
				address_line1: form.address_line1.trim(),
				city: form.city.trim(),
				county: form.county.trim(),
				postal_code: form.postal_code.trim() || null,
				mpesa_paybill: form.mpesa_paybill.trim() || null,
				water_rate: form.water_rate ? Number(form.water_rate) : null
			};
			if (editing) {
				const { error } = await supabase.from("properties").update(payload).eq("id", editing);
				if (error) throw error;
			} else {
				const orgId = session?.profile?.org_id;
				if (!orgId) throw new Error("No organization found for your account.");
				const { error } = await supabase.from("properties").insert({
					...payload,
					org_id: orgId
				});
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success(editing ? "Property updated" : "Property created");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
		onError: (e) => toast.error(e.message.includes("duplicate") ? "That property code already exists." : e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("properties").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Property deleted");
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const filtered = useMemo(() => properties.filter((p) => `${p.name} ${p.code} ${p.city}`.toLowerCase().includes(search.toLowerCase())), [properties, search]);
	const pageRows = filtered.slice(page * 10, page * 10 + 10);
	const totalUnits = properties.reduce((s, p) => s + (p.units?.length ?? 0), 0);
	const totalVacancies = properties.reduce((s, p) => s + (p.units?.filter((u) => u.vacant).length ?? 0), 0);
	function openCreate() {
		setEditing(null);
		setForm({ ...EMPTY });
		setOpen(true);
	}
	function openEdit(p) {
		setEditing(p.id);
		setForm({
			name: p.name,
			code: p.code,
			description: p.description ?? "",
			address_line1: p.address_line1,
			city: p.city,
			county: p.county,
			postal_code: p.postal_code ?? "",
			mpesa_paybill: p.mpesa_paybill ?? "",
			water_rate: p.water_rate ? String(p.water_rate) : ""
		});
		setOpen(true);
	}
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Properties",
			subtitle: "Every building in your portfolio, with units and vacancies.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: openCreate,
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Add property"]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface mb-4 grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0",
			children: [
				{
					label: "Total properties",
					value: properties.length
				},
				{
					label: "Total units",
					value: totalUnits
				},
				{
					label: "Total vacancies",
					value: totalVacancies
				}
			].map((m) => /* @__PURE__ */ jsxs("div", {
				className: "p-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
					children: m.label
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-1 text-2xl font-bold",
					children: m.value
				})]
			}, m.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between gap-3 border-b border-border p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-60",
						children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
							className: "pl-8",
							placeholder: "Search properties",
							value: search,
							onChange: (e) => {
								setSearch(e.target.value);
								setPage(0);
							}
						})]
					})
				}),
				/* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
					/* @__PURE__ */ jsx(TableHead, { children: "Property name" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Units" }),
					/* @__PURE__ */ jsx(TableHead, { children: "City" }),
					/* @__PURE__ */ jsx(TableHead, { children: "County" }),
					/* @__PURE__ */ jsx(TableHead, { children: "MPESA paybill" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "text-right",
						children: "Water rate"
					}),
					/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
				] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-muted-foreground",
					children: "Loading…"
				}) }) : pageRows.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
					colSpan: 7,
					className: "py-10 text-center text-muted-foreground",
					children: "No properties yet."
				}) }) : pageRows.map((p) => /* @__PURE__ */ jsxs(TableRow, {
					className: "odd:bg-muted/30",
					children: [
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("div", {
							className: "font-medium",
							children: p.name
						}), /* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: p.code
						})] }),
						/* @__PURE__ */ jsx(TableCell, { children: p.units?.length ?? 0 }),
						/* @__PURE__ */ jsx(TableCell, { children: p.city || "—" }),
						/* @__PURE__ */ jsx(TableCell, { children: p.county || "—" }),
						/* @__PURE__ */ jsx(TableCell, { children: p.mpesa_paybill || "—" }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: p.water_rate ? kes(p.water_rate) : "—"
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
								onClick: () => openEdit(p),
								children: "Edit"
							}), /* @__PURE__ */ jsx(DropdownMenuItem, {
								className: "text-destructive",
								onClick: () => remove.mutate(p.id),
								children: "Delete"
							})]
						})] }) })
					]
				}, p.id)) })] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-t border-border p-3 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ jsxs("span", { children: [
						"Page ",
						page + 1,
						" of ",
						Math.max(1, Math.ceil(filtered.length / 10))
					] }), /* @__PURE__ */ jsxs("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ jsx(Button, {
							variant: "outline",
							size: "sm",
							disabled: page === 0,
							onClick: () => setPage((p) => p - 1),
							children: "Previous"
						}), /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							size: "sm",
							disabled: (page + 1) * 10 >= filtered.length,
							onClick: () => setPage((p) => p + 1),
							children: "Next"
						})]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-lg",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit property" : "Add property" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Name",
								value: form.name,
								onChange: (v) => setForm({
									...form,
									name: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Code",
								value: form.code,
								onChange: (v) => setForm({
									...form,
									code: v
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2 space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Description" }), /* @__PURE__ */ jsx(Textarea, {
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Address",
								value: form.address_line1,
								onChange: (v) => setForm({
									...form,
									address_line1: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "City",
								value: form.city,
								onChange: (v) => setForm({
									...form,
									city: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "County",
								value: form.county,
								onChange: (v) => setForm({
									...form,
									county: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Postal code",
								value: form.postal_code,
								onChange: (v) => setForm({
									...form,
									postal_code: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "MPESA paybill",
								value: form.mpesa_paybill,
								onChange: (v) => setForm({
									...form,
									mpesa_paybill: v
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Water rate (KES)",
								value: form.water_rate,
								onChange: (v) => setForm({
									...form,
									water_rate: v
								})
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.name || !form.code || save.isPending,
						onClick: () => save.mutate(),
						children: editing ? "Save changes" : "Create property"
					})] })
				]
			})
		})
	] });
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, { children: label }), /* @__PURE__ */ jsx(Input, {
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
//#endregion
export { PropertiesPage as component };
