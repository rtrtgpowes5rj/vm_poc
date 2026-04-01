$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$statusFile = Join-Path $repoRoot "share-status.json"

if (-not (Test-Path $statusFile)) {
  Write-Error "No active share status found. Start one with 'npm run share'."
}

$status = Get-Content $statusFile -Raw | ConvertFrom-Json

if (-not $status.publicUrl) {
  Write-Error "Share session exists but has no active public URL yet."
}

Write-Host $status.publicUrl
