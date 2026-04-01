param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

try {
  $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $processIds) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process on port $Port (PID $processId)."
  }
} catch {
  Write-Host "Port $Port is already free."
}

$sshProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "ssh.exe" -and $_.CommandLine -match "localhost.run"
}

if ($sshProcesses) {
  foreach ($process in $sshProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Stopped localhost.run tunnel."
} else {
  Write-Host "No localhost.run tunnel is running."
}

$supervisorProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "powershell.exe" -and $_.CommandLine -match "share-supervisor.ps1"
}

if ($supervisorProcesses) {
  foreach ($process in $supervisorProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Stopped share supervisor."
} else {
  Write-Host "No share supervisor is running."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$statusFile = Join-Path $repoRoot "share-status.json"
if (Test-Path $statusFile) {
  Remove-Item $statusFile -Force -ErrorAction SilentlyContinue
}
