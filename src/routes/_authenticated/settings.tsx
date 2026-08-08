import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/lib/session";
import { PageHeader } from "@/components/pms/PageHeader";
import { StatusChip } from "@/components/pms/StatusChip";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings · PropertyMS" },
      { name: "description", content: "Your PropertyMS account profile, role and regional defaults for Kenya (KES currency, +254 phone format)." },
      { property: "og:title", content: "Settings · PropertyMS" },
      { property: "og:description", content: "Account profile and regional defaults." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useSession();
  const rows = [
    { label: "Name", value: `${data?.profile?.first_name ?? ""} ${data?.profile?.last_name ?? ""}`.trim() || "—" },
    { label: "Email", value: data?.user?.email ?? "—" },
    { label: "Phone", value: data?.profile?.phone ?? "—" },
    { label: "Currency", value: "KES (en-KE)" },
    { label: "Phone format", value: "+254 (E.164)" },
  ];

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Your account and regional defaults." />
      <div className="card-surface divide-y">
        <div className="flex items-center justify-between p-5">
          <span className="text-sm font-medium">Role</span>
          <StatusChip value={data?.role ?? null} />
        </div>
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between p-5 text-sm">
            <span className="font-medium">{r.label}</span>
            <span className="text-muted-foreground">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}