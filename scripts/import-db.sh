#!/bin/sh
# POSIX shell script to import the dump into the traccar DB container
# Usage: ./scripts/import-db.sh ./database/traccar_backup.sql

if [ -z "$1" ]; then
  DUMP_PATH="database/traccar_backup.sql"
else
  DUMP_PATH="$1"
fi

CONTAINER=traccar-db-dev

if [ ! -f "$DUMP_PATH" ]; then
  echo "Dump not found: $DUMP_PATH" >&2
  exit 1
fi

echo "Importing $DUMP_PATH into container $CONTAINER..."
docker exec -i $CONTAINER sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" traccar' < "$DUMP_PATH"
if [ $? -ne 0 ]; then
  echo "Import failed." >&2
  exit 1
fi
echo "Import completed successfully."
