param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"

$candidatePaths = @(
  "C:\Program Files (x86)\cloudflared\cloudflared.exe",
  "C:\Program Files\cloudflared\cloudflared.exe"
)

$cloudflared = $candidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $cloudflared) {
  try {
    $cloudflared = (Get-Command cloudflared -ErrorAction Stop).Source
  } catch {
    Write-Error "cloudflared is not installed. Install it first with: winget install --id Cloudflare.cloudflared -e"
  }
}

Write-Host "Starting Cloudflare Quick Tunnel for http://127.0.0.1:$Port"
Write-Host "Press Ctrl+C to stop the tunnel."
Write-Host ""

& $cloudflared tunnel --protocol http2 --url "http://127.0.0.1:$Port"
