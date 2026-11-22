"use client";

import { useActionState } from "react";
import { sendMagicLink } from "../actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  if (state?.sent) {
    return (
      <div className="notice" role="status">
        <h2>Skontrolujte si e-mail</h2>
        <p style={{ margin: 0 }}>
          Ak je {state.email} administrátorský účet, prišiel naň odkaz na prihlásenie.
          Otvorte ho v tomto prehliadači.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card">
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        {state?.error && <div className="error">{state.error}</div>}
      </div>
      <button type="submit" disabled={pending}>{pending ? "Posielam…" : "Poslať odkaz na prihlásenie"}</button>
    </form>
  );
}
