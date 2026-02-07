 "use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchJson } from "@/lib/utils";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Layers,
  QrCode,
  ScanLine,
  Shield,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [summary, setSummary] = useState<{
    totalEvents: number;
    totalRegistrations: number;
    totalCertified: number;
  } | null>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("acadevent_user");
      if (!storedUser) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const parsed = JSON.parse(storedUser);
        setIsLoggedIn(Boolean(parsed?.id));
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "acadevent_user") {
        checkUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await fetchJson<{
          totalEvents: number;
          totalRegistrations: number;
          totalCertified: number;
        }>("/reports/summary");
        setSummary(data);
      } catch {
        setSummary(null);
      }
    };
    loadSummary();
  }, []);

  const summaryItems = [
    {
      title: "Eventos activos",
      value: summary ? summary.totalEvents.toLocaleString("es-ES") : "—",
      detail: "Global",
    },
    {
      title: "Inscripciones confirmadas",
      value: summary ? summary.totalRegistrations.toLocaleString("es-ES") : "—",
      detail: "Global",
    },
    {
      title: "Certificados emitidos",
      value: summary ? summary.totalCertified.toLocaleString("es-ES") : "—",
      detail: "Global",
    },
  ];

  const highlights = [
    "Reportes listos para rectoría",
    "Control de cupos en tiempo real",
    "Certificados con verificación pública",
  ];

  const features = [
    {
      title: "Catálogo y difusión",
      description:
        "Explora eventos por fecha, facultad, modalidad o categoría desde una vista clara.",
      icon: CalendarDays,
    },
    {
      title: "Inscripciones y cupos",
      description:
        "Evita duplicados, habilita lista de espera y envía notificaciones internas.",
      icon: Users,
    },
    {
      title: "Asistencia inteligente",
      description:
        "Marca asistencia manual o por QR con registro automático de hora.",
      icon: QrCode,
    },
    {
      title: "Certificados verificables",
      description: "Genera PDFs con códigos únicos y página pública de verificación.",
      icon: BadgeCheck,
    },
    {
      title: "Reportes ejecutivos",
      description: "Estadísticas por evento, carrera, facultad o rango de fechas.",
      icon: BarChart3,
    },
    {
      title: "Escalable por fases",
      description: "Implementa módulos por etapas sin perder consistencia institucional.",
      icon: Layers,
    },
  ];

  const roles = [
    {
      title: "Administrador general",
      detail: "Configura facultades, gestiona organizadores y reportes globales.",
      icon: Shield,
    },
    {
      title: "Organizador",
      detail: "Crea eventos, controla cupos, ponentes y asistencia.",
      icon: ClipboardCheck,
    },
    {
      title: "Asistente",
      detail: "Se registra, consulta historial y descarga certificados.",
      icon: UserCheck,
    },
    {
      title: "Control de acceso",
      detail: "Valida QR en puerta sin permisos de edición.",
      icon: ScanLine,
    },
  ];

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-10 shadow-sm">
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge className="w-fit bg-primary/10 text-primary" variant="outline">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Plataforma institucional
              </span>
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Gestiona eventos académicos con una experiencia moderna y confiable.
            </h1>
            <p className="text-muted-foreground">
              AcadEvent centraliza catálogo, inscripciones, asistencia y certificados
              verificables para toda la universidad.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/events">Explorar eventos</Link>
              </Button>
              {!isLoggedIn ? (
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Ingresar al sistema</Link>
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            {summaryItems.map((item) => (
              <Card
                key={item.title}
                className="border-muted/60 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-3xl font-semibold">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.detail}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Todo el ciclo del evento en un lugar</h2>
            <p className="mt-2 text-muted-foreground">
              Diseñado para equipos académicos, logística y control de asistencia.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/events">Ver catálogo</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-muted/60 bg-card/80 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">{item.description}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Roles definidos para universidad</h2>
          <p className="text-muted-foreground">
            Cada perfil tiene flujos claros para operar eventos, mantener control y
            garantizar trazabilidad.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="rounded-2xl border bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {role.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{role.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
        <Card className="border-muted/60 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle>Visión institucional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Diseñada para facultades, carreras y unidades académicas, la plataforma
              garantiza gobernanza, métricas confiables y trazabilidad de asistencia.
            </p>
            <div className="space-y-2">
              {[
                "Publicación de eventos con requisitos y cupos",
                "Registro de asistentes internos y externos",
                "Control de asistencia por sesión",
                "Emisión automática de certificados con verificación",
                "Reportes exportables por filtros avanzados",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" asChild>
              <Link href="/auth/register">Solicitar acceso institucional</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
