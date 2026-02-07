"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchJson } from "@/lib/utils";

type Faculty = {
  id: string;
  name: string;
};

type Career = {
  id: string;
  name: string;
  facultyId: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [careerId, setCareerId] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [facultiesResponse, careersResponse] = await Promise.all([
          fetchJson<Faculty[]>("/faculties"),
          fetchJson<Career[]>("/careers"),
        ]);
        setFaculties(facultiesResponse);
        setCareers(careersResponse);
      } catch {
        setFaculties([]);
        setCareers([]);
      }
    };
    void loadOptions();
  }, []);

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail || !password) {
      setError("Completa los datos obligatorios.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
          roles: ["ASISTENTE"],
          facultyId,
          careerId,
        }),
      });
      router.push("/auth/login");
    } catch {
      setError("No se pudo registrar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const availableCareers = facultyId
    ? careers.filter((career) => career.facultyId === facultyId)
    : careers;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-left-2 motion-safe:duration-300">
      <div className="grid overflow-hidden rounded-3xl border bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 p-10 text-white lg:flex">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
              Plataforma institucional
            </span>
            <h1 className="text-4xl font-semibold leading-tight">
              Crea tu cuenta y participa en eventos académicos.
            </h1>
            <p className="text-sm text-white/70">
              Inscripciones ágiles, control de cupos y certificados verificables en un solo lugar.
            </p>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Acceso con correo institucional
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Historial de eventos y certificados
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Roles asignados por administración
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="space-y-2 border-b bg-muted/20 px-8 py-6">
            <h2 className="text-xl font-semibold">Crear cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Completa tus datos para registrarte como asistente.
            </p>
          </div>
          <div className="grid gap-5 px-8 py-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nombre completo
              </div>
              <Input
                className="h-11"
                placeholder="Nombre y apellidos"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
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
                Facultad
              </div>
              <Select value={facultyId ?? ""} onValueChange={(value) => setFacultyId(value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona facultad" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.length === 0 ? (
                    <SelectItem value="__empty_faculty__" disabled>
                      Sin facultades
                    </SelectItem>
                  ) : (
                    faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Carrera
              </div>
              <Select value={careerId ?? ""} onValueChange={(value) => setCareerId(value)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecciona carrera" />
                </SelectTrigger>
                <SelectContent>
                  {availableCareers.length === 0 ? (
                    <SelectItem value="__empty_career__" disabled>
                      Sin carreras
                    </SelectItem>
                  ) : (
                    availableCareers.map((career) => (
                      <SelectItem key={career.id} value={career.id}>
                        {career.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Confirmar contraseña
              </div>
              <Input
                className="h-11"
                type="password"
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <Button className="h-11 w-full" onClick={handleRegister} disabled={loading}>
                {loading ? "Registrando..." : "Registrarme"}
              </Button>
              {error ? (
                <div className="text-sm text-destructive">{error}</div>
              ) : null}
              <div className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="hover:underline">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
