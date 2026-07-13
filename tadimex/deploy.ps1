Param(
  [Parameter(Mandatory = $false)]
  [string]$RepoDir = (Get-Location).Path,

  [Parameter(Mandatory = $false)]
  [string]$AssetsDir = ""
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "No se encontro el comando '$Name' en PATH."
  }
}

function Invoke-External([scriptblock]$Command, [string]$ErrorMessage) {
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$ErrorMessage (exit=$LASTEXITCODE)"
  }
}

function Wait-ContainerHealthy([string]$ContainerName, [int]$TimeoutSeconds = 180) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    $status = & docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealth{{end}}" $ContainerName 2>$null
    if ($LASTEXITCODE -ne 0) {
      Start-Sleep -Seconds 2
      continue
    }
    $status = ($status | Out-String).Trim()
    if ($status -eq "healthy") { return }
    if ($status -eq "unhealthy") { throw "El contenedor '$ContainerName' esta unhealthy." }
    Start-Sleep -Seconds 2
  }
  throw "El contenedor '$ContainerName' no se puso healthy en $TimeoutSeconds segundos."
}

Require-Command "docker"

if ([string]::IsNullOrWhiteSpace($AssetsDir)) {
  throw "Falta -AssetsDir. Ejemplo: .\deploy.ps1 -AssetsDir C:\ruta\deploy_assets"
}

$RepoDir = (Resolve-Path $RepoDir).Path
$AssetsDir = (Resolve-Path $AssetsDir).Path

$sqlPath = Join-Path $AssetsDir "tadimex_db.sql"
$logosPath = Join-Path $AssetsDir "static\logos"
$uploadsPath = Join-Path $AssetsDir "static\uploads"

if (-not (Test-Path $sqlPath)) { throw "No existe: $sqlPath" }
if (-not (Test-Path $logosPath)) { throw "No existe: $logosPath" }
if (-not (Test-Path $uploadsPath)) { throw "No existe: $uploadsPath" }

Set-Location $RepoDir

Write-Host "RepoDir:    $RepoDir"
Write-Host "AssetsDir:  $AssetsDir"
Write-Host "SQL:        $sqlPath"
Write-Host "Logos:      $logosPath"
Write-Host "Uploads:    $uploadsPath"
Write-Host ""

Write-Host "1) Bajando stack y borrando volúmenes..."
Invoke-External { docker compose down -v --remove-orphans } "Fallo: docker compose down"

Write-Host "2) Subiendo MariaDB..."
Invoke-External { docker compose up -d mariadb } "Fallo: docker compose up -d mariadb"

Write-Host "2.1) Esperando a que MariaDB este healthy..."
Wait-ContainerHealthy -ContainerName "tadimex-mariadb" -TimeoutSeconds 180

Write-Host "3) Copiando dump al contenedor MariaDB..."
Invoke-External { docker cp $sqlPath "tadimex-mariadb:/tmp/tadimex_db.sql" } "Fallo: docker cp dump SQL"

Write-Host "4) Importando dump (latin1, sin Get-Content)..."
Invoke-External { docker compose exec -T mariadb sh -lc "mariadb --default-character-set=latin1 -uadmin -pH8cf708NQ9o73jU2ggQ4 < /tmp/tadimex_db.sql" } "Fallo: importacion SQL"

Write-Host "5) Subiendo el resto del stack..."
Invoke-External { docker compose up -d --build } "Fallo: docker compose up -d --build"

Write-Host "6) Copiando estáticos al backend..."
Invoke-External { docker cp $logosPath "tadimex-backend:/app/static/" } "Fallo: docker cp logos"
Invoke-External { docker cp $uploadsPath "tadimex-backend:/app/static/" } "Fallo: docker cp uploads"

Write-Host "7) Reiniciando backend y nginx..."
Invoke-External { docker compose restart backend nginx } "Fallo: docker compose restart backend nginx"

Write-Host ""
Write-Host "Listo. Estado:"
Invoke-External { docker compose ps } "Fallo: docker compose ps"

Write-Host ""
Write-Host "Tips:"
Write-Host "- Frontend: http://localhost/"
Write-Host "- Backend docs: http://localhost:8000/docs"
