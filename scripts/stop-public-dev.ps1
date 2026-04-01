param(
  [int]$Port = 5173
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

$ngrokProcesses = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokProcesses) {
  $ngrokProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped ngrok."
} else {
  Write-Host "No ngrok process is running."
}

$ltProcesses = Get-CimInstance Win32_Process | Where-Object {
  ($_.Name -eq "node.exe" -and $_.CommandLine -match "localtunnel\\bin\\lt.js") -or
  ($_.Name -eq "cmd.exe" -and $_.CommandLine -match "lt --port $Port")
}

if ($ltProcesses) {
  foreach ($process in $ltProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Stopped localtunnel."
} else {
  Write-Host "No localtunnel process is running."
}

$cloudflareProcesses = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "cloudflared.exe" -and $_.CommandLine -match "tunnel --url http://127.0.0.1:$Port"
}

if ($cloudflareProcesses) {
  foreach ($process in $cloudflareProcesses) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Stopped cloudflared."
} else {
  Write-Host "No cloudflared process is running."
}
