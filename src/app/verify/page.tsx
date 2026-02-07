"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/utils";

type Certificate = {
  id: string;
  eventId: string;
  userId: string;
  verificationCode: string;
  pdfUrl: string | null;
  issuedAt: string;
};

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setResult(null);
      setError("Ingresa un código válido.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchJson<Certificate>(`/certificates/verify/${trimmed}`);
      setResult(data);
    } catch {
      setError("No se encontró el certificado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg border-muted/60 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle>Verificar certificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Código de verificación</div>
            <Input
              placeholder="Ingresa el código del certificado"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleVerify} disabled={loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
          <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            {error
              ? `Resultado: ${error}`
              : result
                ? `Resultado: Certificado ${result.id} para evento ${result.eventId}.`
                : "Resultado: Ingresa el código para validar el certificado."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
