//#region src/lib/format.ts
function kes(value) {
	return `KES ${Number(value ?? 0).toLocaleString("en-KE", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function shortId(id) {
	if (!id) return "—";
	return id.slice(0, 8).toUpperCase();
}
function formatDate(value) {
	if (!value) return "—";
	const d = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-KE", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	});
}
var KE_PHONE_REGEX = /^\+254[17]\d{8}$/;
function normalizeKenyanPhone(input) {
	const digits = input.replace(/[^\d+]/g, "");
	if (digits.startsWith("+254")) return digits;
	if (digits.startsWith("254")) return `+${digits}`;
	if (digits.startsWith("0")) return `+254${digits.slice(1)}`;
	return digits;
}
//#endregion
export { shortId as a, normalizeKenyanPhone as i, formatDate as n, kes as r, KE_PHONE_REGEX as t };
