import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/pms/PageHeader.tsx
function PageHeader({ title, subtitle, actions }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-5 flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold tracking-tight text-foreground",
			children: title
		}), subtitle ? /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: subtitle
		}) : null] }), actions ? /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap items-center gap-2",
			children: actions
		}) : null]
	});
}
//#endregion
export { PageHeader as t };
