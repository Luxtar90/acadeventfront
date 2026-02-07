"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Career {
  id: string;
  name: string;
  facultyId: string | null;
  faculty?: {
    id: string;
    name: string;
  };
}

interface Faculty {
  id: string;
  name: string;
}

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Career | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", facultyId: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [careersData, facultiesData] = await Promise.all([
        fetchJson<Career[]>("/careers"),
        fetchJson<Faculty[]>("/faculties"),
      ]);
      setCareers(careersData);
      setFaculties(facultiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCareer = async () => {
    if (!form.name.trim()) {
      alert("Por favor complete el nombre de la carrera");
      return;
    }

    setCreating(true);
    try {
      await fetchJson("/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          facultyId: form.facultyId === "none" ? null : form.facultyId,
        }),
      });

      setDialogOpen(false);
      setForm({ name: "", facultyId: "none" });
      loadData();
    } catch (error) {
      alert("Error creando carrera");
    } finally {
      setCreating(false);
    }
  };

  const handleEditCareer = async () => {
    if (!editing || !form.name.trim()) {
      alert("Por favor complete el nombre de la carrera");
      return;
    }

    setCreating(true);
    try {
      await fetchJson(`/careers/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          facultyId: form.facultyId === "none" ? null : form.facultyId,
        }),
      });

      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", facultyId: "none" });
      loadData();
    } catch (error) {
      alert("Error actualizando carrera");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateFaculty = async (careerId: string, facultyId: string | null) => {
    try {
      await fetchJson(`/careers/${careerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId }),
      });
      loadData();
    } catch (error) {
      alert("Error actualizando facultad");
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta carrera?")) {
      return;
    }

    try {
      await fetchJson(`/careers/${id}`, {
        method: "DELETE",
      });
      loadData();
    } catch (error) {
      alert("Error eliminando carrera");
    }
  };

  const openEditDialog = (career: Career) => {
    setEditing(career);
    setForm({
      name: career.name,
      facultyId: career.facultyId || "none",
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditing(null);
    setForm({ name: "", facultyId: "none" });
    setDialogOpen(true);
  };

  if (loading) {
    return <div>Cargando carreras...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Carreras</h1>
          <p className="text-muted-foreground">
            Gestiona las carreras y su relación con facultades.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Crear Carrera</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Carrera" : "Crear Nueva Carrera"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Carrera</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre de la carrera"
                />
              </div>
              <div>
                <Label htmlFor="faculty">Facultad</Label>
                <Select
                  value={form.facultyId}
                  onValueChange={(value) => setForm({ ...form, facultyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin facultad</SelectItem>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={editing ? handleEditCareer : handleCreateCareer}
                disabled={creating}
                className="w-full"
              >
                {creating
                  ? (editing ? "Actualizando..." : "Creando...")
                  : (editing ? "Actualizar Carrera" : "Crear Carrera")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Carreras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell>{career.id}</TableCell>
                  <TableCell>{career.name}</TableCell>
                  <TableCell>
                    <Select
                      value={career.facultyId || "none"}
                      onValueChange={(value) => handleUpdateFaculty(career.id, value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar facultad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin facultad</SelectItem>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(career)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCareer(career.id)}
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
