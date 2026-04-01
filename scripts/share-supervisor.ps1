param(
  [int]$Port = 4173,
  [string]$RepoRoot
)

$ErrorActionPreference = "Stop"

if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $PSScriptRoot
}

$tunnelLog = Join-Path $RepoRoot "localhostrun.log"
$tunnelErr = Join-Path $RepoRoot "localhostrun.err.log"
$statusFile = Join-Path $RepoRoot "share-status.json"

function Write-Status {
  param(
    [string]$State,
    [string]$PublicUrl = "",
    [string]$Message = ""
  )

  $payload = [ordered]@{
    state = $State
    publicUrl = $PublicUrl
    message = $Message
    updatedAt = (Get-Date).ToString("o")
  }

  $payload | ConvertTo-Json | Set-Content -Path $statusFile -Encoding UTF8
}

function Get-UrlFromLog {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $null
  }

  $match = Select-String -Path $Path -Pattern 'tunneled with tls termination,\s+(https://[a-zA-Z0-9.-]+)' | Select-Object -Last 1
  if (-not $match) {
    return $null
  }

  $urlMatch = [regex]::Match($match.Line, 'tunneled with tls termination,\s+(https://[a-zA-Z0-9.-]+)')
  if ($urlMatch.Success) {
    return $urlMatch.Groups[1].Value
  }

  return $null
}

function Test-PublicUrl {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -eq 200 -and $response.Content -notmatch "no tunnel here") {
      return $true
    }
  } catch {
    return $false
  }

  return $false
}

Write-Status -State "starting" -Message "Preparing localhost.run tunnel"

while ($true) {
  if (Test-Path $tunnelLog) {
    Remove-Item $tunnelLog -Force -ErrorAction SilentlyContinue
  }

  if (Test-Path $tunnelErr) {
    Remove-Item $tunnelErr -Force -ErrorAction SilentlyContinue
  }

  Write-Status -State "connecting" -Message "Requesting public URL from localhost.run"

  $sshProcess = Start-Process -FilePath "ssh.exe" `
    -ArgumentList @(
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "ServerAliveInterval=30",
      "-o",
      "ServerAliveCountMax=3",
      "-o",
      "TCPKeepAlive=yes",
      "-R",
      "80:127.0.0.1:$Port",
      "nokey@localhost.run"
    ) `
    -WorkingDirectory $RepoRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $tunnelLog `
    -RedirectStandardError $tunnelErr `
    -PassThru

  $publicUrl = $null
  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline -and -not $publicUrl -and -not $sshProcess.HasExited) {
    $publicUrl = Get-UrlFromLog -Path $tunnelLog
    if (-not $publicUrl) {
      Start-Sleep -Milliseconds 500
    }
  }

  if (-not $publicUrl) {
    Write-Status -State "restarting" -Message "localhost.run did not provide a public URL, retrying"
    if (-not $sshProcess.HasExited) {
      Stop-Process -Id $sshProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    continue
  }

  Write-Status -State "running" -PublicUrl $publicUrl -Message "Tunnel is active"

  $failureCount = 0
  while (-not $sshProcess.HasExited) {
    Start-Sleep -Seconds 30

    if (Test-PublicUrl -Url $publicUrl) {
      $failureCount = 0
      Write-Status -State "running" -PublicUrl $publicUrl -Message "Tunnel is active"
      continue
    }

    $failureCount += 1
    Write-Status -State "degraded" -PublicUrl $publicUrl -Message "Public tunnel health check failed ($failureCount/3)"

    if ($failureCount -ge 3) {
      Stop-Process -Id $sshProcess.Id -Force -ErrorAction SilentlyContinue
      break
    }
  }

  Write-Status -State "restarting" -Message "Restarting localhost.run tunnel"
  Start-Sleep -Seconds 2
}
