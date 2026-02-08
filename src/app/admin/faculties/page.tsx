"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchJson } from "@/lib/utils";
import { useAlert } from "@/components/alert-provider";

interface Faculty {
  id: string;
  name: string;
}

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { notify } = useAlert();
  const [form, setForm] = useState({ name: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const data = await fetchJson<Faculty[]>("/faculties");
      setFaculties(data);
    } catch (error) {
      notify({
        title: "No se pudieron cargar las facultades",
        message: "Intenta recargar la página.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async () => {
    if (!form.name.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre de la facultad.",
        variant: "warning",
      });
      return;
    }

    setCreating(true);
    try {
      await fetchJson("/faculties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });

      setDialogOpen(false);
      setForm({ name: "" });
      loadFaculties();
      notify({
        title: "Facultad creada",
        message: "El registro se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo crear la facultad",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditFaculty = async () => {
    if (!editing || !form.name.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre de la facultad.",
        variant: "warning",
      });
      return;
    }

    setCreating(true);
    try {
      await fetchJson(`/faculties/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });

      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "" });
      loadFaculties();
      notify({
        title: "Facultad actualizada",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar la facultad",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta facultad?")) {
      return;
    }

    try {
      await fetchJson(`/faculties/${id}`, {
        method: "DELETE",
      });
      loadFaculties();
      notify({
        title: "Facultad eliminada",
        message: "El registro fue eliminado correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo eliminar la facultad",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    }
  };

  const openEditDialog = (faculty: Faculty) => {
    setEditing(faculty);
    setForm({ name: faculty.name });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditing(null);
    setForm({ name: "" });
    setDialogOpen(true);
  };

  const filteredFaculties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faculties;
    return faculties.filter((faculty) => faculty.name.toLowerCase().includes(query));
  }, [faculties, search]);

  if (loading) {
    return <div>Cargando facultades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Facultades</h1>
          <p className="text-muted-foreground">
            Administra las facultades disponibles en el sistema.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Crear Facultad</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Facultad" : "Crear Nueva Facultad"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Facultad</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  placeholder="Nombre de la facultad"
                />
              </div>
              <Button
                onClick={editing ? handleEditFaculty : handleCreateFaculty}
                disabled={creating}
                className="w-full"
              >
                {creating
                  ? (editing ? "Actualizando..." : "Creando...")
                  : (editing ? "Actualizar Facultad" : "Crear Facultad")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-muted/60 bg-white/90 shadow-sm">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Listado de Facultades</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredFaculties.length} facultades encontradas
            </p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar facultad"
            className="w-64"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell className="text-muted-foreground">{faculty.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {faculty.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(faculty)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteFaculty(faculty.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
