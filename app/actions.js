"use server";

import { createClient } from "@/lib/supabase/server";

const SERVICES = ["Rekonštrukcia", "Novostavba", "Rozpočet / ocenenie", "Iné"];

function clean(value, max) {
  const s = String(value ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

export async function submitInquiry(_prevState, formData) {
  // Honeypot – roboty vyplnia skryté pole, ľudia nie.
  if (clean(formData.get("website"), 200)) {
    return { ok: true };
  }

  const values = {
    name: clean(formData.get("name"), 120),
    email: clean(formData.get("email"), 200),
    phone: clean(formData.get("phone"), 40),
    service: clean(formData.get("service"), 80),
    location: clean(formData.get("location"), 120),
    message: clean(formData.get("message"), 5000),
  };

  const errors = {};
  if (values.name.length < 2) errors.name = "Zadajte meno.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Zadajte platný e-mail.";
  if (values.phone && !/^[+0-9 ()/-]{6,40}$/.test(values.phone)) errors.phone = "Telefón obsahuje neplatné znaky.";
  if (values.service && !SERVICES.includes(values.service)) errors.service = "Vyberte typ práce zo zoznamu.";
  if (values.message.length < 10) errors.message = "Popíšte, prosím, čo potrebujete (aspoň 10 znakov).";

  if (Object.keys(errors).length) {
    return { ok: false, errors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    service: values.service || null,
    location: values.location || null,
    message: values.message,
  });

  if (error) {
    console.error("Insert inquiry failed:", error.message);
    return {
      ok: false,
      errors: { form: "Dopyt sa nepodarilo odoslať. Skúste to, prosím, znova o chvíľu." },
      values,
    };
  }

  return { ok: true };
}
