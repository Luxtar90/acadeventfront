import RoleGuard from "@/components/role-guard-client";

export default function ScannerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["SCANNER"]}>{children}</RoleGuard>;
}
