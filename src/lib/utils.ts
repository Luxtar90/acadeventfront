import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function apiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://acadeventfrontfinal.vercel.app"
  const trimmed = raw.replace(/\/$/, "")
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  return `https://${trimmed}`
}

export async function fetchJson<T>(path: string, init?: RequestInit) {
  const baseUrl = apiBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : `/api${path}`;
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }
  return res.json() as Promise<T>
}
