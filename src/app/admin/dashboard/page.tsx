import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RoleGuard from "@/components/role-guard";
import { BookOpen, GraduationCap, Mic, Sparkles, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Panel administrativo
            </div>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Supervisión integral de la plataforma académica.
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Gestiona usuarios, facultades, carreras y ponentes con métricas claras.
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Usuarios",
              value: "1,520",
              detail: "Usuarios registrados",
              href: "/admin/users",
              action: "Gestionar Usuarios",
              icon: Users,
            },
            {
              title: "Facultades",
              value: "8",
              detail: "Facultades configuradas",
              href: "/admin/faculties",
              action: "Gestionar Facultades",
              icon: GraduationCap,
            },
            {
              title: "Carreras",
              value: "24",
              detail: "Carreras registradas",
              href: "/admin/careers",
              action: "Gestionar Carreras",
              icon: BookOpen,
            },
            {
              title: "Ponentes",
              value: "15",
              detail: "Ponentes disponibles",
              href: "/admin/speakers",
              action: "Gestionar Ponentes",
              icon: Mic,
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="border-muted/60 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
                <Link href={item.href}>
                  <Button className="mt-3 w-full" size="sm">
                    {item.action}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-muted/60 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Acciones rápidas</CardTitle>
              <div className="text-xs text-muted-foreground">
                Accesos directos a tareas frecuentes.
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/admin/users", label: "Crear Usuario", icon: Users },
                { href: "/admin/faculties", label: "Nueva Facultad", icon: GraduationCap },
                { href: "/admin/careers", label: "Nueva Carrera", icon: BookOpen },
                { href: "/admin/speakers", label: "Nuevo Ponente", icon: Mic },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="w-full gap-2">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
