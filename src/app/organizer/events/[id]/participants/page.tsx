import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const participants = [
  { id: "u1", name: "María Soto", status: "Inscrito" },
  { id: "u2", name: "Luis Ramos", status: "Lista de espera" },
  { id: "u3", name: "Ana Pardo", status: "Inscrito" },
];

export default function OrganizerParticipantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Participantes</h1>
          <p className="text-muted-foreground">
            Lista de inscritos y estado de asistencia.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/1/scanner">Abrir scanner</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{participant.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Marcar asistencia
                    </Button>
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
