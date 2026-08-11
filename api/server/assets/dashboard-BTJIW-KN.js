import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { a as shortId, n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, Building2, Users, Wrench } from "lucide-react";
//#region src/routes/_authenticated/dashboard.tsx?tsr-split=component
function useDashboard() {
	return useQuery({
		queryKey: ["dashboard"],
		queryFn: async () => {
			const [properties, units, tenants, maintenance, invoices, payments] = await Promise.all([
				supabase.from("properties").select("id"),
				supabase.from("units").select("id, vacant"),
				supabase.from("tenants").select("id"),
				supabase.from("maintenance_requests").select("id, status"),
				supabase.from("invoices").select("id, total_amount, status"),
				supabase.from("payments").select("amount, status")
			]);
			const unitRows = units.data ?? [];
			const occupied = unitRows.filter((u) => !u.vacant).length;
			const invoiced = (invoices.data ?? []).reduce((s, i) => s + Number(i.total_amount), 0);
			const collected = (payments.data ?? []).filter((p) => p.status === "PAID" || p.status === "CONFIRMED").reduce((s, p) => s + Number(p.amount), 0);
			return {
				properties: properties.data?.length ?? 0,
				units: unitRows.length,
				occupied,
				vacant: unitRows.length - occupied,
				occupancyRate: unitRows.length ? occupied / unitRows.length * 100 : 0,
				tenants: tenants.data?.length ?? 0,
				openMaintenance: (maintenance.data ?? []).filter((m) => m.status === "OPEN" || m.status === "ASSIGNED").length,
				revenue: collected,
				outstanding: Math.max(invoiced - collected, 0),
				collectionRate: invoiced ? collected / invoiced * 100 : 0
			};
		}
	});
}
function StatCard({ icon: Icon, label, value, hint }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "card-surface p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
					children: label
				}), /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-primary" })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 text-2xl font-bold tracking-tight",
				children: value
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function DashboardPage() {
	const { data: session } = useSession();
	const { data: d } = useDashboard();
	const s = d ?? {
		properties: 0,
		units: 0,
		occupied: 0,
		vacant: 0,
		occupancyRate: 0,
		tenants: 0,
		openMaintenance: 0,
		revenue: 0,
		outstanding: 0,
		collectionRate: 0
	};
	const { data: recentInvoices = [] } = useQuery({
		queryKey: ["dashboard-recent-invoices"],
		queryFn: async () => {
			const { data, error } = await supabase.from("invoices").select("id, invoice_number, total_amount, status, due_date, tenants(first_name, last_name)").order("issue_date", { ascending: false }).limit(5);
			if (error) throw error;
			return data;
		}
	});
	const { data: recentMaintenance = [] } = useQuery({
		queryKey: ["dashboard-recent-maintenance"],
		queryFn: async () => {
			const { data, error } = await supabase.from("maintenance_requests").select("id, title, status, priority, created_at, properties(name), units(unit_number)").order("created_at", { ascending: false }).limit(5);
			if (error) throw error;
			return data;
		}
	});
	const { data: expiringLeases = [] } = useQuery({
		queryKey: ["dashboard-expiring-leases"],
		queryFn: async () => {
			const thirtyDaysFromNow = /* @__PURE__ */ new Date();
			thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
			const { data, error } = await supabase.from("leases").select("id, end_date, status, tenants(first_name, last_name), properties(name), units(unit_number)").lte("end_date", thirtyDaysFromNow.toISOString().slice(0, 10)).neq("status", "TERMINATED").order("end_date", { ascending: true }).limit(5);
			if (error) throw error;
			return data;
		}
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-xl p-8 text-navy-foreground",
				style: {
					background: "var(--gradient-navy)",
					boxShadow: "var(--shadow-lift)"
				},
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-active",
						children: "Landlord dashboard"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 max-w-2xl text-3xl font-bold leading-tight",
						children: "Stay on top of your portfolio"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-xl text-sm text-navy-foreground/70",
						children: "Occupancy, rent collection and maintenance across every property you manage."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex flex-wrap gap-3",
						children: [
							/* @__PURE__ */ jsx(Button, {
								asChild: true,
								children: /* @__PURE__ */ jsx(Link, {
									to: "/properties",
									children: "New property"
								})
							}),
							/* @__PURE__ */ jsx(Button, {
								asChild: true,
								variant: "secondary",
								children: /* @__PURE__ */ jsx(Link, {
									to: "/maintenance",
									children: "Review maintenance"
								})
							}),
							/* @__PURE__ */ jsx(Button, {
								asChild: true,
								variant: "secondary",
								children: /* @__PURE__ */ jsx(Link, {
									to: "/invitations",
									children: "Invite tenant"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						icon: Building2,
						label: "Properties",
						value: String(s.properties),
						hint: `${s.units} units total`
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: Users,
						label: "Tenants",
						value: String(s.tenants),
						hint: `${(100 - s.occupancyRate).toFixed(1)}% vacancy rate`
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: Banknote,
						label: "Revenue",
						value: kes(s.revenue),
						hint: `${s.collectionRate.toFixed(1)}% collection rate`
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: Wrench,
						label: "Open maintenance",
						value: String(s.openMaintenance),
						hint: `${kes(s.outstanding)} outstanding`
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface p-6 lg:col-span-2",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-base font-semibold",
							children: "Occupancy overview"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								s.occupied,
								" occupied · ",
								s.vacant,
								" vacant"
							]
						}),
						/* @__PURE__ */ jsx(Progress, {
							value: s.occupancyRate,
							className: "mt-4"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-5 grid grid-cols-3 gap-4 text-sm",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-xs text-muted-foreground",
									children: "Occupied"
								}), /* @__PURE__ */ jsx("div", {
									className: "font-semibold",
									children: s.occupied
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-xs text-muted-foreground",
									children: "Vacant"
								}), /* @__PURE__ */ jsx("div", {
									className: "font-semibold",
									children: s.vacant
								})] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "text-xs text-muted-foreground",
									children: "Collection rate"
								}), /* @__PURE__ */ jsxs("div", {
									className: "font-semibold",
									children: [s.collectionRate.toFixed(1), "%"]
								})] })
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-base font-semibold",
						children: "Quick actions"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-4 space-y-2",
						children: [
							{
								label: "View properties",
								to: "/properties"
							},
							{
								label: "Manage tenants",
								to: "/tenants"
							},
							{
								label: "Open invoices",
								to: "/invoices"
							},
							{
								label: "Handle maintenance",
								to: "/maintenance"
							},
							{
								label: "Send invitations",
								to: "/invitations"
							}
						].map((a) => /* @__PURE__ */ jsxs(Link, {
							to: a.to,
							className: "flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent",
							children: [a.label, /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-muted-foreground" })]
						}, a.to))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-6",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-base font-semibold",
					children: "Financial snapshot"
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg bg-success/10 p-4 text-success",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-semibold uppercase tracking-wide opacity-80",
								children: "Rent collected"
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-2 text-lg font-bold",
								children: kes(s.revenue)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg bg-warning/15 p-4 text-warning",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-semibold uppercase tracking-wide opacity-80",
								children: "Outstanding"
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-2 text-lg font-bold",
								children: kes(s.outstanding)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg bg-primary/10 p-4 text-primary",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-semibold uppercase tracking-wide opacity-80",
								children: "Collection rate"
							}), /* @__PURE__ */ jsxs("div", {
								className: "mt-2 text-lg font-bold",
								children: [s.collectionRate.toFixed(1), "%"]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg bg-destructive/10 p-4 text-destructive",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-semibold uppercase tracking-wide opacity-80",
								children: "Open maintenance"
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-2 text-lg font-bold",
								children: String(s.openMaintenance)
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-b border-border p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-semibold",
							children: "Recent invoices"
						}), /* @__PURE__ */ jsx(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/invoices",
								children: "View all"
							})
						})]
					}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Invoice" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Amount"
						}),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Due" })
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: recentInvoices.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 5,
						className: "py-8 text-center text-muted-foreground text-sm",
						children: "No invoices yet."
					}) }) : recentInvoices.map((i) => /* @__PURE__ */ jsxs(TableRow, {
						className: "odd:bg-muted/30",
						children: [
							/* @__PURE__ */ jsx(TableCell, {
								className: "font-medium",
								children: shortId(i.id)
							}),
							/* @__PURE__ */ jsx(TableCell, { children: [i.tenants?.first_name, i.tenants?.last_name].filter(Boolean).join(" ") || "—" }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-right",
								children: kes(i.total_amount)
							}),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: i.status }) }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-sm",
								children: formatDate(i.due_date)
							})
						]
					}, i.id)) })] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-b border-border p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-semibold",
							children: "Recent maintenance"
						}), /* @__PURE__ */ jsx(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/maintenance",
								children: "View all"
							})
						})]
					}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Summary" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Priority" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Raised" })
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: recentMaintenance.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 5,
						className: "py-8 text-center text-muted-foreground text-sm",
						children: "No maintenance requests."
					}) }) : recentMaintenance.map((r) => /* @__PURE__ */ jsxs(TableRow, {
						className: "odd:bg-muted/30",
						children: [
							/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("div", {
								className: "font-medium text-sm",
								children: r.title
							}), /* @__PURE__ */ jsx("div", {
								className: "text-xs text-muted-foreground",
								children: r.units?.unit_number ?? "—"
							})] }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-sm",
								children: r.properties?.name ?? "—"
							}),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.priority }) }),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: r.status }) }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-sm",
								children: formatDate(r.created_at)
							})
						]
					}, r.id)) })] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card-surface",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-border p-4 flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-sm font-semibold",
						children: "Upcoming lease expirations"
					}), /* @__PURE__ */ jsx(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/tenants",
							children: "View tenants"
						})
					})]
				}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
					/* @__PURE__ */ jsx(TableHead, { children: "Tenant" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Unit" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Lease end" }),
					/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
					/* @__PURE__ */ jsx(TableHead, {
						className: "text-right",
						children: "Monthly rent"
					})
				] }) }), /* @__PURE__ */ jsx(TableBody, { children: expiringLeases.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
					colSpan: 6,
					className: "py-8 text-center text-muted-foreground text-sm",
					children: "No leases expiring in the next 30 days."
				}) }) : expiringLeases.map((l) => /* @__PURE__ */ jsxs(TableRow, {
					className: "odd:bg-muted/30",
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "font-medium",
							children: [l.tenants?.first_name, l.tenants?.last_name].filter(Boolean).join(" ") || "—"
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: l.properties?.name ?? "—"
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: l.units?.unit_number ?? "—"
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-sm",
							children: formatDate(l.end_date)
						}),
						/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: l.status }) }),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right",
							children: kes(l.monthly_rent)
						})
					]
				}, l.id)) })] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-6",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "text-base font-semibold",
					children: "Landlord priorities"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						{
							label: "Occupancy rate",
							value: `${s.occupancyRate.toFixed(1)}%`,
							tone: "bg-success/10 text-success"
						},
						{
							label: "Rent collected",
							value: kes(s.revenue),
							tone: "bg-primary/10 text-primary"
						},
						{
							label: "Outstanding balance",
							value: kes(s.outstanding),
							tone: "bg-warning/15 text-warning"
						},
						{
							label: "Open maintenance",
							value: String(s.openMaintenance),
							tone: "bg-destructive/10 text-destructive"
						}
					].map((m) => /* @__PURE__ */ jsxs("div", {
						className: `rounded-lg p-4 ${m.tone}`,
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs font-semibold uppercase tracking-wide opacity-80",
							children: m.label
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-2 text-lg font-bold",
							children: m.value
						})]
					}, m.label))
				})]
			})
		]
	});
}
//#endregion
export { DashboardPage as component };
