"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/utils";
import RoleGuard from "@/components/role-guard";

type QrData = {
  registration: {
    event: { id: string; title: string };
    user: { fullName: string };
  };
};

export default function ScannerPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
  const [result, setResult] = useState<QrData | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scannerRef.current && !scanner) {
      const qrScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      setScanner(qrScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanner]);

  const startScanning = () => {
    if (scanner) {
      setScanning(true);
      scanner.render(
        async (decodedText) => {
          try {
            const data = await fetchJson<QrData>(`/qr-codes/verify/${decodedText}`);
            setResult(data);
            // Mark attendance
            const user = JSON.parse(localStorage.getItem("acadevent_user") || "{}");
            if (user.role === "SCANNER") {
              await fetchJson(`/attendance/events/${data.registration.event.id}/qr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrToken: decodedText }),
              });
            }
          } catch (error) {
            alert("QR inválido o error al procesar");
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear();
      setScanning(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["SCANNER"]}>
      <div className="space-y-6">
        <section className="rounded-3xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Modo escáner</h1>
          <p className="mt-2 text-muted-foreground">
            Usa la cámara para validar QR de asistentes en el ingreso.
          </p>
        </section>

        <Card className="border-muted/60 bg-white/90">
          <CardHeader>
            <CardTitle>Cámara</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div id="qr-reader" ref={scannerRef} className="w-full"></div>
            <div className="flex gap-2">
              <Button onClick={startScanning} disabled={scanning}>
                {scanning ? "Escaneando..." : "Iniciar escaneo"}
              </Button>
              <Button variant="outline" onClick={stopScanning}>
                Detener
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-white/90">
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Evento: {result?.registration.event.title || "—"}</div>
            <div>Asistente: {result?.registration.user.fullName || "—"}</div>
            <div>Estado: {result ? "Validado" : "—"}</div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
