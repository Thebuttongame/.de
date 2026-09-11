// ============================================================
// A + M – PRIVATE REGIE
// Dieselben Supabase-Daten wie in ../script.js eintragen.
// ============================================================

const SUPABASE_URL = "DEINE_SUPABASE_URL";
const SUPABASE_ANON_KEY = "DEIN_SUPABASE_ANON_KEY";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginView = document.getElementById("loginView");
const adminView = document.getElementById("adminView");
const loginForm = document.getElementById("loginForm");
const memoryForm = document.getElementById("memoryForm");
const loginError = document.getElementById("loginError");
const formMessage = document.getElementById("formMessage");
const list = document.getElementById("list");

async function init() {
  if (SUPABASE_URL.startsWith("DEINE_")) {
    loginError.textContent = "Supabase-Daten fehlen noch in regie.js.";
    return;
  }
  const { data } = await db.auth.getSession();
  if (data.session) showAdmin();
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";

  const { error } = await db.auth.signInWithPassword({
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  });

  if (error) {
    loginError.textContent = "Login fehlgeschlagen. E-Mail oder Passwort prüfen.";
    return;
  }
  showAdmin();
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await db.auth.signOut();
  adminView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

document.getElementById("reloadBtn").addEventListener("click", loadList);

memoryForm.addEventListener("submit", async e => {
  e.preventDefault();
  formMessage.textContent = "Wird veröffentlicht …";

  const file = document.getElementById("image").files[0];
  if (!file) return;

  const sessionResult = await db.auth.getSession();
  if (!sessionResult.data.session) {
    formMessage.textContent = "Deine Sitzung ist abgelaufen. Bitte neu einloggen.";
    return;
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const path = `${crypto.randomUUID()}-${safeName}`;

  const upload = await db.storage.from("memories").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (upload.error) {
    console.error(upload.error);
    formMessage.textContent = "Bild konnte nicht hochgeladen werden.";
    return;
  }

  const publicUrl = db.storage.from("memories").getPublicUrl(path).data.publicUrl;

  const insert = await db.from("memories").insert({
    title: document.getElementById("title").value.trim(),
    date_text: document.getElementById("dateText").value.trim(),
    text: document.getElementById("text").value.trim(),
    image_url: publicUrl,
    storage_path: path,
    published: true
  });

  if (insert.error) {
    console.error(insert.error);
    await db.storage.from("memories").remove([path]);
    formMessage.textContent = "Eintrag konnte nicht gespeichert werden.";
    return;
  }

  memoryForm.reset();
  formMessage.textContent = "Veröffentlicht. ♡";
  loadList();
});

async function showAdmin() {
  loginView.classList.add("hidden");
  adminView.classList.remove("hidden");
  await loadList();
}

async function loadList() {
  list.innerHTML = "<p class='muted'>Lade …</p>";

  const { data, error } = await db
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    list.innerHTML = "<p class='error'>Einträge konnten nicht geladen werden.</p>";
    console.error(error);
    return;
  }

  if (!data.length) {
    list.innerHTML = "<p class='muted'>Noch keine Erinnerungen.</p>";
    return;
  }

  list.innerHTML = data.map(item => `
    <div class="item">
      <img src="${escapeHtml(item.image_url)}" alt="">
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.date_text || "")}</p>
      </div>
      <button class="delete" data-id="${item.id}" data-path="${escapeHtml(item.storage_path || "")}">Löschen</button>
    </div>
  `).join("");

  list.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", () => deleteMemory(btn.dataset.id, btn.dataset.path));
  });
}

async function deleteMemory(id, path) {
  if (!confirm("Diese Erinnerung wirklich löschen?")) return;

  const result = await db.from("memories").delete().eq("id", id);
  if (result.error) {
    alert("Löschen fehlgeschlagen.");
    return;
  }

  if (path) await db.storage.from("memories").remove([path]);
  loadList();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

init();
