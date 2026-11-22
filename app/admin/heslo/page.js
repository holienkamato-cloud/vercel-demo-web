import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Zmena hesla – prehľad dopytov" };

export default async function PasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <main className="wrap">
      <h1>Zmena hesla</h1>
      <p className="lead">Účet {user.email}</p>
      <PasswordForm />
    </main>
  );
}
