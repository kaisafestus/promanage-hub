import { t as supabase } from "./client-BYCWxCl7.js";
import { n as formatDate, r as kes } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { t as useMyTenant } from "./tenant-CXuLukui.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarClock, Home, Receipt, Wrench } from "lucide-react";
//#region src/routes/_authenticated/tenant-dashboard.tsx?tsr-split=component
function TenantDashboard() {
	const { data: tenant, isLoading } = useMyTenant();
	const { data: invoices = [] } = useQuery({
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
	const { data: requests = [] } = useQuery({
		queryKey: ["my-maintenance"],
		queryFn: async () => {
			const { data, error } = await supabase.from("maintenance_requests").select("*, units(unit_number)").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: notifications = [] } = useQuery({
		queryKey: ["my-notifications"],
		queryFn: async () => {
			const { data: userData } = await supabase.auth.getUser();
			const uid = userData.user?.id;
			if (!uid) return [];
			const { data, error } = await supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(5);
			if (error) throw error;
			return data;
		}
	});
	const balance = invoices.reduce((s, i) => s + Number(i.total_amount), 0) - payments.filter((p) => p.status === "PAID" || p.status === "CONFIRMED").reduce((s, p) => s + Number(p.amount), 0);
	const nextDue = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
	const openRequests = requests.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED");
	if (isLoading) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading your home…"
	});
	if (!tenant) return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(PageHeader, {
		title: "Welcome",
		subtitle: "Your tenant profile is not linked yet."
	}), /* @__PURE__ */ jsx("div", {
		className: "card-surface p-6 text-sm text-muted-foreground",
		children: "Your landlord has not linked your account to a tenancy yet. Once they do, your unit, invoices and maintenance requests will appear here."
	})] });
	const unit = tenant.units;
	const property = tenant.properties;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ jsx(PageHeader, {
				title: `Karibu, ${tenant.first_name}`,
				subtitle: "Your tenancy at a glance.",
				actions: /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ jsx(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/my-maintenance",
							children: "Request repair"
						})
					}), /* @__PURE__ */ jsx(Button, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Link, {
							to: "/my-invoices",
							children: "Pay rent"
						})
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						icon: Home,
						label: "Your unit",
						value: unit?.unit_number ?? "—",
						hint: property?.name ?? ""
					}),
					/* @__PURE__ */ jsx(Stat, {
						icon: Receipt,
						label: "Outstanding balance",
						value: kes(balance),
						hint: balance > 0 ? "Payment due" : "All settled",
						tone: balance > 0 ? "bad" : "good"
					}),
					/* @__PURE__ */ jsx(Stat, {
						icon: CalendarClock,
						label: "Next due date",
						value: nextDue ? formatDate(nextDue.due_date) : "—",
						hint: nextDue ? kes(nextDue.total_amount) : "No open invoices"
					}),
					/* @__PURE__ */ jsx(Stat, {
						icon: Wrench,
						label: "Open requests",
						value: String(openRequests.length),
						hint: "Maintenance"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5 lg:col-span-2",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "mb-3 text-sm font-semibold",
						children: "Recent invoices"
					}), invoices.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "No invoices yet."
					}) : /* @__PURE__ */ jsx("ul", {
						className: "divide-y divide-border",
						children: invoices.slice(0, 5).map((i) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-center justify-between py-2.5 text-sm",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "font-medium",
								children: i.invoice_number
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-muted-foreground",
								children: ["Due ", formatDate(i.due_date)]
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", { children: kes(i.total_amount) }), /* @__PURE__ */ jsx(StatusChip, { value: i.status })]
							})]
						}, i.id))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "mb-3 text-sm font-semibold",
						children: "Maintenance activity"
					}), requests.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "No requests raised."
					}) : /* @__PURE__ */ jsx("ul", {
						className: "divide-y divide-border",
						children: requests.slice(0, 5).map((r) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-center justify-between py-2.5 text-sm",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "font-medium",
								children: r.title
							}), /* @__PURE__ */ jsx("div", {
								className: "text-xs text-muted-foreground",
								children: formatDate(r.created_at)
							})] }), /* @__PURE__ */ jsx(StatusChip, { value: r.status })]
						}, r.id))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "mb-3 text-sm font-semibold",
						children: "Payment history"
					}), payments.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "No payments recorded yet."
					}) : /* @__PURE__ */ jsx("ul", {
						className: "divide-y divide-border",
						children: payments.slice(0, 5).map((p) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-center justify-between py-2.5 text-sm",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "font-medium",
								children: formatDate(p.paid_at)
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-muted-foreground",
								children: [
									p.method.replace(/_/g, " "),
									" ",
									p.reference ? `· ${p.reference}` : ""
								]
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: p.status === "PENDING" ? "text-warning" : "text-success",
									children: kes(p.amount)
								}), /* @__PURE__ */ jsx(StatusChip, { value: p.status })]
							})]
						}, p.id))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "mb-3 text-sm font-semibold",
						children: "Notifications"
					}), notifications.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "No notifications yet."
					}) : /* @__PURE__ */ jsx("ul", {
						className: "divide-y divide-border",
						children: notifications.map((n) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-start justify-between py-2.5 text-sm",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ jsx(Bell, { className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: `font-medium ${n.is_read ? "" : "text-foreground"}`,
									children: n.title
								}), /* @__PURE__ */ jsx("div", {
									className: "text-xs text-muted-foreground line-clamp-1",
									children: n.message
								})] })]
							}), /* @__PURE__ */ jsx("div", {
								className: "text-xs text-muted-foreground",
								children: formatDate(n.created_at)
							})]
						}, n.id))
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-5",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "mb-3 text-sm font-semibold",
					children: "Lease summary"
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: "Lease start"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-1 font-medium text-sm",
							children: formatDate(tenant.lease_start_date)
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: "Lease end"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-1 font-medium text-sm",
							children: formatDate(tenant.lease_end_date)
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: "Monthly rent"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-1 font-medium text-sm",
							children: kes(tenant.monthly_rent)
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: "Security deposit"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-1 font-medium text-sm",
							children: kes(tenant.security_deposit)
						})] })
					]
				})]
			})
		]
	});
}
function Stat({ icon: Icon, label, value, hint, tone }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "card-surface p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
					children: label
				}), /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-primary" })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: `mt-2 text-2xl font-bold ${tone === "bad" ? "text-destructive" : tone === "good" ? "text-success" : "text-foreground"}`,
				children: value
			}),
			hint ? /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
//#endregion
export { TenantDashboard as component };
