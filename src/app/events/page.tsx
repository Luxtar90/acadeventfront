"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchJson } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CalendarDays, Filter, Search, Sparkles } from "lucide-react";

type Faculty = {
  id: string;
  name: string;
};
type EventItem = {
  id: string;
  title: string;
  modality: string;
  capacity: number;
  startAt: string;
  facultyId: string | null;
  faculty?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    registrations: number;
  };
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

async function getEvents(filters: {
  title?: string;
  modality?: string;
  facultyId?: string;
  startDate?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (filters.title) params.append('title', filters.title);
    if (filters.modality && filters.modality !== 'all') params.append('modality', filters.modality.toUpperCase());
    if (filters.facultyId && filters.facultyId !== 'all') params.append('facultyId', filters.facultyId);
    if (filters.startDate) params.append('startFrom', filters.startDate);

    const url = `/events${params.toString() ? `?${params.toString()}` : ''}`;
    return await fetchJson<EventItem[]>(url);
  } catch {
    return [];
  }
}

async function getFaculties() {
  try {
    return await fetchJson<Faculty[]>("/faculties");
  } catch {
    return [];
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    modality: '',
    facultyId: '',
    startDate: '',
  });

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
    const loadData = async () => {
      setLoading(true);
      try {
        const [eventsData, facultiesData] = await Promise.all([
          getEvents(filters),
          getFaculties()
        ]);
        setEvents(eventsData);
        setFaculties(facultiesData);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const activeFilters = Object.values(filters).filter(value => Boolean(value)).length;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border bg-card/80 p-8 shadow-sm md:p-10">
        <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit bg-primary/10 text-primary">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Catálogo institucional
              </span>
            </Badge>
            <h1 className="text-3xl font-semibold md:text-4xl">
              Eventos académicos disponibles
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Filtra por fecha, facultad, modalidad y encuentra experiencias formativas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isLoggedIn ? (
              <Button asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/dashboard">Mis eventos</Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
            <CalendarDays className="h-4 w-4 text-primary" />
            {events.length} eventos activos
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
            <Filter className="h-4 w-4 text-primary" />
            {activeFilters ? `${activeFilters} filtros activos` : "Sin filtros"}
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1">
            <Search className="h-4 w-4 text-primary" />
            {faculties.length} facultades
          </div>
        </div>
      </section>

      <Card className="border-muted/60 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Filtros rápidos</CardTitle>
              <div className="text-xs text-muted-foreground">
                Encuentra eventos con los criterios que necesites.
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {activeFilters ? `${activeFilters} filtros activos` : "Sin filtros"}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2 md:grid-cols-4">
          <Input
            className="w-full"
            placeholder="Buscar por nombre"
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
          />
          <Select
            value={filters.modality}
            onValueChange={(value) => handleFilterChange('modality', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="PRESENCIAL">Presencial</SelectItem>
              <SelectItem value="VIRTUAL">Virtual</SelectItem>
              <SelectItem value="HIBRIDO">Híbrido</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.facultyId}
            onValueChange={(value) => handleFilterChange('facultyId', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Facultad" />
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
          <Input
            className="w-full"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="rounded-2xl border bg-white/80 p-8 text-center">
          <p>Cargando eventos...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border bg-white/80 p-8 text-center text-sm text-muted-foreground">
          <div className="text-base font-semibold text-foreground">
            {Object.values(filters).some(v => v) ? "No se encontraron eventos con los filtros aplicados." : "Aún no hay eventos publicados."}
          </div>
          <p className="mt-2">
            {Object.values(filters).some(v => v) ? "Prueba con otros filtros." : "Pronto aparecerán las nuevas charlas y talleres de tu facultad."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => {
            const registered = event._count?.registrations || 0;
            const available = Math.max(0, event.capacity - registered);
            return (
              <Card
                key={event.id}
                className="flex flex-col border-muted/60 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {event.modality}
                    </Badge>
                    <span>{formatDate(event.startAt)}</span>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                    <span>Facultad</span>
                    <span className="font-medium text-foreground">
                      {event.faculty?.name ?? "Todas las facultades"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                    <span>Cupos disponibles</span>
                    <span className="font-semibold text-foreground">{available}</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>Ver detalle</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
