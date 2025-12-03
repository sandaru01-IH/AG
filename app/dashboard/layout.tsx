import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/actions/users";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={currentUser.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={
          <header className="flex h-16 items-center border-b bg-background px-6">
            <Skeleton className="h-8 w-32" />
          </header>
        }>
          <Header />
        </Suspense>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Suspense fallback={<div className="space-y-6"><Skeleton className="h-96 w-full" /></div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

