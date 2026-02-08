"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAlert } from "@/components/alert-provider";

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
  const { notify } = useAlert();
  const [form, setForm] = useState({ name: "", facultyId: "" });
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");

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
      notify({
        title: "No se pudieron cargar los datos",
        message: "Intenta recargar la página.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCareer = async () => {
    if (!form.name.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre de la carrera.",
        variant: "warning",
      });
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
      notify({
        title: "Carrera creada",
        message: "El registro se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo crear la carrera",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditCareer = async () => {
    if (!editing || !form.name.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre de la carrera.",
        variant: "warning",
      });
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
      notify({
        title: "Carrera actualizada",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar la carrera",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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
      notify({
        title: "Facultad actualizada",
        message: "La relación se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar la facultad",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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
      notify({
        title: "Carrera eliminada",
        message: "El registro fue eliminado correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo eliminar la carrera",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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

  const filteredCareers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return careers.filter((career) => {
      const matchesFaculty =
        facultyFilter === "all" || career.facultyId === facultyFilter;
      if (!query) return matchesFaculty;
      const name = career.name.toLowerCase();
      return matchesFaculty && name.includes(query);
    });
  }, [careers, search, facultyFilter]);

  if (loading) {
    return <div>Cargando carreras...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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

      <Card className="border-muted/60 bg-white/90 shadow-sm">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Listado de Carreras</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredCareers.length} carreras encontradas
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar carrera"
              className="w-60"
            />
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filtrar por facultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las facultades</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCareers.map((career) => (
                <TableRow key={career.id}>
                  <TableCell className="text-muted-foreground">{career.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {career.name}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={career.facultyId || "none"}
                      onValueChange={(value) => handleUpdateFaculty(career.id, value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-72">
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
                    <div className="flex items-center justify-end gap-2">
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
