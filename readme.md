# Mitarbeiterportal

Produktionsreifes HR-MVP für Anmeldung, Urlaub, Krankmeldungen, Stammdaten und Dienstplan – gebaut als Full-Stack Next.js App (App Router, TypeScript, Tailwind, shadcn/ui).

## Schnellstart

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Prod-Build via Docker:

```bash
docker compose up -d --build
```

Admin-Zugang nach Seed: `admin` / `Passwort123!`. Weitere Demo-Mitarbeiter: `max`, `anna` (Passwort identisch). Registrierung bleibt offen – ist die User-Tabelle leer, erhält der erste Sign-Up automatisch die Rolle `ADMIN`.

## Architektur

- **Next.js 14 App Router** als Monorepo-Basis; Server Actions + REST-Handler kapseln Mutationen, React-Hook-Form + Zod liefern identische Validierung auf Client & Server.
- **Auth.js/NextAuth (Credentials)** mit Argon2-Hashing, HTTP-only Cookies, CSRF-Double-Submit-Token und zentralem RBAC (`ADMIN`, `EMPLOYEE`).
- **Prisma + PostgreSQL** modellieren User, Profile, Vacation, SickNote, Shift, AuditLog, DownloadToken. Migration/Seed automatisiert.
- **Datei-Storage** lokal über Service-Layer (`/app/storage` via Docker-Volume). Austauschbar gegen S3/R2 durch Implementierung eines alternativen Adapters.
- **PDF-Export** via `@react-pdf/renderer` (Server-Side), Kalender via FullCalendar (Monats/Wochenansicht), Locale & TZ konsequent `de-DE` / `Europe/Berlin`.
- **Security**: Security-Header, Rate-Limits für Auth/Upload (in-memory, containerlokal), Audit-Logs für Profil-Änderungen & Downloads, RBAC-Guards pro Server Action. Logs bewusst ohne personenbezogene Inhalte (nur AuditTrail).
- **Tests**: Vitest (RBAC, Konfliktprüfungen Urlaub/Dienstplan) + Playwright-Smoketest (Login, Urlaub, Upload, PDF).

## Wichtige Befehle

- `pnpm test:unit` – Vitest
- `pnpm test:e2e` – Playwright Smoke-Flow
- `pnpm lint`, `pnpm typecheck` – CI-konforme Prüfungen
- `pnpm db:migrate`, `pnpm db:seed` – Datenbank

## Reverse Proxy (z. B. Cloudflare Tunnel)

- Header weiterreichen: `X-Forwarded-Proto`, `X-Forwarded-Host`.
- `APP_BASE_URL` auf externe URL setzen, damit NextAuth & signierte Downloads `Secure` Cookies verwenden.
- Proxy sollte `trust proxy` respektieren – Next nutzt `headers()` API, Secure-Cookies aktiv, sobald `APP_BASE_URL` HTTPS ist.

## Trade-offs & Erweiterungen

- Rate-Limit aktuell in-memory – für Clusterbetrieb später Redis/Upstash anbindbar.
- Storage bewusst lokal (schnell für MVP). Umstieg: neuen Adapter implementieren, `.env` auf Bucket verweisen.
- Audit-Log minimalistisch (JSON diff). Erweiterung auf strukturierte Events + Viewer möglich.
- Urlaubsüberlappung per Flag `VACATION_ALLOW_OVERLAP` konfigurierbar.
- CI/CD: optional GitHub Actions für Lint/Test/Build ergänzen.

## DSGVO-Hinweise

- Minimalprinzip: Profile nur notwendige Felder, AuditLogs dokumentieren Zweck.
- Download-Links sind signiert & zeitlich limitiert (`DOWNLOAD_TOKEN_TTL_MINUTES`).
- Keine externen Tracker/Analytics, keine personenbezogenen Logs außerhalb Audit-Zweck.

Viel Spaß beim Bauen & Erweitern!
