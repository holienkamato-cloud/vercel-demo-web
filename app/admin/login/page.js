import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = { title: "Prihlásenie – prehľad dopytov" };

export default async function LoginPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <main className="wrap">
      <h1>Prehľad dopytov</h1>
      <p className="lead">Prihlásenie bez hesla – pošleme vám odkaz na e-mail.</p>
      {error && (
        <p className="error" style={{ marginBottom: 16 }}>
          Odkaz na prihlásenie je neplatný alebo vypršal. Vyžiadajte si nový.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
