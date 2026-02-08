"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Speaker {
  id: string;
  fullName: string;
  bio: string | null;
  photoUrl: string | null;
}

export default function AdminSpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { notify } = useAlert();
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    photoUrl: "",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    try {
      const data = await fetchJson<Speaker[]>("/speakers");
      setSpeakers(data);
    } catch (error) {
      notify({
        title: "No se pudieron cargar los ponentes",
        message: "Intenta recargar la página.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpeaker = async () => {
    if (!form.fullName.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre completo del ponente.",
        variant: "warning",
      });
      return;
    }

    setCreating(true);
    try {
      await fetchJson("/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          bio: form.bio || null,
          photoUrl: form.photoUrl || null,
        }),
      });

      setDialogOpen(false);
      setForm({ fullName: "", bio: "", photoUrl: "" });
      loadSpeakers();
      notify({
        title: "Ponente creado",
        message: "El registro se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo crear el ponente",
        message: "Revisa la información e intenta nuevamente.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditSpeaker = async () => {
    if (!editing || !form.fullName.trim()) {
      notify({
        title: "Datos incompletos",
        message: "Ingresa el nombre completo del ponente.",
        variant: "warning",
      });
      return;
    }

    setCreating(true);
    try {
      await fetchJson(`/speakers/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          bio: form.bio || null,
          photoUrl: form.photoUrl || null,
        }),
      });

      setDialogOpen(false);
      setEditing(null);
      setForm({ fullName: "", bio: "", photoUrl: "" });
      loadSpeakers();
      notify({
        title: "Ponente actualizado",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar el ponente",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este ponente?")) {
      return;
    }

    try {
      await fetchJson(`/speakers/${id}`, {
        method: "DELETE",
      });
      loadSpeakers();
      notify({
        title: "Ponente eliminado",
        message: "El registro fue eliminado correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo eliminar el ponente",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    }
  };

  const openEditDialog = (speaker: Speaker) => {
    setEditing(speaker);
    setForm({
      fullName: speaker.fullName,
      bio: speaker.bio || "",
      photoUrl: speaker.photoUrl || "",
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditing(null);
    setForm({ fullName: "", bio: "", photoUrl: "" });
    setDialogOpen(true);
  };

  const filteredSpeakers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return speakers;
    return speakers.filter((speaker) => {
      const name = speaker.fullName.toLowerCase();
      const bio = speaker.bio?.toLowerCase() ?? "";
      return name.includes(query) || bio.includes(query);
    });
  }, [speakers, search]);

  if (loading) {
    return <div>Cargando ponentes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Ponentes</h1>
          <p className="text-muted-foreground">
            Gestiona los ponentes disponibles para los eventos.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>Crear Ponente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Ponente" : "Crear Nuevo Ponente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nombre completo del ponente"
                />
              </div>
              <div>
                <Label htmlFor="bio">Biografía (opcional)</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Breve biografía del ponente"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="photoUrl">URL de Foto (opcional)</Label>
                <Input
                  id="photoUrl"
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>
              <Button
                onClick={editing ? handleEditSpeaker : handleCreateSpeaker}
                disabled={creating}
                className="w-full"
              >
                {creating
                  ? (editing ? "Actualizando..." : "Creando...")
                  : (editing ? "Actualizar Ponente" : "Crear Ponente")
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-muted/60 bg-white/90 shadow-sm">
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Listado de Ponentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredSpeakers.length} ponentes encontrados
            </p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o biografía"
            className="w-72"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Biografía</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpeakers.map((speaker) => (
                <TableRow key={speaker.id}>
                  <TableCell className="text-muted-foreground">{speaker.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    {speaker.fullName}
                  </TableCell>
                  <TableCell>
                    {speaker.bio ? (
                      <span className="text-sm text-muted-foreground">
                        {speaker.bio.length > 50
                          ? `${speaker.bio.substring(0, 50)}...`
                          : speaker.bio
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sin biografía</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(speaker)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSpeaker(speaker.id)}
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
