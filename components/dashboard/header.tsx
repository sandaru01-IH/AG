import { getCurrentUser } from "@/lib/actions/users";
import Image from "next/image";
import { User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Header() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <header className="flex h-16 items-center border-b bg-background px-6">
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-16 items-center border-b bg-background px-6">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-right">
            <p className="text-sm font-medium">{user.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role?.replace("_", " ")}
            </p>
          </div>
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {user.profile_photo_url ? (
              <Image
                src={user.profile_photo_url}
                alt={user.full_name}
                width={40}
                height={40}
                className="object-cover"
                unoptimized={user.profile_photo_url.includes('supabase.co')}
              />
            ) : (
              <span className="text-primary font-semibold">
                {user.full_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

