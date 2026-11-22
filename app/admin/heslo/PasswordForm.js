"use client";

import { useActionState } from "react";
import { changePassword } from "../actions";

export default function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);

  if (state?.ok) {
    return (
      <div className="notice" role="status">
        <h2>Heslo je zmenené</h2>
        <p style={{ margin: "0 0 12px" }}>Odteraz sa prihlasujete novým heslom.</p>
        <a href="/admin" className="btn">Späť na prehľad</a>
      </div>
    );
  }

  return (
    <form action={formAction} className="card">
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <div className="field">
        <label htmlFor="password">Nové heslo <span className="opt">(aspoň 12 znakov)</span></label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </div>
      <div className="field">
        <label htmlFor="confirm">Nové heslo znova</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={12} />
      </div>
      {state?.error && <div className="error" style={{ marginBottom: 12 }}>{state.error}</div>}
      <button type="submit" disabled={pending}>{pending ? "Ukladám…" : "Zmeniť heslo"}</button>
      {" "}
      <a href="/admin" className="btn btn-ghost">Zrušiť</a>
    </form>
  );
}
