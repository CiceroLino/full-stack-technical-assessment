"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LayoutDashboard, CheckSquare, Users, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth-client";
import { toast } from "sonner";

type NavigationItem = {
  name: string;
  href: "/dashboard" | "/dashboard/tasks" | "/dashboard/users";
  icon: typeof LayoutDashboard;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = auth.useSession();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logout realizado com sucesso!");
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
    { name: "Usuários", href: "/dashboard/users", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b px-6">
            <h1 className="text-xl font-bold text-primary">T3 Tasks</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name ?? "Usuário"}
              </p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm lg:px-8">
          <div className="flex items-center lg:hidden">
            <div className="w-10" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Bem-vindo, {session?.user?.name ?? "Usuário"}!
          </h2>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {session?.user?.email}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
