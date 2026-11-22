"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="card">
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required
          defaultValue={state?.email} />
      </div>
      <div className="field">
        <label htmlFor="password">Heslo</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && <div className="error" style={{ marginBottom: 12 }}>{state.error}</div>}
      <button type="submit" disabled={pending}>{pending ? "Prihlasujem…" : "Prihlásiť sa"}</button>
    </form>
  );
}
