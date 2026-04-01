param(
  [int]$Port = 5173,
  [int]$TunnelApiPort = 4040
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$viteLog = Join-Path $repoRoot "vite-public.log"
$viteErr = Join-Path $repoRoot "vite-public.err.log"
$ngrokLog = Join-Path $repoRoot "ngrok.log"
$ngrokErr = Join-Path $repoRoot "ngrok.err.log"

function Get-ListeningProcessId {
  param([int]$LocalPort)

  try {
    $connection = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    return $connection.OwningProcess
  } catch {
    return $null
  }
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  return $false
}

if (Get-ListeningProcessId -LocalPort $Port) {
  Write-Error "Port $Port is already in use. Run 'npm run dev:public:stop' or free the port before retrying."
}

$viteProcess = Start-Process -FilePath "npm.cmd" `
  -ArgumentList @("run", "dev:web") `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $viteLog `
  -RedirectStandardError $viteErr `
  -PassThru

if (-not (Wait-ForHttp -Url "http://127.0.0.1:$Port")) {
  Write-Error "Vite did not become ready on port $Port. Check vite-public.log and vite-public.err.log."
}

Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$null = Start-Process -FilePath "ngrok.exe" `
  -ArgumentList @("http", "127.0.0.1:$Port") `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $ngrokLog `
  -RedirectStandardError $ngrokErr `
  -PassThru

$publicUrl = $null
$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline -and -not $publicUrl) {
  try {
    $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:$TunnelApiPort/api/tunnels" -TimeoutSec 2
    $publicUrl = ($tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1).public_url
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

if (-not $publicUrl) {
  $ngrokError = ""
  if (Test-Path $ngrokErr) {
    $ngrokError = (Get-Content $ngrokErr -Raw).Trim()
  }

  Write-Host ""
  Write-Host "Local URL : http://127.0.0.1:$Port"
  if ($ngrokError) {
    Write-Warning "ngrok failed: $ngrokError"
  } else {
    Write-Warning "The dev server is running on http://127.0.0.1:$Port but ngrok did not expose a public URL yet."
  }
  exit 0
}

Write-Host ""
Write-Host "Local URL : http://127.0.0.1:$Port"
Write-Host "Public URL: $publicUrl"
Write-Host ""
Write-Host "Use 'npm run dev:public:stop' to stop the local dev server and the tunnel."
