import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizerScannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Scanner de asistencia</h1>
        <p className="text-muted-foreground">
          Valida accesos para el evento seleccionado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cámara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
            Vista de cámara (pendiente de integrar QR)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Última validación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Nombre: —</div>
          <div>Estado: —</div>
          <div>Hora: —</div>
        </CardContent>
      </Card>
    </div>
  );
}
