"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleGuard from "@/components/role-guard";
import { fetchJson } from "@/lib/utils";
import { CalendarDays, ClipboardList, ScanLine, Sparkles, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  startAt: string;
  modality: string;
  _count?: {
    registrations?: number;
    attendance?: number;
    attendances?: number;
    attendees?: number;
  };
}

interface AttendanceRecord {
  present: boolean;
}

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const raw = localStorage.getItem("acadevent_user");
        const parsed = raw ? JSON.parse(raw) : null;
        const userId = parsed?.id ?? parsed?.userId ?? parsed?._id ?? parsed?.user?.id;
        if (!userId) return;
        const data = await fetchJson<Event[]>(`/events?organizerId=${userId}`);
        setEvents(data);
        const attendanceEntries = await Promise.allSettled(
          data.map(async (event) => {
            const attendance = await fetchJson<AttendanceRecord[]>(
              `/events/${event.id}/attendance`
            );
            const presentCount = attendance.filter((record) => record.present).length;
            return [event.id, presentCount] as const;
          })
        );
        const counts: Record<string, number> = {};
        attendanceEntries.forEach((entry) => {
          if (entry.status === "fulfilled") {
            const [eventId, count] = entry.value;
            counts[eventId] = count;
          }
        });
        setAttendanceMap(counts);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const totalRegistrations = events.reduce(
    (sum, event) => sum + (event._count?.registrations ?? 0),
    0
  );
  const totalAttendance = events.reduce(
    (sum, event) =>
      sum +
      (attendanceMap[event.id] ??
        event._count?.attendances ??
        event._count?.attendance ??
        event._count?.attendees ??
        0),
    0
  );

  return (
    <RoleGuard allowedRoles={["ORGANIZADOR"]}>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Panel del organizador
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Crea eventos con control total y métricas claras.
              </h1>
              <p className="max-w-xl text-muted-foreground">
                Gestiona inscripciones, asistencia y publicación desde un solo lugar.
              </p>
            </div>
            <Button asChild>
              <Link href="/organizer/events/create">Crear evento</Link>
            </Button>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <CalendarDays className="h-4 w-4 text-primary" />
              {events.length} eventos activos
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <Users className="h-4 w-4 text-primary" />
              {totalRegistrations} inscripciones
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <ScanLine className="h-4 w-4 text-primary" />
              {totalAttendance} asistencias
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Eventos publicados",
              value: events.length.toString(),
              detail: "Activos",
              icon: CalendarDays,
            },
            {
              title: "Inscripciones totales",
              value: totalRegistrations.toString(),
              detail: "Confirmadas",
              icon: ClipboardList,
            },
            {
              title: "Asistencia registrada",
              value: totalAttendance.toString(),
              detail: "Validada",
              icon: ScanLine,
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="border-muted/60 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-3xl font-semibold">{item.value}</span>
                <span className="text-xs text-muted-foreground">{item.detail}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-muted/60 bg-white/90">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Mis eventos</CardTitle>
              <div className="text-xs text-muted-foreground">
                Seguimiento de los eventos que organizas.
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/organizer/events">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                Cargando eventos...
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                No has creado eventos aún.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(event.startAt).toLocaleDateString()}</span>
                        <span>{event.modality}</span>
                      </div>
                      <div className="text-base font-semibold">{event.title}</div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full border bg-muted/30 px-2 py-1">
                        {(event._count?.registrations ?? 0).toString()} inscritos
                      </span>
                      <span className="rounded-full border bg-muted/30 px-2 py-1">
                        {(
                          attendanceMap[event.id] ??
                          event._count?.attendances ??
                          event._count?.attendance ??
                          event._count?.attendees ??
                          0
                        ).toString()} asistencias
                      </span>
                    </div>
                    <Button asChild className="mt-4 w-full">
                      <Link href={`/organizer/events/${event.id}`}>Ver detalles</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
