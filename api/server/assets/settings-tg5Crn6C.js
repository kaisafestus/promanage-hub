import { n as useSession } from "./session-CZ3bZTox.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/routes/_authenticated/settings.tsx?tsr-split=component
function SettingsPage() {
	const { data } = useSession();
	const rows = [
		{
			label: "Name",
			value: `${data?.profile?.first_name ?? ""} ${data?.profile?.last_name ?? ""}`.trim() || "—"
		},
		{
			label: "Email",
			value: data?.user?.email ?? "—"
		},
		{
			label: "Phone",
			value: data?.profile?.phone ?? "—"
		},
		{
			label: "Currency",
			value: "KES (en-KE)"
		},
		{
			label: "Phone format",
			value: "+254 (E.164)"
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "max-w-2xl",
		children: [/* @__PURE__ */ jsx(PageHeader, {
			title: "Settings",
			subtitle: "Your account and regional defaults."
		}), /* @__PURE__ */ jsxs("div", {
			className: "card-surface divide-y",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between p-5",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm font-medium",
					children: "Role"
				}), /* @__PURE__ */ jsx(StatusChip, { value: data?.role ?? null })]
			}), rows.map((r) => /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between p-5 text-sm",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-medium",
					children: r.label
				}), /* @__PURE__ */ jsx("span", {
					className: "text-muted-foreground",
					children: r.value
				})]
			}, r.label))]
		})]
	});
}
//#endregion
export { SettingsPage as component };
