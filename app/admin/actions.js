"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const STATUSES = ["novy", "riesi_sa", "vybaveny"];

export async function signIn(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Zadajte e-mail aj heslo.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) {
      return { error: "Príliš veľa pokusov. Skúste to znova o minútu.", email };
    }
    return { error: "Nesprávny e-mail alebo heslo.", email };
  }
  redirect("/admin");
}

export async function changePassword(_prevState, formData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 12) return { error: "Heslo musí mať aspoň 12 znakov." };
  if (password !== confirm) return { error: "Heslá sa nezhodujú." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.code === "same_password" ? "Nové heslo je rovnaké ako staré." : "Heslo sa nepodarilo zmeniť: " + error.message };
  }
  return { ok: true };
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
