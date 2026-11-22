"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["novy", "riesi_sa", "vybaveny"];

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendMagicLink(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Zadajte platný e-mail." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/admin`,
    },
  });

  // Rovnaká odpoveď pre existujúci aj neexistujúci účet – neprezrádzame, kto je admin.
  if (error && error.status === 429) {
    return { error: "Príliš veľa pokusov. Skúste to znova o pár minút." };
  }
  return { sent: true, email };
}

export async function updateInquiry(formData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 5000);
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ status, note: note || null })
    .eq("id", id);
  if (error) console.error("Update inquiry failed:", error.message);
  revalidatePath("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
