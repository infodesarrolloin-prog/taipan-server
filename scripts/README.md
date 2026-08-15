# DB import helper scripts

This folder contains helper scripts to import a Traccar SQL dump into the MariaDB container used by the development environment.

Files
- `import-db.ps1` — PowerShell script for Windows. Reads `MYSQL_ROOT_PASSWORD` from the `traccar-db-dev` container and pipes the dump into `mysql`.
- `import-db.sh` — POSIX shell script for Linux/macOS/WSL.
- `run-import.js` — Node runner used by the `npm` script to pick the correct platform script.
- `watch-import.js` — Node watcher: when `database/traccar_backup.sql` changes it triggers an import (debounced).

Make targets and npm scripts
- `make import-db` — imports `database/traccar_backup.sql` (POSIX `make`).
- `make backup-db` — creates a `backup-before-import.sql` from the running DB.
- `npm run db:import` — cross-platform import (uses `run-import.js`).
- `npm run db:watch` — watch the dump file and import on change.

Usage

1) Ensure DB container is running:

```bash
docker compose up -d db
```

2) Import the dump (examples)

Windows PowerShell (explicit):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\import-db.ps1 -DumpPath "F:\16_proyectos\traccar\code\traccar-master\database\traccar_backup.sql"
```

Cross-platform via npm (recommended):

```bash
npm run db:import
# or pass a path: npm run db:import -- ./database/traccar_backup.sql
```

POSIX direct:

```bash
./scripts/import-db.sh database/traccar_backup.sql
# or
make import-db
```

3) Backup before import (recommended):

```bash
make backup-db
```

Watch mode

To automatically import whenever you overwrite the dump file (useful during iterative exports):

```bash
npm run db:watch
```

Notes & safety
- Scripts use the environment variable `MYSQL_ROOT_PASSWORD` from the `traccar-db-dev` container. Do not commit or expose real credentials publicly.
- Import overwrites data in the `traccar` database. Always run `make backup-db` first if you want a rollback point.
- If you run into authentication issues on Windows, use the explicit PowerShell command above (the scripts handle common quoting issues).
- The watcher runs the import on file changes with a small debounce (2s) to avoid repeated imports during saves.

If you want, I can add a `npm run db:import` entry to the `traccar-web` package.json or wire the watcher into a lightweight utility container. Tell me which.
