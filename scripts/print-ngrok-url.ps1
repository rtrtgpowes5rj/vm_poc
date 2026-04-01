$ErrorActionPreference = "Stop"

try {
  $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
  $publicUrl = ($tunnels.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1).public_url

  if ($publicUrl) {
    Write-Host $publicUrl
  } else {
    Write-Error "ngrok is running but no https tunnel is available."
  }
} catch {
  Write-Error "ngrok API is unavailable. Start a tunnel first with 'npm run dev:public' or 'npm run tunnel'."
}
