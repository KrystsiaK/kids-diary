import { AdminDashboardPage } from "@/features/admin/components/admin-dashboard-page";
import { requireAdminSession } from "@/features/admin/lib/admin-auth";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  return <AdminDashboardPage searchParams={searchParams} />;
}
