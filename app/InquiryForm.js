"use client";

import { useActionState } from "react";
import { submitInquiry } from "./actions";

const SERVICES = ["Rekonštrukcia", "Novostavba", "Rozpočet / ocenenie", "Iné"];

export default function InquiryForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, null);

  if (state?.ok) {
    return (
      <div className="notice" role="status">
        <h2>Ďakujeme, dopyt sme prijali.</h2>
        <p style={{ margin: 0 }}>Ozveme sa vám čo najskôr na zadaný e-mail alebo telefón.</p>
      </div>
    );
  }

  const v = state?.values ?? {};
  const e = state?.errors ?? {};

  return (
    <form action={formAction} className="card" noValidate>
      <div className="row">
        <div className="field">
          <label htmlFor="name">Meno a priezvisko</label>
          <input id="name" name="name" autoComplete="name" required defaultValue={v.name} />
          {e.name && <div className="error">{e.name}</div>}
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} />
          {e.email && <div className="error">{e.email}</div>}
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label htmlFor="phone">Telefón <span className="opt">(nepovinné)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} />
          {e.phone && <div className="error">{e.phone}</div>}
        </div>
        <div className="field">
          <label htmlFor="location">Lokalita <span className="opt">(nepovinné)</span></label>
          <input id="location" name="location" placeholder="napr. Žilina" defaultValue={v.location} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="service">Typ práce <span className="opt">(nepovinné)</span></label>
        <select id="service" name="service" defaultValue={v.service ?? ""}>
          <option value="">— vyberte —</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {e.service && <div className="error">{e.service}</div>}
      </div>

      <div className="field">
        <label htmlFor="message">Čo potrebujete?</label>
        <textarea id="message" name="message" required defaultValue={v.message}
          placeholder="Stručne opíšte rozsah prác, termín a čokoľvek, čo by sme mali vedieť." />
        {e.message && <div className="error">{e.message}</div>}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="website">Web</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {e.form && <div className="error" style={{ marginBottom: 12 }}>{e.form}</div>}

      <button type="submit" disabled={pending}>{pending ? "Odosielam…" : "Odoslať dopyt"}</button>
    </form>
  );
}
