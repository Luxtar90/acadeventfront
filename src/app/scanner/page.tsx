"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiBaseUrl, fetchJson } from "@/lib/utils";
import RoleGuard from "@/components/role-guard";
import { useAlert } from "@/components/alert-provider";

type QrData = {
  registration: {
    event: { id: string; title: string };
    user: { fullName: string };
  };
};

type EventOption = {
  id: string;
  title: string;
  startAt?: string | null;
  endAt?: string | null;
};

export default function ScannerPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [result, setResult] = useState<QrData | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [scanError, setScanError] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const { notify } = useAlert();
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );
  const requestJson = async <T,>(path: string, init?: RequestInit) => {
    const baseUrl = apiBaseUrl();
    const url = baseUrl ? `${baseUrl}${path}` : `/api${path}`;
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
    });
    const text = await res.text();
    let data: T | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      const message =
        typeof (data as { message?: string | string[] } | null)?.message === "string"
          ? (data as { message?: string }).message
          : Array.isArray((data as { message?: string[] } | null)?.message)
            ? (data as { message?: string[] }).message?.join(", ")
            : `API error ${res.status}`;
      throw new Error(message);
    }
    return data as T;
  };

  const formatEventDate = (event: EventOption | null) => {
    if (!event?.startAt) return "Por confirmar";
    const start = new Date(event.startAt);
    if (Number.isNaN(start.getTime())) return "Por confirmar";
    const end = event.endAt ? new Date(event.endAt) : null;
    const sameDay =
      end && !Number.isNaN(end.getTime())
        ? start.toDateString() === end.toDateString()
        : true;
    const startLabel = start.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    if (!end || Number.isNaN(end.getTime())) {
      return startLabel;
    }
    const endLabel = end.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      ...(sameDay ? {} : { day: "2-digit", month: "short", year: "numeric" }),
    });
    return `${startLabel} - ${endLabel}`;
  };

  useEffect(() => {
    if (scannerRef.current && !scanner) {
      const qrScanner = new Html5Qrcode("qr-reader");
      setScanner(qrScanner);
    }

    return () => {
      if (scanner) {
        try {
          const state = scanner.getState();
          if (
            state === Html5QrcodeScannerState.SCANNING ||
            state === Html5QrcodeScannerState.PAUSED
          ) {
            scanner.stop().catch(() => undefined).finally(() => scanner.clear());
          } else {
            scanner.clear();
          }
        } catch {
          try {
            scanner.clear();
          } catch {
            return;
          }
        }
      }
    };
  }, [scanner]);

  useEffect(() => {
    if (!scanner) return;
    Html5Qrcode.getCameras()
      .then((devices) => {
        const mapped = devices.map((device, index) => ({
          id: device.id,
          label: device.label || `Cámara ${index + 1}`,
        }));
        setCameras(mapped);
        if (!selectedCameraId && mapped[0]) {
          setSelectedCameraId(mapped[0].id);
        }
      })
      .catch(() => {
        setCameraError("No se detectó cámara o no hay permisos.");
      });
  }, [scanner, selectedCameraId]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchJson<EventOption[]>("/events");
        setEvents(data);
        if (!selectedEventId && data[0]) {
          setSelectedEventId(data[0].id);
        }
      } catch {
        notify({
          title: "No se pudieron cargar los eventos",
          message: "Intenta recargar la página.",
          variant: "error",
        });
      }
    };
    loadEvents();
  }, [notify, selectedEventId]);

  const startScanning = async () => {
    if (!scanner || scanning) return;
    setCameraError("");
    setScanError("");
    setAttendanceStatus("");
    setResult(null);
    if (!selectedEventId) {
      notify({
        title: "Selecciona un evento",
        message: "Elige el evento que vas a escanear.",
        variant: "warning",
      });
      return;
    }
    if (!selectedCameraId) {
      setCameraError("Selecciona una cámara disponible para iniciar.");
      return;
    }
    setScanning(true);
    try {
      await scanner.start(
        { deviceId: { exact: selectedCameraId } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            const data = await requestJson<QrData | null>(`/qr-codes/verify/${decodedText}`);
            if (!data?.registration) {
              setResult(null);
              setScanError("QR inválido");
              setAttendanceStatus("");
              notify({
                title: "QR inválido",
                message: "No se encontró un registro válido para este QR.",
                variant: "error",
              });
              return;
            }
            setResult(data);
            setScanError("");
            setAttendanceStatus("");
            if (selectedEventId && data.registration.event.id !== selectedEventId) {
              setScanError("QR no corresponde al evento seleccionado");
              notify({
                title: "QR de otro evento",
                message: `Este QR pertenece a ${data.registration.event.title}.`,
                variant: "error",
              });
              return;
            }
            if (selectedEvent) {
              const now = new Date();
              const start = selectedEvent.startAt ? new Date(selectedEvent.startAt) : null;
              const end = selectedEvent.endAt ? new Date(selectedEvent.endAt) : null;
              const startTime = start && !Number.isNaN(start.getTime()) ? start.getTime() : null;
              const endTime = end && !Number.isNaN(end.getTime()) ? end.getTime() : null;
              if (
                startTime &&
                endTime &&
                (now.getTime() < startTime || now.getTime() > endTime)
              ) {
                setScanError("Fuera del horario del evento");
                notify({
                  title: "Fuera de fecha",
                  message: "El evento no está en el horario permitido.",
                  variant: "warning",
                });
                return;
              }
              if (startTime && !endTime) {
                const sameDay =
                  now.toDateString() === new Date(startTime).toDateString();
                if (!sameDay) {
                  setScanError("Fuera de la fecha del evento");
                  notify({
                    title: "Fuera de fecha",
                    message: "El evento no está programado para hoy.",
                    variant: "warning",
                  });
                  return;
                }
              }
            }
            try {
              await requestJson(`/events/${selectedEventId}/attendance/qr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrToken: decodedText }),
              });
              setAttendanceStatus("Asistencia registrada");
            } catch (error) {
              const message =
                error instanceof Error && error.message
                  ? error.message
                  : "No se pudo registrar asistencia";
              setAttendanceStatus(message);
              setScanError(message);
              notify({
                title: "No se pudo registrar",
                message,
                variant: "error",
              });
            }
          } catch (error) {
            const message =
              error instanceof Error && error.message
                ? error.message
                : "QR inválido o error al procesar";
            setScanError(message);
            setAttendanceStatus("");
            notify({
              title: "Error al procesar QR",
              message,
              variant: "error",
            });
          }
        },
        () => undefined
      );
    } catch {
      setScanning(false);
      setCameraError("No se pudo iniciar la cámara. Revisa permisos y que no esté en uso.");
    }
  };

  const stopScanning = async () => {
    if (!scanner) return;
    const state = scanner.getState();
    if (
      state !== Html5QrcodeScannerState.SCANNING &&
      state !== Html5QrcodeScannerState.PAUSED
    ) {
      setScanning(false);
      return;
    }
    try {
      await scanner.stop();
      await scanner.clear();
    } catch {
      return;
    } finally {
      setScanning(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["SCANNER"]}>
      <div className="space-y-10">
        <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
          <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                Modo escáner
              </div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Validación rápida de ingresos con QR.
              </h1>
              <p className="max-w-xl text-muted-foreground">
                Usa la cámara para registrar asistencia en segundos.
              </p>
              {selectedEvent ? (
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                  Escaneando: <span className="font-medium text-foreground">{selectedEvent.title}</span>
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button onClick={startScanning} disabled={scanning}>
                {scanning ? "Escaneando..." : "Iniciar escaneo"}
              </Button>
              <Button variant="outline" onClick={stopScanning}>
                Detener
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-muted/60 bg-white/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cámara</CardTitle>
              <Badge variant="outline" className={scanning ? "bg-emerald-50 text-emerald-700" : ""}>
                {scanning ? "Activa" : "En pausa"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Evento a escanear</div>
                <Select
                  value={selectedEventId}
                  onValueChange={(value) => {
                    setSelectedEventId(value);
                    setResult(null);
                    setScanError("");
                    setAttendanceStatus("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  {formatEventDate(selectedEvent)}
                </div>
              </div>
              {cameras.length > 0 ? (
                <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar cámara" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div id="qr-reader" ref={scannerRef} className="min-h-[320px] w-full" />
              </div>
              {cameraError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {cameraError}
                </div>
              ) : null}
              <div className="text-xs text-muted-foreground">
                Coloca el QR dentro del marco para validar el acceso.
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/60 bg-white/90">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Estado</div>
                <div className="mt-1 text-base font-semibold text-foreground">
                  {result ? "Validado" : "Esperando QR"}
                </div>
                {attendanceStatus ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {attendanceStatus}
                  </div>
                ) : null}
              </div>
              {scanError ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {scanError}
                </div>
              ) : null}
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Evento</div>
                  <div className="font-medium text-foreground">
                    {result?.registration.event.title || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Asistente</div>
                  <div className="font-medium text-foreground">
                    {result?.registration.user.fullName || "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
