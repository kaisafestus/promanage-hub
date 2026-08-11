import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession, t as roleHome } from "./session-CZ3bZTox.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import * as React from "react";
import { useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQueryClient } from "@tanstack/react-query";
import { Banknote, Bell, Building, Building2, ChevronDown, ChevronRight, DoorOpen, FileText, LayoutDashboard, Loader2, Mail, Menu, Receipt, Settings, ShieldAlert, Users, Wrench, X } from "lucide-react";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
//#region src/components/pms/Sidebar.tsx
var MAIN = [{
	label: "Dashboard",
	to: "/dashboard",
	icon: LayoutDashboard
}];
var TENANT_MAIN = [{
	label: "My home",
	to: "/tenant-dashboard",
	icon: LayoutDashboard
}];
var VENDOR_MAIN = [{
	label: "Dashboard",
	to: "/vendor-dashboard",
	icon: LayoutDashboard
}];
var TENANT_SECTIONS = [{
	label: "My tenancy",
	items: [
		{
			label: "Lease & unit",
			to: "/my-home",
			icon: DoorOpen
		},
		{
			label: "Invoices & payments",
			to: "/my-invoices",
			icon: Receipt
		},
		{
			label: "Maintenance",
			to: "/my-maintenance",
			icon: Wrench
		},
		{
			label: "Documents",
			to: "/my-documents",
			icon: FileText
		}
	]
}, {
	label: "Settings",
	items: [{
		label: "General",
		to: "/settings",
		icon: Settings
	}]
}];
var VENDOR_SECTIONS = [{
	label: "Work",
	items: [
		{
			label: "Maintenance",
			to: "/vendor-maintenance",
			icon: Wrench
		},
		{
			label: "Expenses",
			to: "/vendor-expenses",
			icon: Receipt
		},
		{
			label: "Documents",
			to: "/vendor-documents",
			icon: FileText
		}
	]
}, {
	label: "Settings",
	items: [{
		label: "General",
		to: "/settings",
		icon: Settings
	}]
}];
var SECTIONS = [
	{
		label: "Financials",
		items: [{
			label: "Invoices",
			to: "/invoices",
			icon: Receipt
		}, {
			label: "Payments",
			to: "/payments",
			icon: Banknote
		}]
	},
	{
		label: "Property / Unit",
		items: [
			{
				label: "Properties",
				to: "/properties",
				icon: Building2
			},
			{
				label: "Units",
				to: "/units",
				icon: DoorOpen
			},
			{
				label: "Maintenance",
				to: "/maintenance",
				icon: Wrench
			}
		]
	},
	{
		label: "People",
		items: [{
			label: "Tenants",
			to: "/tenants",
			icon: Users
		}, {
			label: "Invitations",
			to: "/invitations",
			icon: Mail
		}]
	},
	{
		label: "Settings",
		items: [
			{
				label: "Organization",
				to: "/organization",
				icon: Building
			},
			{
				label: "Documents",
				to: "/documents",
				icon: FileText
			},
			{
				label: "General",
				to: "/settings",
				icon: Settings
			}
		]
	}
];
function SidebarContentBody({ onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: session } = useSession();
	const isTenant = session?.role === "TENANT";
	const isVendor = session?.role === "VENDOR";
	const main = isTenant ? TENANT_MAIN : isVendor ? VENDOR_MAIN : MAIN;
	const sections = isTenant ? TENANT_SECTIONS : isVendor ? VENDOR_SECTIONS : SECTIONS;
	const [open, setOpen] = useState({
		Financials: true,
		"Property / Unit": true,
		People: true,
		"My tenancy": true,
		Settings: false
	});
	const row = (item) => {
		const active = pathname === item.to;
		return /* @__PURE__ */ jsxs(Link, {
			to: item.to,
			onClick: onNavigate,
			className: cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active ? "bg-navy-hover text-cyan-active" : "text-navy-foreground/75 hover:bg-navy-soft hover:text-navy-foreground"),
			children: [/* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ jsx("span", {
				className: "truncate",
				children: item.label
			})]
		}, item.to);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col bg-navy",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-16 items-center gap-2 border-b border-white/10 px-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground",
					children: "P"
				}), /* @__PURE__ */ jsxs("div", {
					className: "leading-tight",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-sm font-bold text-navy-foreground",
						children: "PropertyMS"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[10px] uppercase tracking-widest text-cyan-active",
						children: isTenant ? "Tenant" : session?.role === "ADMIN" ? "Admin" : "Landlord"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("nav", {
				className: "flex-1 space-y-1 overflow-y-auto px-3 py-4",
				children: [main.map(row), sections.map((section) => /* @__PURE__ */ jsxs("div", {
					className: "pt-3",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setOpen((o) => ({
							...o,
							[section.label]: !o[section.label]
						})),
						className: "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-navy-foreground/50 hover:text-navy-foreground",
						children: [section.label, open[section.label] ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" })]
					}), open[section.label] ? /* @__PURE__ */ jsx("div", {
						className: "mt-1 space-y-1",
						children: section.items.map(row)
					}) : null]
				}, section.label))]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border-t border-white/10 px-5 py-4 text-[11px] text-navy-foreground/50",
				children: "Kenya · KES · MPESA ready"
			})
		]
	});
}
//#endregion
//#region src/components/pms/TopBar.tsx
function TopBar({ onMenu }) {
	const { data } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const initials = `${data?.profile?.first_name?.[0] ?? ""}${data?.profile?.last_name?.[0] ?? ""}`.toUpperCase() || (data?.user?.email?.[0]?.toUpperCase() ?? "U");
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ jsxs("header", {
		className: "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6",
		children: [
			/* @__PURE__ */ jsx(Button, {
				variant: "ghost",
				size: "icon",
				className: "md:hidden",
				onClick: onMenu,
				"aria-label": "Open menu",
				children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex-1 truncate text-sm text-muted-foreground",
				children: data?.org?.name ?? "Your organization"
			}),
			/* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				size: "icon",
				"aria-label": "Notifications",
				className: "relative",
				children: [/* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }), /* @__PURE__ */ jsx("span", { className: "absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" })]
			}),
			/* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ jsx("button", {
					className: "grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
					children: initials
				})
			}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
				align: "end",
				className: "w-56",
				children: [
					/* @__PURE__ */ jsx(DropdownMenuLabel, {
						className: "truncate",
						children: data?.user?.email
					}),
					/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
					/* @__PURE__ */ jsx(DropdownMenuItem, {
						onClick: () => navigate({ to: "/settings" }),
						children: "Profile"
					}),
					/* @__PURE__ */ jsx(DropdownMenuItem, {
						onClick: signOut,
						children: "Log out"
					})
				]
			})] })
		]
	});
}
//#endregion
//#region src/components/ui/sheet.tsx
var Sheet = SheetPrimitive.Root;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ jsxs(SheetPrimitive.Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
//#endregion
//#region src/lib/access.ts
var MANAGER_ROLES = ["LANDLORD", "ADMIN"];
/** Which roles may open a given path. Longest matching prefix wins. */
var ROUTE_ACCESS = [
	{
		prefix: "/dashboard",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/properties",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/units",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/tenants",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/invoices",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/payments",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/maintenance",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/invitations",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/organization",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/documents",
		roles: MANAGER_ROLES
	},
	{
		prefix: "/tenant-dashboard",
		roles: ["TENANT"]
	},
	{
		prefix: "/my-home",
		roles: ["TENANT"]
	},
	{
		prefix: "/my-invoices",
		roles: ["TENANT"]
	},
	{
		prefix: "/my-maintenance",
		roles: ["TENANT"]
	},
	{
		prefix: "/my-documents",
		roles: ["TENANT"]
	},
	{
		prefix: "/vendor-dashboard",
		roles: ["VENDOR"]
	},
	{
		prefix: "/vendor-maintenance",
		roles: ["VENDOR"]
	},
	{
		prefix: "/vendor-expenses",
		roles: ["VENDOR"]
	},
	{
		prefix: "/vendor-documents",
		roles: ["VENDOR"]
	},
	{
		prefix: "/settings",
		roles: [
			"LANDLORD",
			"ADMIN",
			"TENANT",
			"VENDOR",
			"APPLICANT"
		]
	}
];
function canAccess(pathname, role) {
	if (!role) return false;
	const match = [...ROUTE_ACCESS].sort((a, b) => b.prefix.length - a.prefix.length).find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
	if (!match) return true;
	return match.roles.includes(role);
}
//#endregion
//#region src/routes/_authenticated/route.tsx?tsr-split=component
function DashboardLayout() {
	const [mobileOpen, setMobileOpen] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen w-full bg-background",
		children: [
			/* @__PURE__ */ jsx("aside", {
				className: "hidden w-[250px] shrink-0 md:block",
				children: /* @__PURE__ */ jsx("div", {
					className: "fixed inset-y-0 left-0 w-[250px]",
					children: /* @__PURE__ */ jsx(SidebarContentBody, {})
				})
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open: mobileOpen,
				onOpenChange: setMobileOpen,
				children: /* @__PURE__ */ jsx(SheetContent, {
					side: "left",
					className: "w-[250px] border-0 p-0",
					children: /* @__PURE__ */ jsx(SidebarContentBody, { onNavigate: () => setMobileOpen(false) })
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [/* @__PURE__ */ jsx(TopBar, { onMenu: () => setMobileOpen(true) }), /* @__PURE__ */ jsx("main", {
					className: "flex-1 p-4 md:p-6",
					children: /* @__PURE__ */ jsx(RoleGuard, {})
				})]
			})
		]
	});
}
function RoleGuard() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: session, isLoading } = useSession();
	if (isLoading) return /* @__PURE__ */ jsx("div", {
		className: "grid place-items-center py-20",
		children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-primary" })
	});
	if (!canAccess(pathname, session?.role)) {
		const home = roleHome(session?.role);
		return /* @__PURE__ */ jsxs("div", {
			className: "mx-auto max-w-md py-20 text-center",
			children: [
				/* @__PURE__ */ jsx(ShieldAlert, { className: "mx-auto h-10 w-10 text-destructive" }),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-4 text-xl font-bold text-foreground",
					children: "Access restricted"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "This area is not part of your portal. You only have access to information relating to your own account."
				}),
				/* @__PURE__ */ jsx(Button, {
					asChild: true,
					className: "mt-5",
					children: /* @__PURE__ */ jsx(Link, {
						to: home,
						children: "Go to my portal"
					})
				})
			]
		});
	}
	return /* @__PURE__ */ jsx(Outlet, {});
}
//#endregion
export { DashboardLayout as component };
