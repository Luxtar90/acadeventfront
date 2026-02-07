import RoleGuard from "@/components/role-guard-client";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["ORGANIZADOR"]}>{children}</RoleGuard>;
}
