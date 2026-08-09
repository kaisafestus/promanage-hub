import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, DoorOpen, Users, Wrench, Receipt, Banknote,
  Mail, Settings, ChevronDown, FileText, Building, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";

type Item = { label: string; to: string; icon: React.ElementType };
type Section = { label: string; items: Item[] };

const MAIN: Item[] = [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }];

const TENANT_MAIN: Item[] = [{ label: "My home", to: "/tenant-dashboard", icon: LayoutDashboard }];

const TENANT_SECTIONS: Section[] = [
  {
    label: "My tenancy",
    items: [
      { label: "Lease & unit", to: "/my-home", icon: DoorOpen },
      { label: "Invoices & payments", to: "/my-invoices", icon: Receipt },
      { label: "Maintenance", to: "/my-maintenance", icon: Wrench },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "General", to: "/settings", icon: Settings }],
  },
];

const SECTIONS: Section[] = [
  {
    label: "Financials",
    items: [
      { label: "Invoices", to: "/invoices", icon: Receipt },
      { label: "Payments", to: "/payments", icon: Banknote },
    ],
  },
  {
    label: "Property / Unit",
    items: [
      { label: "Properties", to: "/properties", icon: Building2 },
      { label: "Units", to: "/units", icon: DoorOpen },
      { label: "Maintenance", to: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Tenants", to: "/tenants", icon: Users },
      { label: "Invitations", to: "/invitations", icon: Mail },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Organization", to: "/organization", icon: Building },
      { label: "Documents", to: "/documents", icon: FileText },
      { label: "General", to: "/settings", icon: Settings },
    ],
  },
];

export function SidebarContentBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session } = useSession();
  const isTenant = session?.role === "TENANT";
  const main = isTenant ? TENANT_MAIN : MAIN;
  const sections = isTenant ? TENANT_SECTIONS : SECTIONS;
  const [open, setOpen] = useState<Record<string, boolean>>({
    Financials: true,
    "Property / Unit": true,
    People: true,
    "My tenancy": true,
    Settings: false,
  });

  const row = (item: Item) => {
    const active = pathname === item.to;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-navy-hover text-cyan-active"
            : "text-navy-foreground/75 hover:bg-navy-soft hover:text-navy-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          P
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-navy-foreground">PropertyMS</div>
          <div className="text-[10px] uppercase tracking-widest text-cyan-active">
            {isTenant ? "Tenant" : session?.role === "ADMIN" ? "Admin" : "Landlord"}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {main.map(row)}
        {sections.map((section) => (
          <div key={section.label} className="pt-3">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [section.label]: !o[section.label] }))}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-navy-foreground/50 hover:text-navy-foreground"
            >
              {section.label}
              {open[section.label] ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            {open[section.label] ? (
              <div className="mt-1 space-y-1">{section.items.map(row)}</div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-navy-foreground/50">
        Kenya · KES · MPESA ready
      </div>
    </div>
  );
}