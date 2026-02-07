"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  facultyId: string | null;
  careerId: string | null;
}

interface Faculty {
  id: string;
  name: string;
}

interface Career {
  id: string;
  name: string;
}

interface CreateUserForm {
  fullName: string;
  email: string;
  password: string;
  roles: string[];
  facultyId: string | null;
  careerId: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    fullName: "",
    email: "",
    password: "",
    roles: [],
    facultyId: null,
    careerId: null,
  });
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    roles: [] as string[],
    facultyId: null as string | null,
    careerId: null as string | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, facultiesData, careersData] = await Promise.all([
        fetchJson<User[]>("/users"),
        fetchJson<Faculty[]>("/faculties"),
        fetchJson<Career[]>("/careers"),
      ]);
      setUsers(usersData);
      setFaculties(facultiesData);
      setCareers(careersData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!form.fullName || !form.email || !form.password || form.roles.length === 0) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    setCreating(true);
    try {
      await fetchJson("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setDialogOpen(false);
      setForm({
        fullName: "",
        email: "",
        password: "",
        roles: [],
        facultyId: null,
        careerId: null,
      });
      loadData();
    } catch (error) {
      alert("Error creando usuario");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const updatedRoles = user.roles.includes(newRole)
        ? user.roles.filter(r => r !== newRole)
        : [...user.roles.filter(r => r !== newRole), newRole];

      await fetchJson(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: updatedRoles }),
      });

      loadData();
    } catch (error) {
      alert("Error actualizando rol");
    }
  };

  const openEditDialog = (user: User) => {
    setEditing(user);
    setEditForm({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      roles: [...user.roles],
      facultyId: user.facultyId,
      careerId: user.careerId,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editing) return;

    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    setUpdating(true);
    try {
      await fetchJson(`/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      setEditDialogOpen(false);
      setEditing(null);
      loadData();
    } catch (error) {
      alert("Error actualizando usuario");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateFaculty = async (userId: string, facultyId: string | null) => {
    try {
      await fetchJson(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId }),
      });
      loadData();
    } catch (error) {
      alert("Error actualizando facultad");
    }
  };

  const handleUpdateCareer = async (userId: string, careerId: string | null) => {
    try {
      await fetchJson(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerId }),
      });
      loadData();
    } catch (error) {
      alert("Error actualizando carrera");
    }
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Usuarios</h1>
          <p className="text-muted-foreground">
            Administra roles y acceso de los usuarios.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Crear Usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={form.fullName ?? ""}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Contraseña"
                />
              </div>
              <div>
                <Label>Roles</Label>
                <div className="flex gap-2 mt-2">
                  {["ADMIN", "ORGANIZER", "ASSISTANT", "SCANNER", "STUDENT"].map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={form.roles.includes(role) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newRoles = form.roles.includes(role)
                          ? form.roles.filter(r => r !== role)
                          : [...form.roles, role];
                        setForm({ ...form, roles: newRoles });
                      }}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="faculty">Facultad (opcional)</Label>
                <Select
                  value={form.facultyId || "none"}
                  onValueChange={(value) => setForm({ ...form, facultyId: value === "none" ? null : value })}
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
              <div>
                <Label htmlFor="career">Carrera (opcional)</Label>
                <Select
                  value={form.careerId || "none"}
                  onValueChange={(value) => setForm({ ...form, careerId: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin carrera</SelectItem>
                    {careers.map((career) => (
                      <SelectItem key={career.id} value={career.id}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal de Edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-fullName">Nombre Completo</Label>
              <Input
                id="edit-fullName"
                value={editForm.fullName ?? ""}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="flex gap-2 mt-2">
                {["ADMIN", "ORGANIZER", "ASSISTANT", "SCANNER", "STUDENT"].map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={editForm.roles.includes(role) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newRoles = editForm.roles.includes(role)
                        ? editForm.roles.filter(r => r !== role)
                        : [...editForm.roles, role];
                      setEditForm({ ...editForm, roles: newRoles });
                    }}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-faculty">Facultad (opcional)</Label>
              <Select
                value={editForm.facultyId || "none"}
                onValueChange={(value) => setEditForm({ ...editForm, facultyId: value === "none" ? null : value })}
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
            <div>
              <Label htmlFor="edit-career">Carrera (opcional)</Label>
              <Select
                value={editForm.careerId || "none"}
                onValueChange={(value) => setEditForm({ ...editForm, careerId: value === "none" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar carrera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin carrera</SelectItem>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleUpdateUser}
              disabled={updating}
              className="w-full"
            >
              {updating ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.facultyId || "none"}
                      onValueChange={(value) => handleUpdateFaculty(user.id, value === "none" ? null : value)}
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
                  <TableCell>
                    <Select
                      value={user.careerId || "none"}
                      onValueChange={(value) => handleUpdateCareer(user.id, value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin carrera</SelectItem>
                        {careers.map((career) => (
                          <SelectItem key={career.id} value={career.id}>
                            {career.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                      >
                        Editar
                      </Button>
                      <div className="flex gap-1">
                        {["ADMIN", "ORGANIZER", "ASSISTANT", "SCANNER", "STUDENT"].map((role) => (
                          <Button
                            key={role}
                            size="sm"
                            variant={user.roles.includes(role) ? "default" : "outline"}
                            onClick={() => handleRoleChange(user.id, role)}
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
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
