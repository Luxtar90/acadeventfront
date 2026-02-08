"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchJson } from "@/lib/utils";
import RoleGuard from "@/components/role-guard";
import { Award, CalendarDays, Sparkles, Ticket, UserCheck } from "lucide-react";

type Registration = {
  id: string;
  event: {
    id: string;
    title: string;
    startAt: string;
  };
  status: string;
};

type AttendanceRecord = {
  userId: string;
  present: boolean;
};

type QrCode = {
  qrToken: string;
};

type Certificate = {
  id: string;
  event: {
    title: string;
  };
  verificationCode: string;
};

export default function AssistantDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrTokens, setQrTokens] = useState<Record<string, string>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const buildQrImageUrl = (token: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(token)}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const raw = localStorage.getItem("acadevent_user");
        const parsed = raw ? JSON.parse(raw) : null;
        const userId = parsed?.id ?? parsed?.userId ?? parsed?._id ?? parsed?.user?.id;
        if (!userId) return;

        const [regs, certs] = await Promise.all([
          fetchJson<Registration[]>(`/users/${userId}/registrations`),
          fetchJson<Certificate[]>(`/users/${userId}/certificates`)
        ]);

        setRegistrations(regs);
        setCertificates(certs);
        const attendanceEntries = await Promise.allSettled(
          regs.map(async (registration) => {
            const eventId = registration.event?.id;
            if (!eventId) return null;
            const attendance = await fetchJson<AttendanceRecord[]>(`/events/${eventId}/attendance`);
            const attended = attendance.some(
              (record) => record.userId === userId && record.present
            );
            return [registration.id, attended] as const;
          })
        );
        const attendanceStatus: Record<string, boolean> = {};
        attendanceEntries.forEach((entry) => {
          if (entry.status === "fulfilled" && entry.value) {
            const [registrationId, attended] = entry.value;
            attendanceStatus[registrationId] = attended;
          }
        });
        setAttendanceMap(attendanceStatus);
        const qrEntries = await Promise.allSettled(
          regs.map(async (registration) => {
            const existing = await fetchJson<QrCode | null>(
              `/qr-codes/registrations/${registration.id}`
            );
            if (existing?.qrToken) {
              return [registration.id, existing.qrToken] as const;
            }
            if (registration.status === "INSCRITO") {
              const created = await fetchJson<QrCode>(
                `/qr-codes/registrations/${registration.id}`,
                { method: "POST" }
              );
              return [registration.id, created.qrToken] as const;
            }
            return null;
          })
        );
        const qrMap: Record<string, string> = {};
        qrEntries.forEach((entry) => {
          if (entry.status === "fulfilled" && entry.value) {
            const [registrationId, qrToken] = entry.value;
            qrMap[registrationId] = qrToken;
          }
        });
        setQrTokens(qrMap);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }
  const registrationsWithEvent = registrations.filter(
    (registration) => registration?.event?.startAt
  );
  const nextEvent =
    registrationsWithEvent
      .slice()
      .sort(
        (a, b) =>
          new Date(a.event.startAt).getTime() - new Date(b.event.startAt).getTime()
      )[0] ?? null;
  return (
    <RoleGuard allowedRoles={["ASISTENTE"]}>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Dashboard del asistente
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Todo tu historial académico en un solo lugar.
              </h1>
              <p className="max-w-xl text-muted-foreground">
                Consulta inscripciones, descarga certificados y revisa tu próximo evento.
              </p>
            </div>
            <Button asChild>
              <Link href="/events">Explorar eventos</Link>
            </Button>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <Ticket className="h-4 w-4 text-primary" />
              {registrations.length} inscripciones
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <Award className="h-4 w-4 text-primary" />
              {certificates.length} certificados
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
              <CalendarDays className="h-4 w-4 text-primary" />
              {nextEvent ? "Próximo evento confirmado" : "Sin próximos eventos"}
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Eventos inscritos",
              value: registrations.length.toString(),
              detail: "Activos",
              icon: UserCheck,
            },
            {
              title: "Certificados emitidos",
              value: certificates.length.toString(),
              detail: "Verificados",
              icon: Award,
            },
            {
              title: "Próximo evento",
              value: nextEvent
                ? new Date(nextEvent.event.startAt).toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })
                : "—",
              detail: nextEvent ? nextEvent.event.title : "Sin eventos",
              icon: CalendarDays,
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
              <CardContent className="space-y-2">
                <div className="text-3xl font-semibold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-muted/60 bg-white/90 shadow-sm">
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Mis inscripciones</CardTitle>
                <div className="text-xs text-muted-foreground">
                  Gestiona tus accesos y QR desde aquí.
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/events">Ver eventos</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {registrations.length === 0 ? (
                <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Aún no tienes inscripciones.
                </div>
              ) : (
                registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="relative overflow-hidden rounded-2xl border bg-muted/30 px-4 py-3 shadow-sm"
                  >
                    <div className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background" />
                    <div className="pointer-events-none absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full border bg-background" />
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <div>
                          <div className="font-medium">
                            {registration.event?.title ?? "Evento sin título"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Fecha:{" "}
                            {registration.event?.startAt
                              ? new Date(registration.event.startAt).toLocaleDateString("es-ES")
                              : "Por confirmar"}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{registration.status}</Badge>
                          {attendanceMap[registration.id] ? (
                            <Badge className="bg-emerald-100 text-emerald-700">Asistido</Badge>
                          ) : null}
                          {qrTokens[registration.id] ? (
                            <Badge variant="outline">QR listo</Badge>
                          ) : registration.status === "INSCRITO" ? (
                            <Badge variant="outline">QR pendiente</Badge>
                          ) : null}
                        </div>
                        {qrTokens[registration.id] ? (
                          <div className="text-xs text-muted-foreground">
                            Código QR: {qrTokens[registration.id]}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-center">
                        {qrTokens[registration.id] ? (
                          <div className="rounded-xl border bg-white/90 p-2 shadow-sm">
                            <img
                              src={buildQrImageUrl(qrTokens[registration.id])}
                              alt="QR de acceso"
                              className="h-[96px] w-[96px]"
                            />
                          </div>
                        ) : (
                          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground">
                            Sin QR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="border-muted/60 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>Mis certificados</CardTitle>
              <div className="text-xs text-muted-foreground">
                Acceso directo a la verificación de certificados.
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.length === 0 ? (
                <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Aún no tienes certificados emitidos.
                </div>
              ) : (
                certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{certificate.event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {certificate.verificationCode}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/verify?code=${certificate.verificationCode}`}>Verificar</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
