"use client";

import { useEffect, useState } from "react";
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
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    photoUrl: "",
  });

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    try {
      const data = await fetchJson<Speaker[]>("/speakers");
      setSpeakers(data);
    } catch (error) {
      console.error("Error loading speakers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpeaker = async () => {
    if (!form.fullName.trim()) {
      alert("Por favor ingrese el nombre completo del ponente");
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
    } catch (error) {
      alert("Error creando ponente");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSpeaker = async () => {
    if (!editing || !form.fullName.trim()) {
      alert("Por favor ingrese el nombre completo del ponente");
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
    } catch (error) {
      alert("Error actualizando ponente");
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
    } catch (error) {
      alert("Error eliminando ponente");
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

  if (loading) {
    return <div>Cargando ponentes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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

      <Card>
        <CardHeader>
          <CardTitle>Listado de Ponentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Biografía</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {speakers.map((speaker) => (
                <TableRow key={speaker.id}>
                  <TableCell>{speaker.id}</TableCell>
                  <TableCell>{speaker.fullName}</TableCell>
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
                    <div className="flex gap-2 justify-end">
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