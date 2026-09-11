// ============================================================
// A + M – öffentliche Seite
// HIER EINTRAGEN:
// 1. Supabase Project URL
// 2. Supabase anon/public key
// ============================================================

const SUPABASE_URL = "DEINE_SUPABASE_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadMemories() {
  const box = document.getElementById("memories");

  if (SUPABASE_URL.startsWith("DEINE_")) {
    box.innerHTML = `<div class="empty">Supabase ist noch nicht eingerichtet.<br>Trage URL und Anon-Key in <b>script.js</b> ein.</div>`;
    return;
  }

  const { data, error } = await db
    .from("memories")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    box.innerHTML = `<div class="empty">Die Erinnerungen konnten gerade nicht geladen werden.</div>`;
    return;
  }

  if (!data.length) {
    box.innerHTML = `<div class="empty">Hier entstehen bald unsere ersten Erinnerungen. ♡</div>`;
    return;
  }

  box.innerHTML = data.map((item, i) => `
    <article class="memory" style="--rotation:${i % 3 === 0 ? "-1deg" : i % 3 === 1 ? "0.7deg" : "-0.4deg"}">
      <img src="${escapeAttr(item.image_url)}" alt="${escapeAttr(item.title || "Unsere Erinnerung")}">
      <div class="memory-text">
        ${item.date_text ? `<div class="memory-date">${escapeHtml(item.date_text)}</div>` : ""}
        <h3>${escapeHtml(item.title || "")}</h3>
        <p>${escapeHtml(item.text || "")}</p>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

loadMemories();
