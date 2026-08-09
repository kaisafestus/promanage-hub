import type { AppRole } from "@/lib/session";

export const MANAGER_ROLES: AppRole[] = ["LANDLORD", "ADMIN"];

/** Which roles may open a given path. Longest matching prefix wins. */
export const ROUTE_ACCESS: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/dashboard", roles: MANAGER_ROLES },
  { prefix: "/properties", roles: MANAGER_ROLES },
  { prefix: "/units", roles: MANAGER_ROLES },
  { prefix: "/tenants", roles: MANAGER_ROLES },
  { prefix: "/invoices", roles: MANAGER_ROLES },
  { prefix: "/payments", roles: MANAGER_ROLES },
  { prefix: "/maintenance", roles: MANAGER_ROLES },
  { prefix: "/invitations", roles: MANAGER_ROLES },
  { prefix: "/organization", roles: MANAGER_ROLES },
  { prefix: "/documents", roles: MANAGER_ROLES },
  { prefix: "/tenant-dashboard", roles: ["TENANT"] },
  { prefix: "/my-home", roles: ["TENANT"] },
  { prefix: "/my-invoices", roles: ["TENANT"] },
  { prefix: "/my-maintenance", roles: ["TENANT"] },
  { prefix: "/my-documents", roles: ["TENANT"] },
  { prefix: "/settings", roles: ["LANDLORD", "ADMIN", "TENANT", "VENDOR", "APPLICANT"] },
];

export function canAccess(pathname: string, role: AppRole | undefined): boolean {
  if (!role) return false;
  const match = [...ROUTE_ACCESS]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (!match) return true;
  return match.roles.includes(role);
}
