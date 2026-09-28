import Link from "next/link";
import { Logo } from "@/components/logo";
import { signOut } from "@/app/auth/actions";
import { Home, Settings, LogOut, Sparkles, Library } from "lucide-react";

export function AppShell({
  user,
  children,
}: {
  user: { email: string; isAnonymous: boolean };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border-subtle bg-bg-raised/60">
        <Link href="/app" className="flex h-14 items-center border-b border-border-subtle px-4">
          <Logo />
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          <NavLink href="/app" icon={Home}>Home</NavLink>
          <NavLink href="/app/library" icon={Library}>Library</NavLink>
          <NavLink href="/app/settings" icon={Settings}>Settings</NavLink>
        </nav>

        <div className="border-t border-border-subtle p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-text-muted">
            {user.isAnonymous ? (
              <>
                <Sparkles className="size-3.5 text-accent" />
                <span>Guest session</span>
              </>
            ) : (
              <span className="truncate">{user.email}</span>
            )}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:bg-bg-raised-2 hover:text-text"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-text-muted hover:bg-bg-raised-2 hover:text-text"
    >
      <Icon className="size-4" /> {children}
    </Link>
  );
}
