import { t as supabase } from "./client-BYCWxCl7.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
//#region src/styles.css?url
var styles_default = "/assets/styles-BEeb7KSd.css";
//#endregion
//#region src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		toast.error(error.message);
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$23 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "PropertyMS" },
			{
				name: "description",
				content: "Multi-portal property management for Kenyan landlords, tenants and vendors."
			},
			{
				property: "og:title",
				content: "PropertyMS · Kenya Property Management"
			},
			{
				property: "og:description",
				content: "Landlord, tenant, vendor and admin portals with KES invoicing and MPESA payments."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.ico",
			type: "image/x-icon"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(Toaster$1, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$23.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(Outlet, {})
	});
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$22 = () => import("./routes-Rk3soTni.js");
var Route$22 = createFileRoute("/")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "PropertyMS · Kenya Property Management System" },
		{
			name: "description",
			content: "Multi-portal property management for Kenyan landlords: properties, units, tenants, KES invoicing, MPESA payments and maintenance."
		},
		{
			property: "og:title",
			content: "PropertyMS · Kenya Property Management"
		},
		{
			property: "og:description",
			content: "Landlord, tenant, vendor and admin portals with KES invoicing and MPESA payments."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
//#endregion
//#region src/routes/_authenticated/route.tsx
var $$splitComponentImporter$21 = () => import("./route-CKcWDEbA.js");
var Route$21 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
//#endregion
//#region src/routes/auth.tsx
var $$splitComponentImporter$20 = () => import("./auth-CRXLIRGi.js");
var Route$20 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in · PropertyMS Kenya Property Management" },
		{
			name: "description",
			content: "Sign in or create a landlord account to manage properties, tenants, invoices and MPESA rent payments in KES."
		},
		{
			property: "og:title",
			content: "Sign in · PropertyMS"
		},
		{
			property: "og:description",
			content: "Manage Kenyan rental portfolios: properties, tenants, invoices and maintenance."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
//#endregion
//#region src/routes/_authenticated/dashboard.tsx
var $$splitComponentImporter$19 = () => import("./dashboard-BTJIW-KN.js");
var Route$19 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Landlord Dashboard · PropertyMS" },
		{
			name: "description",
			content: "Portfolio overview: occupancy, rent collection in KES, outstanding balances and open maintenance requests."
		},
		{
			property: "og:title",
			content: "Landlord Dashboard · PropertyMS"
		},
		{
			property: "og:description",
			content: "Occupancy, KES rent collection and maintenance at a glance."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
//#endregion
//#region src/routes/_authenticated/documents.tsx
var $$splitComponentImporter$18 = () => import("./documents-R5Dc7kyQ.js");
var Route$18 = createFileRoute("/_authenticated/documents")({
	head: () => ({ meta: [
		{ title: "Documents · PropertyMS" },
		{
			name: "description",
			content: "Lease agreements, receipts, invoices and maintenance records stored against your properties and tenants."
		},
		{
			property: "og:title",
			content: "Documents · PropertyMS"
		},
		{
			property: "og:description",
			content: "Leases, receipts and property records in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
//#endregion
//#region src/routes/_authenticated/invitations.tsx
var $$splitComponentImporter$17 = () => import("./invitations-CQC_rjfm.js");
var Route$17 = createFileRoute("/_authenticated/invitations")({
	head: () => ({ meta: [
		{ title: "Invitations · PropertyMS" },
		{
			name: "description",
			content: "Invite tenants and vendors to their own portal, and track pending, accepted, expired and revoked invitations."
		},
		{
			property: "og:title",
			content: "Invitations · PropertyMS"
		},
		{
			property: "og:description",
			content: "Invite tenants and vendors to their portals."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
//#endregion
//#region src/routes/_authenticated/invoices.tsx
var $$splitComponentImporter$16 = () => import("./invoices-XeccUce-.js");
var Route$16 = createFileRoute("/_authenticated/invoices")({
	head: () => ({ meta: [
		{ title: "Invoices · PropertyMS" },
		{
			name: "description",
			content: "Issue and track rent, water and utility invoices in KES with draft, sent, partial, paid and overdue statuses."
		},
		{
			property: "og:title",
			content: "Invoices · PropertyMS"
		},
		{
			property: "og:description",
			content: "Rent and utility invoicing in KES."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
//#endregion
//#region src/routes/_authenticated/maintenance.tsx
var $$splitComponentImporter$15 = () => import("./maintenance-DMMz4zfV.js");
var Route$15 = createFileRoute("/_authenticated/maintenance")({
	head: () => ({ meta: [
		{ title: "Maintenance · PropertyMS" },
		{
			name: "description",
			content: "Log, prioritise and close maintenance requests across properties, with costs tracked in KES."
		},
		{
			property: "og:title",
			content: "Maintenance · PropertyMS"
		},
		{
			property: "og:description",
			content: "Track repairs from open to completed."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
//#endregion
//#region src/routes/_authenticated/my-documents.tsx
var $$splitComponentImporter$14 = () => import("./my-documents-Du-DeoXM.js");
var Route$14 = createFileRoute("/_authenticated/my-documents")({
	head: () => ({ meta: [
		{ title: "My Documents · PropertyMS" },
		{
			name: "description",
			content: "View and download lease agreements, receipts, invoices and other documents related to your tenancy."
		},
		{
			property: "og:title",
			content: "My Documents · PropertyMS"
		},
		{
			property: "og:description",
			content: "Your tenancy documents in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
//#endregion
//#region src/routes/_authenticated/my-home.tsx
var $$splitComponentImporter$13 = () => import("./my-home-B_8_En1G.js");
var Route$13 = createFileRoute("/_authenticated/my-home")({
	head: () => ({ meta: [
		{ title: "My Lease & Unit · PropertyMS" },
		{
			name: "description",
			content: "View your lease dates, monthly rent in KES, security deposit and the details of the unit you occupy."
		},
		{
			property: "og:title",
			content: "My Lease & Unit · PropertyMS"
		},
		{
			property: "og:description",
			content: "Lease terms, rent and unit details for your tenancy."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
//#endregion
//#region src/routes/_authenticated/my-invoices.tsx
var $$splitComponentImporter$12 = () => import("./my-invoices-e0hAqtye.js");
var Route$12 = createFileRoute("/_authenticated/my-invoices")({
	head: () => ({ meta: [
		{ title: "My Invoices & Payments · PropertyMS" },
		{
			name: "description",
			content: "View rent and utility invoices in KES, submit MPESA or bank payments and track your payment history."
		},
		{
			property: "og:title",
			content: "My Invoices & Payments · PropertyMS"
		},
		{
			property: "og:description",
			content: "Pay rent via MPESA and track invoice status."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
//#endregion
//#region src/routes/_authenticated/my-maintenance.tsx
var $$splitComponentImporter$11 = () => import("./my-maintenance-DzM5vdxQ.js");
var Route$11 = createFileRoute("/_authenticated/my-maintenance")({
	head: () => ({ meta: [
		{ title: "My Maintenance Requests · PropertyMS" },
		{
			name: "description",
			content: "Raise repair requests for your unit, set the priority and follow progress until the job is completed."
		},
		{
			property: "og:title",
			content: "My Maintenance Requests · PropertyMS"
		},
		{
			property: "og:description",
			content: "Report repairs and track their status."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
//#endregion
//#region src/routes/_authenticated/organization.tsx
var $$splitComponentImporter$10 = () => import("./organization-Bi1NH0E5.js");
var Route$10 = createFileRoute("/_authenticated/organization")({
	head: () => ({ meta: [
		{ title: "Organization settings · PropertyMS" },
		{
			name: "description",
			content: "Update your property management company name, contact email and Kenyan phone number."
		},
		{
			property: "og:title",
			content: "Organization settings · PropertyMS"
		},
		{
			property: "og:description",
			content: "Company details for your property management organization."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
//#endregion
//#region src/routes/_authenticated/payments.tsx
var $$splitComponentImporter$9 = () => import("./payments-D8sUwlvS.js");
var Route$9 = createFileRoute("/_authenticated/payments")({
	head: () => ({ meta: [
		{ title: "Payments · PropertyMS" },
		{
			name: "description",
			content: "Record and reconcile rent payments in KES via MPESA, bank transfer or cash, with automatic invoice status updates."
		},
		{
			property: "og:title",
			content: "Payments · PropertyMS"
		},
		{
			property: "og:description",
			content: "MPESA and bank rent payment tracking in KES."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
//#endregion
//#region src/routes/_authenticated/properties.tsx
var $$splitComponentImporter$8 = () => import("./properties-CAF6p9NP.js");
var Route$8 = createFileRoute("/_authenticated/properties")({
	head: () => ({ meta: [
		{ title: "Properties · PropertyMS" },
		{
			name: "description",
			content: "Create and manage rental properties, units, MPESA paybills and water rates across your Kenyan portfolio."
		},
		{
			property: "og:title",
			content: "Properties · PropertyMS"
		},
		{
			property: "og:description",
			content: "Manage your rental properties and their units."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
//#endregion
//#region src/routes/_authenticated/settings.tsx
var $$splitComponentImporter$7 = () => import("./settings-tg5Crn6C.js");
var Route$7 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [
		{ title: "Settings · PropertyMS" },
		{
			name: "description",
			content: "Your PropertyMS account profile, role and regional defaults for Kenya (KES currency, +254 phone format)."
		},
		{
			property: "og:title",
			content: "Settings · PropertyMS"
		},
		{
			property: "og:description",
			content: "Account profile and regional defaults."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
//#endregion
//#region src/routes/_authenticated/tenant-dashboard.tsx
var $$splitComponentImporter$6 = () => import("./tenant-dashboard-PPd7H2Y8.js");
var Route$6 = createFileRoute("/_authenticated/tenant-dashboard")({
	head: () => ({ meta: [
		{ title: "My Home · PropertyMS Tenant Portal" },
		{
			name: "description",
			content: "Tenant portal overview: your unit, rent balance in KES, upcoming due dates and open maintenance requests."
		},
		{
			property: "og:title",
			content: "Tenant Portal · PropertyMS"
		},
		{
			property: "og:description",
			content: "Your unit, rent balance and maintenance requests in one place."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
//#endregion
//#region src/routes/_authenticated/tenants.tsx
var $$splitComponentImporter$5 = () => import("./tenants-DNGQyrgf.js");
var Route$5 = createFileRoute("/_authenticated/tenants")({
	head: () => ({ meta: [
		{ title: "Tenants · PropertyMS" },
		{
			name: "description",
			content: "Manage tenants, their units, lease dates, monthly rent in KES and outstanding balances."
		},
		{
			property: "og:title",
			content: "Tenants · PropertyMS"
		},
		{
			property: "og:description",
			content: "Tenant records, leases and balances."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/_authenticated/units.tsx
var $$splitComponentImporter$4 = () => import("./units-XIJVPrgx.js");
var Route$4 = createFileRoute("/_authenticated/units")({
	head: () => ({ meta: [
		{ title: "Units · PropertyMS" },
		{
			name: "description",
			content: "Track every rental unit: bedrooms, size, monthly rent in KES, deposits, occupancy status and vacancy."
		},
		{
			property: "og:title",
			content: "Units · PropertyMS"
		},
		{
			property: "og:description",
			content: "Rent, deposits and occupancy for every unit."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/_authenticated/vendor-dashboard.tsx
var $$splitComponentImporter$3 = () => import("./vendor-dashboard-Bfp_8NvH.js");
var Route$3 = createFileRoute("/_authenticated/vendor-dashboard")({
	head: () => ({ meta: [
		{ title: "Vendor Dashboard · PropertyMS" },
		{
			name: "description",
			content: "Vendor portal overview: assigned maintenance requests, completed jobs, payments received and upcoming schedules."
		},
		{
			property: "og:title",
			content: "Vendor Dashboard · PropertyMS"
		},
		{
			property: "og:description",
			content: "Your maintenance jobs, payments and schedule."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/_authenticated/vendor-documents.tsx
var $$splitComponentImporter$2 = () => import("./vendor-documents-B1P4bQph.js");
var Route$2 = createFileRoute("/_authenticated/vendor-documents")({
	head: () => ({ meta: [
		{ title: "Vendor Documents · PropertyMS" },
		{
			name: "description",
			content: "Contracts, receipts and other documents shared with you by property managers."
		},
		{
			property: "og:title",
			content: "Vendor Documents · PropertyMS"
		},
		{
			property: "og:description",
			content: "Your vendor documents and contracts."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/_authenticated/vendor-expenses.tsx
var $$splitComponentImporter$1 = () => import("./vendor-expenses-CchxaQAG.js");
var Route$1 = createFileRoute("/_authenticated/vendor-expenses")({
	head: () => ({ meta: [
		{ title: "Vendor Expenses · PropertyMS" },
		{
			name: "description",
			content: "Log and track expenses for maintenance jobs, including parts, transport and labour costs in KES."
		},
		{
			property: "og:title",
			content: "Vendor Expenses · PropertyMS"
		},
		{
			property: "og:description",
			content: "Track your job expenses in KES."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/_authenticated/vendor-maintenance.tsx
var $$splitComponentImporter = () => import("./vendor-maintenance-ByqxuDyH.js");
var Route = createFileRoute("/_authenticated/vendor-maintenance")({
	head: () => ({ meta: [
		{ title: "Vendor Maintenance · PropertyMS" },
		{
			name: "description",
			content: "View and update your assigned maintenance requests, update status and add completion notes."
		},
		{
			property: "og:title",
			content: "Vendor Maintenance · PropertyMS"
		},
		{
			property: "og:description",
			content: "Your assigned maintenance jobs."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$22.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$23
});
var AuthenticatedRouteRoute = Route$21.update({
	id: "/_authenticated",
	getParentRoute: () => Route$23
});
var AuthRoute = Route$20.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$23
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedDashboardRoute: Route$19.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDocumentsRoute: Route$18.update({
		id: "/documents",
		path: "/documents",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedInvitationsRoute: Route$17.update({
		id: "/invitations",
		path: "/invitations",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedInvoicesRoute: Route$16.update({
		id: "/invoices",
		path: "/invoices",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMaintenanceRoute: Route$15.update({
		id: "/maintenance",
		path: "/maintenance",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMyDocumentsRoute: Route$14.update({
		id: "/my-documents",
		path: "/my-documents",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMyHomeRoute: Route$13.update({
		id: "/my-home",
		path: "/my-home",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMyInvoicesRoute: Route$12.update({
		id: "/my-invoices",
		path: "/my-invoices",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedMyMaintenanceRoute: Route$11.update({
		id: "/my-maintenance",
		path: "/my-maintenance",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedOrganizationRoute: Route$10.update({
		id: "/organization",
		path: "/organization",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPaymentsRoute: Route$9.update({
		id: "/payments",
		path: "/payments",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedPropertiesRoute: Route$8.update({
		id: "/properties",
		path: "/properties",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSettingsRoute: Route$7.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTenantDashboardRoute: Route$6.update({
		id: "/tenant-dashboard",
		path: "/tenant-dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTenantsRoute: Route$5.update({
		id: "/tenants",
		path: "/tenants",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedUnitsRoute: Route$4.update({
		id: "/units",
		path: "/units",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVendorDashboardRoute: Route$3.update({
		id: "/vendor-dashboard",
		path: "/vendor-dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVendorDocumentsRoute: Route$2.update({
		id: "/vendor-documents",
		path: "/vendor-documents",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVendorExpensesRoute: Route$1.update({
		id: "/vendor-expenses",
		path: "/vendor-expenses",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedVendorMaintenanceRoute: Route.update({
		id: "/vendor-maintenance",
		path: "/vendor-maintenance",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$23._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
