import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail } from "lucide-react";
import { roleHome, type AppRole } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · PropertyMS Kenya Property Management" },
      {
        name: "description",
        content:
          "Sign in or create a landlord account to manage properties, tenants, invoices and MPESA rent payments in KES.",
      },
      { property: "og:title", content: "Sign in · PropertyMS" },
      {
        property: "og:description",
        content: "Manage Kenyan rental portfolios: properties, tenants, invoices and maintenance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { invitation_token?: string };
  const invitationToken = search.invitation_token;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<{
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  } | null>(null);
  const [invitationLoading, setInvitationLoading] = useState(true);

  useEffect(() => {
    if (invitationToken) {
      supabase
        .from("invitations")
        .select("*")
        .eq("token", invitationToken)
        .eq("status", "PENDING")
        .gte("expires_at", new Date().toISOString())
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setInvitation({
              email: data.email,
              role: data.role,
              first_name: data.first_name || "",
              last_name: data.last_name || "",
            });
          }
          setInvitationLoading(false);
        });
    } else {
      setInvitationLoading(false);
    }
  }, [invitationToken]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .then(({ data: roles }) => {
            navigate({ to: roleHome((roles?.[0]?.role ?? "LANDLORD") as AppRole), replace: true });
          });
      }
    });
  }, [navigate]);

  async function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) return setError(error.message);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    navigate({ to: roleHome((roles?.[0]?.role ?? "LANDLORD") as AppRole), replace: true });
  }

  async function onSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== String(form.get("confirmPassword")))
      return setError("Passwords do not match.");
    setLoading(true);
    setError(null);

    const email = String(form.get("email"));
    const role = invitation?.role || "LANDLORD";
    const orgName = invitation ? undefined : String(form.get("orgName"));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          role,
          ...(orgName ? { org_name: orgName } : {}),
          first_name: invitation?.first_name || String(form.get("firstName")),
          last_name: invitation?.last_name || String(form.get("lastName")),
          phone: invitationToken ? undefined : String(form.get("phone") ?? ""),
        },
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    const userId = data.user?.id;
    if (userId) {
      if (invitationToken) {
        await supabase
          .from("invitations")
          .update({ status: "ACCEPTED", accepted_at: new Date().toISOString() })
          .eq("token", invitationToken);
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      navigate({ to: roleHome((roles?.[0]?.role ?? "LANDLORD") as AppRole), replace: true });
    }
    setNotice("Account created. Check your email to confirm before signing in.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section
        className="hidden flex-col justify-between p-12 text-navy-foreground lg:flex"
        style={{ background: "var(--gradient-navy)" }}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            P
          </div>
          <span className="text-lg font-bold">PropertyMS</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Run your Kenyan rental portfolio from one place.
          </h2>
          <p className="mt-4 text-navy-foreground/70">
            Properties, units, tenants, MPESA rent collection in KES, invoices and maintenance —
            with separate portals for landlords, tenants and vendors.
          </p>
        </div>
        <p className="text-xs text-navy-foreground/50">Nairobi · KES · +254</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">
            {invitationToken ? "Accept Invitation" : "Welcome to PropertyMS"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invitationLoading
              ? "Loading invitation..."
              : invitation
                ? `You've been invited to join as a ${invitation.role === "VENDOR" ? "vendor" : "tenant"}`
                : "Sign in or create your landlord account."}
          </p>

          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {notice ? (
            <Alert className="mt-4">
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          ) : null}
          {invitationToken && !invitation && !invitationLoading && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                This invitation is invalid or has expired. Please contact your administrator.
              </AlertDescription>
            </Alert>
          )}

          {invitation ? (
            <div className="mt-6 space-y-4">
              <div className="card-surface p-4 flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Invitation for {invitation.email}</div>
                  <div className="text-xs text-muted-foreground">Role: {invitation.role}</div>
                </div>
              </div>
              <Tabs defaultValue="signup" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                </TabsList>
                <TabsContent value="signup">
                  <form onSubmit={onSignup} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          defaultValue={invitation.first_name}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          defaultValue={invitation.last_name}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                        defaultValue={invitation.email}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="login">
                  <form onSubmit={onLogin} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        required
                        defaultValue={invitation.email}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Tabs defaultValue="login" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={onLogin} className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSignup} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input id="orgName" name="orgName" required placeholder="Acme Properties Ltd" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+254712345678"
                      pattern="^\+254[17][0-9]{8}$"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Create landlord account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </main>
  );
}
