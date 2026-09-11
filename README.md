# A + M Cozy Website

## Ordner

- `index.html` – öffentliche Seite
- `style.css` – Design
- `script.js` – öffentliche Supabase-Anbindung
- `regie/index.html` – private Regie
- `regie/regie.css` – Regie-Design
- `regie/regie.js` – Regie-Funktionen
- `schema.sql` – Supabase-Datenbank + Sicherheitsregeln

## Einrichtung

1. Supabase-Projekt erstellen.
2. In Authentication einen Benutzer für die eigene E-Mail anlegen.
3. Registrierung für normale Besucher deaktivieren.
4. Einen Storage-Bucket `memories` erstellen und auf Public stellen.
5. `schema.sql` im SQL Editor ausführen. Dabei `admin@example.com` überall durch die eigene Login-E-Mail ersetzen.
6. Supabase Project URL und den `anon/public key` in `script.js` und `regie/regie.js` eintragen.
7. Alles auf GitHub Pages hochladen.
8. Eigene Domain mit GitHub Pages verbinden.

Wichtig: Niemals den Supabase `service_role` Key in diese Dateien schreiben. Nur den `anon/public` Key verwenden.

Danach:
- `https://DEINE-DOMAIN.de/` = öffentliche Cozy-Seite
- `https://DEINE-DOMAIN.de/regie/` = Login + Verwaltung
