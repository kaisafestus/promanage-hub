import { t as supabase } from "./client-BYCWxCl7.js";
import { n as useSession } from "./session-CZ3bZTox.js";
import { n as formatDate } from "./format-Dg8MMhg6.js";
import { t as StatusChip } from "./StatusChip-CmE9WXtH.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.js";
import { t as PageHeader } from "./PageHeader-BO9j_IH9.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import { a as DialogTitle, i as DialogHeader, n as DialogContent, r as DialogFooter, t as Dialog } from "./dialog-CzUx__WV.js";
import { n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-CHGFKbne.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.js";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";
//#region src/routes/_authenticated/invitations.tsx?tsr-split=component
var EMPTY = {
	email: "",
	role: "TENANT",
	first_name: "",
	last_name: "",
	phone: ""
};
function InvitationsPage() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ ...EMPTY });
	const { data: invitations = [], isLoading } = useQuery({
		queryKey: ["invitations"],
		queryFn: async () => {
			const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const create = useMutation({
		mutationFn: async () => {
			const orgId = session?.profile?.org_id;
			if (!orgId) throw new Error("No organization found for your account.");
			const { data, error } = await supabase.from("invitations").insert({
				org_id: orgId,
				email: form.email.trim().toLowerCase(),
				role: form.role,
				first_name: form.first_name.trim() || null,
				last_name: form.last_name.trim() || null,
				phone: form.phone.trim() || null,
				invited_by_id: session?.user?.id ?? null
			}).select().single();
			if (error) throw error;
			const invitationUrl = `${window.location.origin}/auth?invitation_token=${data.token}`;
			try {
				return await supabase.functions.invoke("send-invitation", { body: {
					email: data.email,
					role: data.role,
					firstName: data.first_name,
					lastName: data.last_name,
					orgName: session?.org?.name,
					invitationUrl
				} });
			} catch (emailError) {
				console.error("Failed to send invitation email:", emailError);
				return { error: emailError };
			}
		},
		onSuccess: (result) => {
			if (result?.data?.skipped) toast.success("Invitation created. Email sending is pending configuration.");
			else toast.success("Invitation created and email sent");
			setOpen(false);
			setForm({ ...EMPTY });
			queryClient.invalidateQueries({ queryKey: ["invitations"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const update = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("invitations").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("invitations").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invitations"] }),
		onError: (e) => toast.error(e.message)
	});
	const counts = {
		total: invitations.length,
		pending: invitations.filter((i) => i.status === "PENDING").length,
		accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
		closed: invitations.filter((i) => i.status === "EXPIRED" || i.status === "REVOKED").length
	};
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			title: "Invitations",
			subtitle: "Invite tenants and vendors into their own portals.",
			actions: /* @__PURE__ */ jsxs(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Invite user"]
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface mb-4 grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0",
			children: [
				{
					label: "Total invites",
					value: counts.total
				},
				{
					label: "Pending",
					value: counts.pending
				},
				{
					label: "Accepted",
					value: counts.accepted
				},
				{
					label: "Expired / revoked",
					value: counts.closed
				}
			].map((m) => /* @__PURE__ */ jsxs("div", {
				className: "p-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
					children: m.label
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-1 text-2xl font-bold",
					children: m.value
				})]
			}, m.label))
		}),
		/* @__PURE__ */ jsx("div", {
			className: "card-surface overflow-x-auto",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "Email" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Role" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Name" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Phone" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Status" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Created" }),
				/* @__PURE__ */ jsx(TableHead, { children: "Expires" }),
				/* @__PURE__ */ jsx(TableHead, { className: "w-10" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: isLoading ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "Loading…"
			}) }) : invitations.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, {
				colSpan: 8,
				className: "py-10 text-center text-muted-foreground",
				children: "No invitations yet."
			}) }) : invitations.map((i) => /* @__PURE__ */ jsxs(TableRow, {
				className: "odd:bg-muted/30",
				children: [
					/* @__PURE__ */ jsx(TableCell, {
						className: "font-medium",
						children: i.email
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: i.role }) }),
					/* @__PURE__ */ jsx(TableCell, { children: [i.first_name, i.last_name].filter(Boolean).join(" ") || "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: i.phone ?? "—" }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusChip, { value: i.status }) }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.created_at) }),
					/* @__PURE__ */ jsx(TableCell, { children: formatDate(i.expires_at) }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
						align: "end",
						children: [/* @__PURE__ */ jsx(DropdownMenuItem, {
							onClick: () => update.mutate({
								id: i.id,
								status: "REVOKED"
							}),
							children: "Revoke"
						}), /* @__PURE__ */ jsx(DropdownMenuItem, {
							className: "text-destructive",
							onClick: () => remove.mutate(i.id),
							children: "Delete"
						})]
					})] }) })
				]
			}, i.id)) })] })
		}),
		/* @__PURE__ */ jsx(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ jsxs(DialogContent, {
				className: "max-w-md",
				children: [
					/* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Invite user" }) }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Email" }), /* @__PURE__ */ jsx(Input, {
									type: "email",
									value: form.email,
									onChange: (e) => setForm({
										...form,
										email: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Role" }), /* @__PURE__ */ jsxs(Select, {
									value: form.role,
									onValueChange: (v) => setForm({
										...form,
										role: v
									}),
									children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
										value: "TENANT",
										children: "Tenant"
									}), /* @__PURE__ */ jsx(SelectItem, {
										value: "VENDOR",
										children: "Vendor"
									})] })]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "First name" }), /* @__PURE__ */ jsx(Input, {
									value: form.first_name,
									onChange: (e) => setForm({
										...form,
										first_name: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, { children: "Last name" }), /* @__PURE__ */ jsx(Input, {
									value: form.last_name,
									onChange: (e) => setForm({
										...form,
										last_name: e.target.value
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ jsx(Label, { children: "Phone" }), /* @__PURE__ */ jsx(Input, {
									value: form.phone,
									onChange: (e) => setForm({
										...form,
										phone: e.target.value
									}),
									placeholder: "+254712345678"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "outline",
						onClick: () => setOpen(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						disabled: !form.email || create.isPending,
						onClick: () => create.mutate(),
						children: "Send invitation"
					})] })
				]
			})
		})
	] });
}
//#endregion
export { InvitationsPage as component };
