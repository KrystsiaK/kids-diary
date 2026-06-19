"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  verifyAdminPassword,
} from "@/features/admin/lib/admin-auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=invalid-credentials");
  }

  await createAdminSession();
  revalidatePath("/admin");
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  revalidatePath("/admin");
  redirect("/admin/login?logout=1");
}

