"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Briefcase,
  Users,
  Package,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

interface SidebarProps {
  userRole: string;
}

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["co_founder", "permanent_partner", "temporary_worker"] },
  { href: "/dashboard/income", label: "Income", icon: DollarSign, roles: ["co_founder", "permanent_partner"] },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt, roles: ["co_founder", "permanent_partner"] },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase, roles: ["co_founder", "permanent_partner", "temporary_worker"] },
  { href: "/dashboard/workers", label: "Workers", icon: Users, roles: ["co_founder"] },
  { href: "/dashboard/assets", label: "Assets", icon: Package, roles: ["co_founder", "permanent_partner"] },
  { href: "/dashboard/profile", label: "My Profile", icon: FileText, roles: ["co_founder", "permanent_partner", "temporary_worker"] },
  { href: "/dashboard/reports", label: "Reports", icon: FileText, roles: ["co_founder", "permanent_partner"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["co_founder", "permanent_partner"] },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 flex items-center justify-center">
            <Image
              src="/logo-placeholder.png"
              alt="AlphaGrid Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-lg">AlphaGrid</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <form action={signOut}>
          <Button type="submit" variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}

