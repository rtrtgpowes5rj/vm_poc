param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$previewLog = Join-Path $repoRoot "vite-share.log"
$previewErr = Join-Path $repoRoot "vite-share.err.log"
$tunnelLog = Join-Path $repoRoot "localhostrun.log"
$tunnelErr = Join-Path $repoRoot "localhostrun.err.log"
$statusFile = Join-Path $repoRoot "share-status.json"
$supervisorLog = Join-Path $repoRoot "share-supervisor.log"
$supervisorErr = Join-Path $repoRoot "share-supervisor.err.log"

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
  Write-Error "Port $Port is already in use. Run 'npm run share:stop' before starting a new public share session."
}

Write-Host "Building production preview..."
& npm.cmd run build

@($previewLog, $previewErr, $tunnelLog, $tunnelErr, $statusFile, $supervisorLog, $supervisorErr) | ForEach-Object {
  if (Test-Path $_) {
    Remove-Item $_ -Force -ErrorAction SilentlyContinue
  }
}

$null = Start-Process -FilePath "npm.cmd" `
  -ArgumentList @("run", "share:web") `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $previewLog `
  -RedirectStandardError $previewErr `
  -PassThru

if (-not (Wait-ForHttp -Url "http://127.0.0.1:$Port")) {
  Write-Error "Preview server did not become ready on port $Port. Check vite-share.log and vite-share.err.log."
}

Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "ssh.exe" -and $_.CommandLine -match "localhost.run"
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "powershell.exe" -and $_.CommandLine -match "share-supervisor.ps1"
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

$null = Start-Process -FilePath "powershell.exe" `
  -ArgumentList @(
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    (Join-Path $PSScriptRoot "share-supervisor.ps1"),
    "-Port",
    $Port,
    "-RepoRoot",
    $repoRoot
  ) `
  -WorkingDirectory $repoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $supervisorLog `
  -RedirectStandardError $supervisorErr `
  -PassThru

$publicUrl = $null
$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline -and -not $publicUrl) {
  if (Test-Path $statusFile) {
    try {
      $status = Get-Content $statusFile -Raw | ConvertFrom-Json
      if ($status.publicUrl) {
        $publicUrl = [string]$status.publicUrl
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  Start-Sleep -Milliseconds 500
}

if (-not $publicUrl) {
  Write-Error "The preview server is running on http://127.0.0.1:$Port but localhost.run did not return a public URL yet. Check share-supervisor.log and share-supervisor.err.log."
}

Write-Host ""
Write-Host "Local URL : http://127.0.0.1:$Port"
Write-Host "Public URL: $publicUrl"
Write-Host ""
Write-Host "Use 'npm run share:url' to print the current public URL later."
Write-Host "Use 'npm run share:stop' to stop the preview server and the tunnel."
