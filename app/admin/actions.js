"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createPlainClient } from "@supabase/supabase-js";
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

  // Implicitný flow: odkaz z e-mailu prihlási v akomkoľvek prehliadači
  // (nezávisí od cookie, ktoré by sa uložilo len v prehliadači, kde sa odkaz vyžiadal).
  const supabase = createPlainClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false } }
  );
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${await siteOrigin()}/auth/confirm`,
    },
  });

  // Rovnaká odpoveď pre existujúci aj neexistujúci účet – neprezrádzame, kto je admin.
  if (error && error.status === 429) {
    return { error: "Príliš veľa pokusov. Nový odkaz si môžete vyžiadať o pár minút." };
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
