"use client";

import dynamic from "next/dynamic";

const RoleGuard = dynamic(() => import("@/components/role-guard"), {
  ssr: false,
});

export default RoleGuard;
