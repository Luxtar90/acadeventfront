"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { notify } = useAlert();
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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const roleOptions = ["ADMIN", "ORGANIZER", "ASSISTANT", "SCANNER", "STUDENT"];

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
      notify({
        title: "No se pudieron cargar los usuarios",
        message: "Intenta recargar la página.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!form.fullName || !form.email || !form.password || form.roles.length === 0) {
      notify({
        title: "Datos incompletos",
        message: "Completa los campos obligatorios y selecciona un rol.",
        variant: "warning",
      });
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
      notify({
        title: "Usuario creado",
        message: "El registro se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo crear el usuario",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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
      notify({
        title: "Rol actualizado",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar el rol",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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
      notify({
        title: "Datos incompletos",
        message: "Completa los campos requeridos.",
        variant: "warning",
      });
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
      notify({
        title: "Usuario actualizado",
        message: "Los cambios se guardaron correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar el usuario",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
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

  const handleUpdateCareer = async (userId: string, careerId: string | null) => {
    try {
      await fetchJson(`/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerId }),
      });
      loadData();
      notify({
        title: "Carrera actualizada",
        message: "La relación se guardó correctamente.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "No se pudo actualizar la carrera",
        message: "Intenta de nuevo en unos segundos.",
        variant: "error",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
      if (!query) return matchesRole;
      const name = user.fullName?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      return matchesRole && (name.includes(query) || email.includes(query));
    });
  }, [users, search, roleFilter]);

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Listado de Usuarios</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} usuarios encontrados
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o email"
              className="w-64"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
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
                <TableHead>Usuario</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground">{user.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">
                        {user.fullName || "Sin nombre"}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className="bg-muted/30">
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
                      <SelectTrigger className="w-52">
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
                      <SelectTrigger className="w-48">
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(user)}
                      >
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            Roles
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Asignar roles</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {roleOptions.map((role) => (
                            <DropdownMenuCheckboxItem
                              key={role}
                              checked={user.roles.includes(role)}
                              onCheckedChange={() => handleRoleChange(user.id, role)}
                            >
                              {role}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
