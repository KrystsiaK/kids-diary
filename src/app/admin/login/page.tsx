import { redirect } from "next/navigation";

import { AdminLoginPage } from "@/features/admin/components/admin-login-page";
import { isAdminAuthenticated } from "@/features/admin/lib/admin-auth";

type AdminLoginRouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginRoute({
  searchParams,
}: AdminLoginRouteProps) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return <AdminLoginPage searchParams={searchParams} />;
}

