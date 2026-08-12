import { t as cn } from "./utils-C_uf36nf.js";
import { jsx } from "react/jsx-runtime";
//#region src/components/pms/StatusChip.tsx
var TONE = {
	green: "bg-success/12 text-success border-success/25",
	amber: "bg-warning/15 text-warning border-warning/30",
	red: "bg-destructive/10 text-destructive border-destructive/25",
	blue: "bg-info/10 text-info border-info/25",
	gray: "bg-muted text-muted-foreground border-border",
	indigo: "bg-primary/10 text-primary border-primary/25"
};
var MAP = {
	ACTIVE: "green",
	PAID: "green",
	CONFIRMED: "green",
	COMPLETED: "green",
	ACCEPTED: "green",
	AVAILABLE: "green",
	PENDING: "amber",
	DRAFT: "gray",
	PARTIAL: "amber",
	SENT: "indigo",
	RESERVED: "amber",
	WAITING_PARTS: "amber",
	ASSIGNED: "indigo",
	IN_PROGRESS: "blue",
	OCCUPIED: "blue",
	REFUNDED: "blue",
	OPEN: "indigo",
	OVERDUE: "red",
	FAILED: "red",
	CANCELLED: "red",
	REVOKED: "red",
	TERMINATED: "red",
	MAINTENANCE: "red",
	EMERGENCY: "red",
	HIGH: "amber",
	EXPIRED: "amber",
	UNCOLLECTIBLE: "red",
	SUSPENDED: "red",
	LOW: "gray",
	MEDIUM: "blue",
	NOTICE: "amber",
	UNDER_APPLICATION: "amber"
};
function StatusChip({ value, className }) {
	if (!value) return /* @__PURE__ */ jsx("span", {
		className: "text-muted-foreground",
		children: "—"
	});
	const tone = TONE[MAP[value] ?? "gray"];
	return /* @__PURE__ */ jsx("span", {
		className: cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tone, className),
		children: value.replace(/_/g, " ")
	});
}
//#endregion
export { StatusChip as t };
