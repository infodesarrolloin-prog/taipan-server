Param(
    [string]$DumpPath = "./database/traccar_backup.sql"
)

$RepoRoot = Split-Path -Path $MyInvocation.MyCommand.Path -Parent

if (-not (Test-Path $DumpPath)) {
    Write-Error "Dump not found: $DumpPath"
    exit 1
}

Write-Output "Reading MySQL root password from container 'traccar-db-dev'..."
$rootPass = docker exec traccar-db-dev printenv MYSQL_ROOT_PASSWORD 2>$null
if ($LASTEXITCODE -ne 0 -or -not $rootPass) {
    Write-Error "Cannot read MYSQL_ROOT_PASSWORD from container traccar-db-dev. Is it running and configured?"
    exit 1
}
$rootPass = $rootPass.Trim()

Write-Output "Importing $DumpPath into database 'traccar' (container: traccar-db-dev)..."
# Use MYSQL_PWD env to avoid quoting/escape issues with -p on Windows
$envArg = "--env"
$envValue = "MYSQL_PWD=$rootPass"
Get-Content $DumpPath -Raw | docker exec -i $envArg $envValue traccar-db-dev mysql -u root traccar
if ($LASTEXITCODE -ne 0) {
    Write-Error "Import failed. Check the container logs for details."
    exit 1
}

Write-Output "Import completed successfully."
