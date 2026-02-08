"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

type Role = "ADMIN" | "ORGANIZADOR" | "ASISTENTE" | "SCANNER";

type StoredUser = {
  roles: string[];
};

const roleRedirects: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  ORGANIZADOR: "/organizer/dashboard",
  ASISTENTE: "/dashboard",
  SCANNER: "/scanner",
};

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

export default function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { allowed, redirectTo } = useMemo(() => {
    if (typeof window === "undefined") {
      return { allowed: false, redirectTo: "/auth/login" };
    }
    try {
      const raw = localStorage.getItem("acadevent_user");
      if (!raw) {
        return { allowed: false, redirectTo: "/auth/login" };
      }
      const user = JSON.parse(raw) as StoredUser;
      const normalizedRoles = (user?.roles ?? [])
        .map((role) => normalizeRole(role))
        .filter((role): role is Role => Boolean(role));
      if (!normalizedRoles.some((role) => allowedRoles.includes(role))) {
        const primaryRole = normalizedRoles[0];
        const target =
          primaryRole && roleRedirects[primaryRole] ? roleRedirects[primaryRole] : "/auth/login";
        return { allowed: false, redirectTo: target };
      }
      return { allowed: true, redirectTo: null };
    } catch {
      return { allowed: false, redirectTo: "/auth/login" };
    }
  }, [allowedRoles]);

  useEffect(() => {
    if (!allowed && redirectTo) {
      router.replace(redirectTo);
    }
  }, [allowed, redirectTo, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
