import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut, updateInquiry } from "./actions";

export const metadata = { title: "Prehľad dopytov" };
export const dynamic = "force-dynamic";

const STATUS_LABELS = { novy: "Nový", riesi_sa: "Rieši sa", vybaveny: "Vybavený" };
const FILTERS = [
  { key: "", label: "Všetky" },
  { key: "novy", label: "Nové" },
  { key: "riesi_sa", label: "Rieši sa" },
  { key: "vybaveny", label: "Vybavené" },
];

const dateFmt = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Bratislava",
});

export default async function AdminPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <main className="wrap">
        <h1>Bez prístupu</h1>
        <p className="lead">Účet {user.email} nemá oprávnenie vidieť dopyty.</p>
        <form action={signOut}><button className="btn-ghost">Odhlásiť sa</button></form>
      </main>
    );
  }

  const { status } = await searchParams;
  const activeFilter = STATUS_LABELS[status] ? status : "";

  let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(500);
  if (activeFilter) query = query.eq("status", activeFilter);
  const { data: inquiries, error } = await query;

  const { count: newCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "novy");

  return (
    <main className="wrap wrap-wide">
      <div className="topbar">
        <div>
          <h1>Prehľad dopytov</h1>
          <p className="muted" style={{ margin: 0 }}>
            {newCount ?? 0} {newCount === 1 ? "nový dopyt" : newCount >= 2 && newCount <= 4 ? "nové dopyty" : "nových dopytov"} · prihlásený {user.email}
          </p>
        </div>
        <form action={signOut}><button className="btn-ghost btn-small">Odhlásiť sa</button></form>
      </div>

      <nav className="filters" aria-label="Filter podľa stavu">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/admin?status=${f.key}` : "/admin"}
            className={activeFilter === f.key ? "active" : ""}>
            {f.label}
          </Link>
        ))}
      </nav>

      {error && <p className="error">Dopyty sa nepodarilo načítať: {error.message}</p>}
      {!error && inquiries.length === 0 && <p className="card muted">Zatiaľ tu nie sú žiadne dopyty.</p>}

      {inquiries?.map((q) => (
        <article key={q.id} className="card inq">
          <div className="inq-head">
            <h3>{q.name}</h3>
            <span className={`badge badge-${q.status}`}>{STATUS_LABELS[q.status]}</span>
          </div>
          <p className="inq-meta">
            {dateFmt.format(new Date(q.created_at))}
            {" · "}<a href={`mailto:${q.email}`}>{q.email}</a>
            {q.phone && <>{" · "}<a href={`tel:${q.phone.replace(/\s/g, "")}`}>{q.phone}</a></>}
            {q.service && <>{" · "}{q.service}</>}
            {q.location && <>{" · "}{q.location}</>}
          </p>
          <p className="inq-msg">{q.message}</p>
          <div className="inq-actions">
            {/* key: po uložení sa formulár znovu vykreslí s novými hodnotami */}
            <form key={`${q.status}|${q.note ?? ""}`} action={updateInquiry} style={{ flex: 1 }}>
              <input type="hidden" name="id" value={q.id} />
              <select name="status" defaultValue={q.status} aria-label="Stav">
                {Object.entries(STATUS_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
              <input name="note" defaultValue={q.note ?? ""} placeholder="Interná poznámka"
                aria-label="Interná poznámka" style={{ flex: 1, minWidth: 180, padding: "6px 10px" }} />
              <button className="btn-small">Uložiť</button>
            </form>
          </div>
        </article>
      ))}
    </main>
  );
}
