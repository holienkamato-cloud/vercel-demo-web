import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = { title: "Prihlásenie – prehľad dopytov" };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return (
    <main className="wrap">
      <h1>Prehľad dopytov</h1>
      <p className="lead">Prihlásenie pre administrátora.</p>
      <LoginForm />
    </main>
  );
}
