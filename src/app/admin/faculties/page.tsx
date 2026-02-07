"use client";

import { useEffect, useState } from "react";
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
  const [form, setForm] = useState({ name: "" });

  useEffect(() => {
    loadFaculties();
  }, []);

  const loadFaculties = async () => {
    try {
      const data = await fetchJson<Faculty[]>("/faculties");
      setFaculties(data);
    } catch (error) {
      console.error("Error loading faculties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = async () => {
    if (!form.name.trim()) {
      alert("Por favor ingrese el nombre de la facultad");
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
    } catch (error) {
      alert("Error creando facultad");
    } finally {
      setCreating(false);
    }
  };

  const handleEditFaculty = async () => {
    if (!editing || !form.name.trim()) {
      alert("Por favor ingrese el nombre de la facultad");
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
    } catch (error) {
      alert("Error actualizando facultad");
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
    } catch (error) {
      alert("Error eliminando facultad");
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

  if (loading) {
    return <div>Cargando facultades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Listado de Facultades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell>{faculty.id}</TableCell>
                  <TableCell>{faculty.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
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
