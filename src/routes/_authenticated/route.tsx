import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarContentBody } from "@/components/pms/Sidebar";
import { TopBar } from "@/components/pms/TopBar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSession, roleHome } from "@/lib/session";
import { canAccess } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-[250px] shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 w-[250px]">
          <SidebarContentBody />
        </div>
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[250px] border-0 p-0">
          <SidebarContentBody onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <RoleGuard />
        </main>
      </div>
    </div>
  );
}

function RoleGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!canAccess(pathname, session?.role)) {
    const home = roleHome(session?.role);
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is not part of your portal. You only have access to information relating to your
          own account.
        </p>
        <Button asChild className="mt-5">
          <Link to={home}>Go to my portal</Link>
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
