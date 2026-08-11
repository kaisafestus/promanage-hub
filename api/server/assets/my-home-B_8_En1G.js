import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { t as useMyTenant } from "./tenant-CXuLukui.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/my-home.tsx?tsr-split=component
function MyHomePage() {
	const { data: tenant, isLoading } = useMyTenant();
	const { data: leases = [] } = useQuery({
		queryKey: ["my-leases"],
		queryFn: async () => {
			const { data, error } = await supabase.from("leases").select("*, units(unit_number), properties(name)").order("start_date", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	if (isLoading) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	if (!tenant) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, { title: "My lease & unit" }), /* @__PURE__ */ jsx("div", {
		className: "card-surface p-6 text-sm text-muted-foreground",
		children: "No tenancy linked to your account yet."
	})] });
	const unit = tenant.units;
	const property = tenant.properties;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "My lease & unit",
			subtitle: "Everything about your home and tenancy terms."
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-5",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-4 text-sm font-semibold",
					children: "Unit"
				}), /* @__PURE__ */ jsxs("dl", {
					className: "grid grid-cols-2 gap-y-3 text-sm",
					children: [
						/* @__PURE__ */ jsx(Row, {
							label: "Unit number",
							value: unit?.unit_number ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Floor",
							value: unit?.floor ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Bedrooms",
							value: String(unit?.bedrooms ?? "—")
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Bathrooms",
							value: String(unit?.bathrooms ?? "—")
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Size",
							value: unit?.size_sq_ft ? `${unit.size_sq_ft} sq ft` : "—"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "col-span-1",
							children: [/* @__PURE__ */ jsx("dt", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: "Status"
							}), /* @__PURE__ */ jsx("dd", {
								className: "mt-1",
								children: /* @__PURE__ */ jsx(StatusChip, { value: unit?.status ?? null })
							})]
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "card-surface p-5",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-4 text-sm font-semibold",
					children: "Property"
				}), /* @__PURE__ */ jsxs("dl", {
					className: "grid grid-cols-2 gap-y-3 text-sm",
					children: [
						/* @__PURE__ */ jsx(Row, {
							label: "Name",
							value: property?.name ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Address",
							value: property?.address_line1 ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "City",
							value: property?.city ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "County",
							value: property?.county ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "MPESA paybill",
							value: property?.mpesa_paybill ?? "—"
						}),
						/* @__PURE__ */ jsx(Row, {
							label: "Water rate",
							value: property?.water_rate ? kes(property.water_rate) : "—"
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-4 p-5",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "mb-4 text-sm font-semibold",
				children: "Tenancy terms"
			}), /* @__PURE__ */ jsxs("dl", {
				className: "grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(Row, {
						label: "Lease start",
						value: formatDate(tenant.lease_start_date)
					}),
					/* @__PURE__ */ jsx(Row, {
						label: "Lease end",
						value: formatDate(tenant.lease_end_date)
					}),
					/* @__PURE__ */ jsx(Row, {
						label: "Monthly rent",
						value: kes(tenant.monthly_rent)
					}),
					/* @__PURE__ */ jsx(Row, {
						label: "Security deposit",
						value: kes(tenant.security_deposit)
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "border-b border-border p-4 text-sm font-semibold",
				children: "Lease agreements"
			}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Start" }),
				/* @__PURE__ */ jsx(TableHead, { children: "End" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "Rent"
				}),
				/* @__PURE__ */ jsx(TableHead, { children: "Rent due day" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: leases.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 7,
				className: "py-10 text-center text-muted-foreground",
				children: "No lease documents recorded."
			}) }) : leases.map((l) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, { children: l.properties?.name ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: l.units?.unit_number ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(l.start_date) }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(l.end_date) }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: kes(l.monthly_rent)
					}),
					/* @__PURE__ */ jsxs(TableCell, { children: ["Day ", l.rent_due_day] }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: l.status }) })
				]
			}, l.id)) })] })]
		})
	] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
		className: "text-xs uppercase tracking-wide text-muted-foreground",
		children: label
	}), /* @__PURE__ */ jsx("dd", {
		className: "mt-1 font-medium text-foreground",
		children: value
	})] });
}
//#endregion
export { MyHomePage as component };
