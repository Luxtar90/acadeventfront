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
        console.error("Error loading data:", error);
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
      alert("Perfil actualizado correctamente");
    } catch (error) {
      alert("Error actualizando perfil");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Editar perfil</h1>
        <p className="text-muted-foreground">
          Actualiza tu información personal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Nombre completo</div>
            <Input
              id="fullName"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Correo electrónico</div>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Facultad</div>
            <Select
              value={user.facultyId || ""}
              onValueChange={(value) => setUser({ ...user, facultyId: value, careerId: undefined })}
            >
              <SelectTrigger>
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
            <div className="text-sm font-medium">Carrera</div>
            <Select
              value={user.careerId || ""}
              onValueChange={(value) => setUser({ ...user, careerId: value })}
              disabled={!user.facultyId}
            >
              <SelectTrigger>
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
          <div className="md:col-span-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}