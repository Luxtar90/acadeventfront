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
import { fetchJson } from "@/lib/utils";
import { User, LogOut, Settings, Bell } from "lucide-react";

type Role = "ORGANIZADOR" | "ASISTENTE" | "ADMIN" | "SCANNER";

interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

interface NotificationItem {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NavItem {
  href: string;
  label: string;
  roles?: Role[];
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/auth/register");
  const normalizeRole = (role?: string): Role | null => {
    if (!role) return null;
    const upper = role.toUpperCase();
    if (upper === "ORGANIZER") return "ORGANIZADOR";
    if (upper === "ASSISTANT" || upper === "STUDENT") return "ASISTENTE";
    if (upper === "ADMIN") return "ADMIN";
    if (upper === "ORGANIZADOR") return "ORGANIZADOR";
    if (upper === "ASISTENTE") return "ASISTENTE";
    if (upper === "SCANNER") return "SCANNER";
    return null;
  };
  const userRoles = (user?.roles ?? [])
    .map((role) => normalizeRole(role))
    .filter((role): role is Role => Boolean(role));
  const hasRole = (roles?: Role[]) =>
    !roles || roles.some((role) => userRoles.includes(role));
  const navItems: NavItem[] = [
    { href: "/events", label: "Eventos" },
    { href: "/dashboard", label: "Dashboard", roles: ["ASISTENTE"] },
    { href: "/organizer/dashboard", label: "Organizador", roles: ["ORGANIZADOR"] },
    { href: "/admin/dashboard", label: "Admin", roles: ["ADMIN"] },
    { href: "/scanner", label: "Scanner", roles: ["SCANNER", "ORGANIZADOR"] },
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

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    let active = true;
    setNotificationsLoading(true);
    fetchJson<NotificationItem[]>(`/notifications/users/${user.id}`)
      .then((data) => {
        if (active) {
          setNotifications(data);
        }
      })
      .catch(() => {
        if (active) {
          setNotifications([]);
        }
      })
      .finally(() => {
        if (active) {
          setNotificationsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const formatNotificationDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

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
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 p-0">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="border-b px-4 py-3">
                    <div className="text-sm font-semibold">Notificaciones</div>
                    <div className="text-xs text-muted-foreground">
                      {notificationsLoading
                        ? "Cargando mensajes..."
                        : `${notifications.length} mensajes`}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-4 text-sm text-muted-foreground">
                        Preparando notificaciones...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-muted-foreground">
                        No tienes notificaciones por ahora.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex flex-col gap-1 border-b px-4 py-3 text-sm last:border-b-0"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-foreground">Mensaje</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                notification.isRead
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {notification.isRead ? "Leída" : "Nueva"}
                            </span>
                          </div>
                          <div className="text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatNotificationDate(notification.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
            </>
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
