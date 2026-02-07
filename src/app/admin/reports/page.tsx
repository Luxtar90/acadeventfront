import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reportes</h1>
        <p className="text-muted-foreground">
          Consulta métricas de eventos, asistencia y certificaciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Facultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ingenieria">Ingeniería</SelectItem>
              <SelectItem value="ciencias">Ciencias</SelectItem>
              <SelectItem value="economia">Economía</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" />
          <Input type="date" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">24</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inscripciones</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">1520</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Certificados</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">840</CardContent>
        </Card>
      </div>
    </div>
  );
}
