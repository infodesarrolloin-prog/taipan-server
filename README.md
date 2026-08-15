# [Traccar](https://www.traccar.org)

## Overview

Traccar is an open source GPS tracking system. This repository contains Java-based back-end service. It supports more than 200 GPS protocols and more than 2000 models of GPS tracking devices. Traccar can be used with any major SQL database system. It also provides easy to use [REST API](https://www.traccar.org/traccar-api/).

Other parts of Traccar solution include:

- [Traccar web app](https://github.com/traccar/traccar-web)
- [Traccar Manager app](https://github.com/traccar/traccar-manager)

There is also a set of mobile apps that you can use for tracking mobile devices:

- [Traccar Client app](https://github.com/traccar/traccar-client)

## Features

Some of the available features include:

- Real-time GPS tracking
- Driver behaviour monitoring
- Detailed and summary reports
- Geofencing functionality
- Alarms and notifications
- Account and device management
- Email and SMS support

## Build

Please read [build from source documentation](https://www.traccar.org/build/) on the official website.

## Team

- Anton Tananaev ([anton@traccar.org](mailto:anton@traccar.org))
- Andrey Kunitsyn ([andrey@traccar.org](mailto:andrey@traccar.org))

## License

    Apache License, Version 2.0

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

## Development: Importing local database dump

During development you can import a local Traccar SQL dump into the MariaDB container `traccar-db-dev` using the provided helper scripts.

- Cross-platform (recommended):

```bash
# from the repository root
npm run db:import
# watch for changes and import automatically:
npm run db:watch
```

- POSIX (Linux/macOS/WSL):

```bash
make import-db
# or
./scripts/import-db.sh database/traccar_backup.sql
```

- Windows (PowerShell):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\import-db.ps1 -DumpPath "F:\16_proyectos\traccar\code\traccar-master\database\traccar_backup.sql"
```

Notes:
- The scripts read `MYSQL_ROOT_PASSWORD` from the running `traccar-db-dev` container. Ensure the container is running (`docker compose up -d db`).
- Run `make backup-db` before importing if you want to save the current DB state.
- See `scripts/README.md` for more details.
