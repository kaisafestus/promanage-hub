import { t as supabase } from "./client-BYCWxCl7.js";
import { t as roleHome } from "./session-CZ3bZTox.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-Bq5vK6RO.js";
import { n as Input, t as Label } from "./label-B7oQAA24.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Loader2, Mail } from "lucide-react";
import { cva } from "class-variance-authority";
import * as TabsPrimitive from "@radix-ui/react-tabs";
//#region src/components/ui/alert.tsx
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
//#endregion
//#region src/components/ui/tabs.tsx
var Tabs = TabsPrimitive.Root;
var TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(TabsPrimitive.Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = TabsPrimitive.Content.displayName;
//#endregion
//#region src/routes/auth.tsx?tsr-split=component
function AuthPage() {
	const navigate = useNavigate();
	const invitationToken = useSearch({ from: "/auth" }).invitation_token;
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [notice, setNotice] = useState(null);
	const [invitation, setInvitation] = useState(null);
	const [invitationLoading, setInvitationLoading] = useState(true);
	useEffect(() => {
		if (invitationToken) supabase.from("invitations").select("*").eq("token", invitationToken).eq("status", "PENDING").gte("expires_at", (/* @__PURE__ */ new Date()).toISOString()).maybeSingle().then(({ data }) => {
			if (data) setInvitation({
				email: data.email,
				role: data.role,
				first_name: data.first_name || "",
				last_name: data.last_name || ""
			});
			setInvitationLoading(false);
		});
		else setInvitationLoading(false);
	}, [invitationToken]);
	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).then(({ data: roles }) => {
				navigate({
					to: roleHome(roles?.[0]?.role ?? "LANDLORD"),
					replace: true
				});
			});
		});
	}, [navigate]);
	async function onLogin(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		setLoading(true);
		setError(null);
		const { error, data } = await supabase.auth.signInWithPassword({
			email: String(form.get("email")),
			password: String(form.get("password"))
		});
		setLoading(false);
		if (error) return setError(error.message);
		const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
		navigate({
			to: roleHome(roles?.[0]?.role ?? "LANDLORD"),
			replace: true
		});
	}
	async function onSignup(e) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const password = String(form.get("password"));
		if (password.length < 8) return setError("Password must be at least 8 characters.");
		if (password !== String(form.get("confirmPassword"))) return setError("Passwords do not match.");
		setLoading(true);
		setError(null);
		const email = String(form.get("email"));
		const role = invitation?.role || "LANDLORD";
		const orgName = invitation ? void 0 : String(form.get("orgName"));
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: window.location.origin,
				data: {
					role,
					...orgName ? { org_name: orgName } : {},
					first_name: invitation?.first_name || String(form.get("firstName")),
					last_name: invitation?.last_name || String(form.get("lastName")),
					phone: invitationToken ? void 0 : String(form.get("phone") ?? "")
				}
			}
		});
		setLoading(false);
		if (error) return setError(error.message);
		const userId = data.user?.id;
		if (userId) {
			if (invitationToken) await supabase.from("invitations").update({
				status: "ACCEPTED",
				accepted_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("token", invitationToken);
			const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
			navigate({
				to: roleHome(roles?.[0]?.role ?? "LANDLORD"),
				replace: true
			});
		}
		setNotice("Account created. Check your email to confirm before signing in.");
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "grid min-h-screen lg:grid-cols-2",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "hidden flex-col justify-between p-12 text-navy-foreground lg:flex",
			style: { background: "var(--gradient-navy)" },
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground",
						children: "P"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-lg font-bold",
						children: "PropertyMS"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "max-w-md",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-4xl font-bold leading-tight",
						children: "Run your Kenyan rental portfolio from one place."
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-4 text-navy-foreground/70",
						children: "Properties, units, tenants, MPESA rent collection in KES, invoices and maintenance — with separate portals for landlords, tenants and vendors."
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-navy-foreground/50",
					children: "Nairobi · KES · +254"
				})
			]
		}), /* @__PURE__ */ jsx("section", {
			className: "flex items-center justify-center p-6",
			children: /* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-md",
				children: [
					/* @__PURE__ */ jsx("h1", {
						className: "text-2xl font-bold tracking-tight",
						children: invitationToken ? "Accept Invitation" : "Welcome to PropertyMS"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: invitationLoading ? "Loading invitation..." : invitation ? `You've been invited to join as a ${invitation.role === "VENDOR" ? "vendor" : "tenant"}` : "Sign in or create your landlord account."
					}),
					error ? /* @__PURE__ */ jsx(Alert, {
						variant: "destructive",
						className: "mt-4",
						children: /* @__PURE__ */ jsx(AlertDescription, { children: error })
					}) : null,
					notice ? /* @__PURE__ */ jsx(Alert, {
						className: "mt-4",
						children: /* @__PURE__ */ jsx(AlertDescription, { children: notice })
					}) : null,
					invitationToken && !invitation && !invitationLoading && /* @__PURE__ */ jsx(Alert, {
						variant: "destructive",
						className: "mt-4",
						children: /* @__PURE__ */ jsx(AlertDescription, { children: "This invitation is invalid or has expired. Please contact your administrator." })
					}),
					invitation ? /* @__PURE__ */ jsxs("div", {
						className: "mt-6 space-y-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "card-surface p-4 flex items-center gap-3",
							children: [/* @__PURE__ */ jsx(Mail, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								className: "text-sm font-medium",
								children: ["Invitation for ", invitation.email]
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-muted-foreground",
								children: ["Role: ", invitation.role]
							})] })]
						}), /* @__PURE__ */ jsxs(Tabs, {
							defaultValue: "signup",
							className: "mt-6",
							children: [
								/* @__PURE__ */ jsxs(TabsList, {
									className: "grid w-full grid-cols-2",
									children: [/* @__PURE__ */ jsx(TabsTrigger, {
										value: "signup",
										children: "Create account"
									}), /* @__PURE__ */ jsx(TabsTrigger, {
										value: "login",
										children: "Sign in"
									})]
								}),
								/* @__PURE__ */ jsx(TabsContent, {
									value: "signup",
									children: /* @__PURE__ */ jsxs("form", {
										onSubmit: onSignup,
										className: "space-y-4 pt-4",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "firstName",
														children: "First name"
													}), /* @__PURE__ */ jsx(Input, {
														id: "firstName",
														name: "firstName",
														required: true,
														defaultValue: invitation.first_name
													})]
												}), /* @__PURE__ */ jsxs("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ jsx(Label, {
														htmlFor: "lastName",
														children: "Last name"
													}), /* @__PURE__ */ jsx(Input, {
														id: "lastName",
														name: "lastName",
														required: true,
														defaultValue: invitation.last_name
													})]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "signup-email",
													children: "Email"
												}), /* @__PURE__ */ jsx(Input, {
													id: "signup-email",
													name: "email",
													type: "email",
													required: true,
													defaultValue: invitation.email,
													readOnly: true
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "signup-password",
													children: "Password"
												}), /* @__PURE__ */ jsx(Input, {
													id: "signup-password",
													name: "password",
													type: "password",
													required: true,
													minLength: 8,
													autoComplete: "new-password"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "confirmPassword",
													children: "Confirm"
												}), /* @__PURE__ */ jsx(Input, {
													id: "confirmPassword",
													name: "confirmPassword",
													type: "password",
													required: true,
													minLength: 8,
													autoComplete: "new-password"
												})]
											}),
											/* @__PURE__ */ jsx(Button, {
												type: "submit",
												className: "w-full",
												disabled: loading,
												children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Create account"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(TabsContent, {
									value: "login",
									children: /* @__PURE__ */ jsxs("form", {
										onSubmit: onLogin,
										className: "space-y-4 pt-4",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "login-email",
													children: "Email"
												}), /* @__PURE__ */ jsx(Input, {
													id: "login-email",
													name: "email",
													type: "email",
													required: true,
													defaultValue: invitation.email,
													autoComplete: "email"
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "login-password",
													children: "Password"
												}), /* @__PURE__ */ jsx(Input, {
													id: "login-password",
													name: "password",
													type: "password",
													required: true,
													autoComplete: "current-password"
												})]
											}),
											/* @__PURE__ */ jsx(Button, {
												type: "submit",
												className: "w-full",
												disabled: loading,
												children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Sign in"
											})
										]
									})
								})
							]
						})]
					}) : /* @__PURE__ */ jsxs(Tabs, {
						defaultValue: "login",
						className: "mt-6",
						children: [
							/* @__PURE__ */ jsxs(TabsList, {
								className: "grid w-full grid-cols-2",
								children: [/* @__PURE__ */ jsx(TabsTrigger, {
									value: "login",
									children: "Sign in"
								}), /* @__PURE__ */ jsx(TabsTrigger, {
									value: "signup",
									children: "Create account"
								})]
							}),
							/* @__PURE__ */ jsx(TabsContent, {
								value: "login",
								children: /* @__PURE__ */ jsxs("form", {
									onSubmit: onLogin,
									className: "space-y-4 pt-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "login-email",
												children: "Email"
											}), /* @__PURE__ */ jsx(Input, {
												id: "login-email",
												name: "email",
												type: "email",
												required: true,
												autoComplete: "email"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "login-password",
												children: "Password"
											}), /* @__PURE__ */ jsx(Input, {
												id: "login-password",
												name: "password",
												type: "password",
												required: true,
												autoComplete: "current-password"
											})]
										}),
										/* @__PURE__ */ jsx(Button, {
											type: "submit",
											className: "w-full",
											disabled: loading,
											children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Sign in"
										})
									]
								})
							}),
							/* @__PURE__ */ jsx(TabsContent, {
								value: "signup",
								children: /* @__PURE__ */ jsxs("form", {
									onSubmit: onSignup,
									className: "space-y-4 pt-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "firstName",
													children: "First name"
												}), /* @__PURE__ */ jsx(Input, {
													id: "firstName",
													name: "firstName",
													required: true
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "lastName",
													children: "Last name"
												}), /* @__PURE__ */ jsx(Input, {
													id: "lastName",
													name: "lastName",
													required: true
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "orgName",
												children: "Organization name"
											}), /* @__PURE__ */ jsx(Input, {
												id: "orgName",
												name: "orgName",
												required: true,
												placeholder: "Acme Properties Ltd"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "signup-email",
												children: "Email"
											}), /* @__PURE__ */ jsx(Input, {
												id: "signup-email",
												name: "email",
												type: "email",
												required: true,
												autoComplete: "email"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "phone",
												children: "Phone"
											}), /* @__PURE__ */ jsx(Input, {
												id: "phone",
												name: "phone",
												placeholder: "+254712345678",
												pattern: "^\\+254[17][0-9]{8}$"
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "signup-password",
													children: "Password"
												}), /* @__PURE__ */ jsx(Input, {
													id: "signup-password",
													name: "password",
													type: "password",
													required: true,
													minLength: 8,
													autoComplete: "new-password"
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "confirmPassword",
													children: "Confirm"
												}), /* @__PURE__ */ jsx(Input, {
													id: "confirmPassword",
													name: "confirmPassword",
													type: "password",
													required: true,
													minLength: 8,
													autoComplete: "new-password"
												})]
											})]
										}),
										/* @__PURE__ */ jsx(Button, {
											type: "submit",
											className: "w-full",
											disabled: loading,
											children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : "Create landlord account"
										})
									]
								})
							})
						]
					})
				]
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
