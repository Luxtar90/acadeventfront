"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchJson } from "@/lib/utils";
import { useAlert } from "@/components/alert-provider";
import { Mail, Save, Sparkles, User2 } from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  facultyId?: string;
  careerId?: string;
}

interface Faculty {
  id: string;
  name: string;
}

interface Career {
  id: string;
  name: string;
  facultyId: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { notify } = useAlert();

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem("acadevent_user");
        if (!storedUser) {
          router.push("/auth/login");
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const [facs, cars] = await Promise.all([
          fetchJson<Faculty[]>("/faculties"),
          fetchJson<Career[]>("/careers"),
        ]);
        setFaculties(facs);
        setCareers(cars);
      } catch (error) {
        notify({
          title: "No se pudo cargar el perfil",
          message: "Intenta recargar la página.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const response = await fetchJson<User>(`/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          facultyId: user.facultyId || null,
          careerId: user.careerId || null,
        }),
      });
      localStorage.setItem("acadevent_user", JSON.stringify(response));
      notify({
        title: "Perfil actualizado",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar el perfil",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!user) {
    return <div className="p-8">Usuario no encontrado</div>;
  }

  const filteredCareers = careers.filter(c => c.facultyId === user.facultyId);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Editar perfil
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Mantén tu información académica actualizada.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Gestiona tus datos personales y selecciona la facultad y carrera correctas.
          </p>
        </div>
      </section>

      <Card className="border-muted/60 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Información personal</CardTitle>
            <div className="text-xs text-muted-foreground">
              Los datos se reflejarán en tus inscripciones y certificados.
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Nombre completo
            </div>
            <div className="relative">
              <User2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fullName"
                className="h-11 pl-10"
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Correo electrónico
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                className="h-11 pl-10"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Facultad
            </div>
            <Select
              value={user.facultyId || ""}
              onValueChange={(value) => setUser({ ...user, facultyId: value, careerId: undefined })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona facultad" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Carrera
            </div>
            <Select
              value={user.careerId || ""}
              onValueChange={(value) => setUser({ ...user, careerId: value })}
              disabled={!user.facultyId}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecciona carrera" />
              </SelectTrigger>
              <SelectContent>
                {filteredCareers.map((career) => (
                  <SelectItem key={career.id} value={career.id}>
                    {career.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
