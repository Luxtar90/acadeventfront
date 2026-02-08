"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiBaseUrl, fetchJson } from "@/lib/utils";
import { useAlert } from "@/components/alert-provider";

type User = {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  facultyId?: string | null;
  careerId?: string | null;
};

type AuthResponse = {
  user: User;
};

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const requestJson = async <T,>(path: string, init?: RequestInit) => {
    const baseUrl = apiBaseUrl();
    const url = baseUrl ? `${baseUrl}${path}` : `/api${path}`;
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
    });
    const text = await res.text();
    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      const message =
        typeof (data as { message?: string | string[] } | null)?.message === "string"
          ? (data as { message?: string }).message
          : Array.isArray((data as { message?: string[] } | null)?.message)
            ? (data as { message?: string[] }).message?.join(", ")
            : `API error ${res.status}`;
      throw new Error(message);
    }
    return data as T;
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      notify({
        title: "Datos incompletos",
        message: "Completa el correo y la contraseña.",
        variant: "warning",
      });
      return;
    }
    setLoading(true);
    try {
      const response = await requestJson<AuthResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });
      localStorage.setItem("acadevent_user", JSON.stringify(response.user));
      notify({
        title: "Sesión iniciada",
        message: "Bienvenido de nuevo.",
        variant: "success",
      });
      const { roles } = response.user;
      if (roles.includes("ADMIN")) {
        router.push("/admin/dashboard");
        return;
      }
      if (roles.includes("ORGANIZADOR")) {
        router.push("/organizer/dashboard");
        return;
      }
      if (roles.includes("SCANNER")) {
        router.push("/scanner");
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : "No se pudo iniciar sesión.";
      notify({
        title: "No se pudo iniciar sesión",
        message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-2 motion-safe:duration-300">
      <div className="grid overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 p-10 text-white lg:flex">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
              Plataforma institucional
            </span>
            <h1 className="text-4xl font-semibold leading-tight">
              Bienvenido de nuevo a AcadEvent.
            </h1>
            <p className="text-sm text-white/70">
              Accede a tus inscripciones, certificados y paneles según tu rol.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Historial y certificados en un solo lugar
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Control de asistencia con QR
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Reportes para cada facultad
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="space-y-2 border-b bg-muted/20 px-8 py-6">
            <h2 className="text-xl font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">
              Usa tu correo institucional para continuar.
            </p>
          </div>
          <div className="space-y-4 px-8 py-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Correo institucional
              </div>
              <Input
                className="h-11"
                type="email"
                placeholder="correo@universidad.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Contraseña
              </div>
              <Input
                className="h-11"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="h-11 w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <Link href="/auth/register" className="hover:underline">
                Crear cuenta
              </Link>
              <Link href="/verify" className="hover:underline">
                Verificar certificado
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
