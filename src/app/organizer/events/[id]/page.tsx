"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { fetchJson } from "@/lib/utils";

interface Faculty {
  id: string;
  name: string;
}

interface Speaker {
  id: string;
  fullName: string;
  bio: string | null;
  photoUrl: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  modality: string;
  capacity: number;
  requirements: string | null;
  startAt: string;
  endAt: string;
  organizerId: string;
  facultyId: string | null;
  careerId: string | null;
  speakers?: Speaker[];
}

interface EventForm {
  title: string;
  description: string;
  modality: string;
  location: string;
  capacity: number;
  requirements: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  facultyId: string;
  speakerIds: string[];
}

export default function OrganizerEditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    modality: "",
    location: "",
    capacity: 0,
    requirements: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    facultyId: "",
    speakerIds: [],
  });

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const data = await fetchJson<Faculty[]>("/faculties");
        setFaculties(data);
      } catch {
        // Ignore
      }
    };

    const loadSpeakers = async () => {
      try {
        const data = await fetchJson<Speaker[]>("/speakers");
        setSpeakers(data);
      } catch {
        // Ignore
      }
    };

    const loadEvent = async () => {
      try {
        const event = await fetchJson<Event>(`/events/${params.id}`);
        const startDate = new Date(event.startAt);
        const endDate = new Date(event.endAt);

        setForm({
          title: event.title,
          description: event.description,
          modality: event.modality.toLowerCase(),
          location: event.location,
          capacity: event.capacity,
          requirements: event.requirements || "",
          startDate: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0],
          endTime: endDate.toTimeString().slice(0, 5),
          facultyId: event.facultyId || "all",
          speakerIds: event.speakers?.map((speaker) => speaker.id) || [],
        });
      } catch (error) {
        alert("Error cargando evento");
        router.push("/organizer/dashboard");
      } finally {
        setFetchLoading(false);
      }
    };

    loadFaculties();
    loadSpeakers();
    if (params.id) {
      loadEvent();
    }
  }, [params.id, router]);

  const handleSubmit = async () => {
    const startAt = new Date(`${form.startDate}T${form.startTime}`).toISOString();
    const endAt = new Date(`${form.endDate}T${form.endTime}`).toISOString();

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      modality: form.modality.toUpperCase(),
      capacity: form.capacity,
      requirements: form.requirements || null,
      startAt,
      endAt,
      facultyId: form.facultyId === "all" ? null : form.facultyId || null,
      speakerIds: form.speakerIds,
    };

    setLoading(true);
    try {
      await fetchJson(`/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      router.push("/organizer/dashboard");
    } catch (error) {
      alert("Error actualizando evento");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div>Cargando evento...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Editar evento</h1>
        <p className="text-muted-foreground">
          Modifica la información del evento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del evento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Título</div>
            <Input
              placeholder="Nombre del evento"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Descripción</div>
            <Textarea
              placeholder="Describe el evento y sus objetivos"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Modalidad</div>
            <Select
              value={form.modality}
              onValueChange={(value) => setForm({ ...form, modality: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Facultad</div>
            <Select
              value={form.facultyId}
              onValueChange={(value) => setForm({ ...form, facultyId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona facultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las facultades</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Ubicación</div>
            <Input
              placeholder="Auditorio o enlace virtual"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Fecha inicio</div>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Fecha fin</div>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Hora inicio</div>
            <Input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Hora fin</div>
            <Input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Capacidad</div>
            <Input
              type="number"
              placeholder="0"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Requisitos</div>
            <Textarea
              placeholder="Requisitos para participar"
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="text-sm font-medium">Ponentes</div>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !form.speakerIds.includes(value)) {
                  setForm({ ...form, speakerIds: [...form.speakerIds, value] });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ponente" />
              </SelectTrigger>
              <SelectContent>
                {speakers
                  .filter((speaker) => !form.speakerIds.includes(speaker.id))
                  .map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id}>
                      {speaker.fullName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {form.speakerIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.speakerIds.map((speakerId) => {
                  const speaker = speakers.find((s) => s.id === speakerId);
                  return (
                    <Badge key={speakerId} variant="secondary" className="flex items-center gap-1">
                      {speaker?.fullName}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setForm({
                            ...form,
                            speakerIds: form.speakerIds.filter((id) => id !== speakerId),
                          })
                        }
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Actualizar evento"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}