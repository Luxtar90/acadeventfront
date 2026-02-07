"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/auth/register");
  const userRoles = user?.roles ?? [];
  const hasRole = (roles?: string[]) =>
    !roles || roles.some((role) => userRoles.includes(role));
  const navItems = [
    { href: "/events", label: "Eventos" },
    { href: "/dashboard", label: "Dashboard", roles: ["ASISTENTE"] },
    { href: "/organizer/dashboard", label: "Organizador", roles: ["ORGANIZADOR"] },
    { href: "/admin/dashboard", label: "Admin", roles: ["ADMIN"] },
    { href: "/scanner", label: "Scanner", roles: ["SCANNER"] },
    {
      href: "/notifications",
      label: "Notificaciones",
      roles: ["ADMIN", "ORGANIZADOR", "ASISTENTE", "SCANNER"],
    },
  ];

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("acadevent_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("acadevent_user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "acadevent_user") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("acadevent_user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            AcadEvent
          </Link>
          <span className="hidden rounded-full border px-2 py-1 text-xs text-muted-foreground md:inline-flex">
            Gestión académica institucional
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {navItems
            .filter((item) => (user ? hasRole(item.roles) : !item.roles))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 transition hover:bg-muted/70 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {user.fullName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Editar perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="relative grid w-56 grid-cols-2 rounded-full bg-muted/40 p-1 text-sm">
              <span
                className={`absolute inset-y-1 left-1 w-1/2 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                  isRegister ? "translate-x-full" : ""
                }`}
              />
              <Link
                href="/auth/login"
                className={`relative z-10 rounded-full px-3 py-2 text-center font-medium transition-colors ${
                  isRegister ? "text-muted-foreground hover:text-foreground" : "text-foreground"
                }`}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className={`relative z-10 rounded-full px-3 py-2 text-center font-medium transition-colors ${
                  isRegister ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
