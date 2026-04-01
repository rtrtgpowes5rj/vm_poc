param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

Write-Host "Starting localhost.run tunnel for http://127.0.0.1:$Port"
Write-Host "Press Ctrl+C to stop the tunnel."
Write-Host ""

ssh.exe `
  -o StrictHostKeyChecking=no `
  -o ServerAliveInterval=30 `
  -o ServerAliveCountMax=3 `
  -o TCPKeepAlive=yes `
  -R "80:127.0.0.1:$Port" `
  nokey@localhost.run
