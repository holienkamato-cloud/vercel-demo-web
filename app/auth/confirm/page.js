"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Cieľ odkazu z e-mailu. Supabase sem pošle prihlasovacie tokeny v časti URL za "#",
// ktorá sa na server nikdy neodosiela. Uložíme ich do cookies a pokračujeme na /admin.
export default function ConfirmPage() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    // Tokeny hneď odstránime z adresného riadka (história, zdieľanie odkazu).
    window.history.replaceState(null, "", window.location.pathname);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      const code = params.get("error_code");
      setError(
        code === "otp_expired"
          ? "Tento odkaz už bol použitý alebo vypršal. Platí vždy len najnovší odkaz."
          : "Odkaz na prihlásenie je neplatný."
      );
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    );
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) setError("Prihlásenie sa nepodarilo dokončiť. Vyžiadajte si nový odkaz.");
        else window.location.replace("/admin");
      });
  }, []);

  return (
    <main className="wrap">
      <h1>Prehľad dopytov</h1>
      {error ? (
        <>
          <p className="error">{error}</p>
          <a href="/admin/login" className="btn">Vyžiadať nový odkaz</a>
        </>
      ) : (
        <p className="lead">Prihlasujem…</p>
      )}
    </main>
  );
}
