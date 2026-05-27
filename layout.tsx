import { Link, useLocation } from "wouter";
import { Terminal, LayoutDashboard, KeyRound, LogOut, Users } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clearToken } = useAuth();
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearToken();
        setLocation("/login");
      },
      onError: () => {
        clearToken();
        setLocation("/login");
      },
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Terminal className="text-primary w-6 h-6" />
            <h2 className="font-bold text-lg tracking-wider uppercase text-primary">Void Admin</h2>
          </div>
          {user && (
            <div className="flex items-center gap-2 mt-2">
              <span className="font-mono text-sm font-bold text-muted-foreground">{user.username}</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${
                user.role === 'owner' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
              }`}>
                {user.role}
              </span>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider font-bold"
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/create"
            className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider font-bold"
            data-testid="nav-create"
          >
            <KeyRound className="w-4 h-4" />
            Generate Keys
          </Link>
          {user?.role === 'owner' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors uppercase tracking-wider font-bold"
              data-testid="nav-users"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-wider font-bold text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
