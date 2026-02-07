import RoleGuard from "@/components/role-guard-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["ASISTENTE"]}>{children}</RoleGuard>;
}
