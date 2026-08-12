import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Receipt, Wrench } from "lucide-react";
//#region src/routes/_authenticated/vendor-dashboard.tsx?tsr-split=component
function VendorDashboard() {
	const { data: session } = useSession();
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
	const { data: stats } = useQuery({
		queryKey: ["vendor-stats"],
		queryFn: async () => {
			if (!vendor?.id) return {
				open: 0,
				inProgress: 0,
				completed: 0,
				revenue: 0
			};
			const [openResult, inProgressResult, completedResult, paymentsResult] = await Promise.all([
				supabase.from("maintenance_requests").select("id", {
					count: "exact",
					head: true
				}).eq("vendor_id", vendor.id).eq("status", "OPEN"),
				supabase.from("maintenance_requests").select("id", {
					count: "exact",
					head: true
				}).eq("vendor_id", vendor.id).eq("status", "IN_PROGRESS"),
				supabase.from("maintenance_requests").select("id", {
					count: "exact",
					head: true
				}).eq("vendor_id", vendor.id).eq("status", "COMPLETED"),
				supabase.from("expenses").select("amount").eq("vendor_id", vendor.id)
			]);
			const revenue = (paymentsResult.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
			return {
				open: openResult.count ?? 0,
				inProgress: inProgressResult.count ?? 0,
				completed: completedResult.count ?? 0,
				revenue
			};
		},
		enabled: !!vendor?.id
	});
	const { data: assigned = [] } = useQuery({
		queryKey: ["vendor-assigned"],
		queryFn: async () => {
			if (!vendor?.id) return [];
			const { data, error } = await supabase.from("maintenance_requests").select("*, properties(name), units(unit_number), tenants(first_name, last_name)").eq("vendor_id", vendor.id).order("created_at", { ascending: false }).limit(10);
			if (error) throw error;
			return data;
		},
		enabled: !!vendor?.id
	});
	const { data: recentExpenses = [] } = useQuery({
		queryKey: ["vendor-expenses"],
		queryFn: async () => {
			if (!vendor?.id) return [];
			const { data, error } = await supabase.from("expenses").select("*, properties(name)").eq("vendor_id", vendor.id).order("date", { ascending: false }).limit(5);
			if (error) throw error;
			return data;
		},
		enabled: !!vendor?.id
	});
	const s = stats ?? {
		open: 0,
		inProgress: 0,
		completed: 0,
		revenue: 0
	};
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
						children: "Vendor portal"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 max-w-2xl text-3xl font-bold leading-tight",
						children: "Welcome to PropertyMS"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-xl text-sm text-navy-foreground/70",
						children: "Track your assigned maintenance jobs, expenses and payments."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						icon: Wrench,
						label: "Open jobs",
						value: String(s.open),
						hint: "Awaiting action"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: Clock,
						label: "In progress",
						value: String(s.inProgress),
						hint: "Currently working"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: CheckCircle2,
						label: "Completed",
						value: String(s.completed),
						hint: "Jobs done"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						icon: Receipt,
						label: "Expenses",
						value: kes(s.revenue),
						hint: "Total logged"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-b border-border p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-semibold",
							children: "Assigned maintenance"
						}), /* @__PURE__ */ jsx(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/vendor-maintenance",
								children: "View all"
							})
						})]
					}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Summary" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Priority" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Raised" })
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: assigned.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 5,
						className: "py-8 text-center text-muted-foreground text-sm",
						children: "No assignments yet."
					}) }) : assigned.map((r) => /* @__PURE__ */ jsxs(TableRow, {
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
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-b border-border p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-sm font-semibold",
							children: "Recent expenses"
						}), /* @__PURE__ */ jsx(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/vendor-expenses",
								children: "View all"
							})
						})]
					}), /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
						/* @__PURE__ */ jsx(TableHead, { children: "Description" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Property" }),
						/* @__PURE__ */ jsx(TableHead, { children: "Category" }),
						/* @__PURE__ */ jsx(TableHead, {
							className: "text-right",
							children: "Amount"
						}),
						/* @__PURE__ */ jsx(TableHead, { children: "Date" })
					] }) }), /* @__PURE__ */ jsx(TableBody, { children: recentExpenses.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
						colSpan: 5,
						className: "py-8 text-center text-muted-foreground text-sm",
						children: "No expenses logged."
					}) }) : recentExpenses.map((e) => /* @__PURE__ */ jsxs(TableRow, {
						className: "odd:bg-muted/30",
						children: [
							/* @__PURE__ */ jsx(TableCell, {
								className: "font-medium text-sm",
								children: e.description
							}),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-sm",
								children: e.properties?.name ?? "—"
							}),
							/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: e.category }) }),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-right",
								children: kes(e.amount)
							}),
							/* @__PURE__ */ jsx(TableCell, {
								className: "text-sm",
								children: formatDate(e.date)
							})
						]
					}, e.id)) })] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-6",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "text-base font-semibold",
						children: "Completion rate"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: s.completed + s.inProgress + s.open > 0 ? `${(s.completed / (s.completed + s.inProgress + s.open) * 100).toFixed(1)}% of assigned jobs completed` : "No jobs assigned yet"
					}),
					/* @__PURE__ */ jsx(Progress, {
						value: s.completed + s.inProgress + s.open > 0 ? s.completed / (s.completed + s.inProgress + s.open) * 100 : 0,
						className: "mt-4"
					})
				]
			})
		]
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
//#endregion
export { VendorDashboard as component };
