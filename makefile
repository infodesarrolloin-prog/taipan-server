# Makefile for common DB tasks (works on Linux/macOS/WSL). On Windows use the PowerShell script in scripts/import-db.ps1

.PHONY: import-db backup-db

DB_CONTAINER=taipan-db-dev
DUMP_PATH=database/taipan_backup.sql

import-db:
	@if [ -f "$(DUMP_PATH)" ]; then \
		echo "Importing $(DUMP_PATH) into container $(DB_CONTAINER)..."; \
		docker exec -i $(DB_CONTAINER) sh -c 'exec mysql -u root -p"$$MYSQL_ROOT_PASSWORD" taipan' < $(DUMP_PATH); \
		echo "Import finished."; \
	else \
		echo "Dump not found: $(DUMP_PATH)"; exit 1; \
	fi

backup-db:
	@echo "Creating SQL dump from container $(DB_CONTAINER) into backup-before-import.sql..."
	@docker exec $(DB_CONTAINER) sh -c 'exec mysqldump -u root -p"$$MYSQL_ROOT_PASSWORD" taipan' > backup-before-import.sql
	@echo "Backup saved to backup-before-import.sql"
