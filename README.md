# VM Control Room

Training web app for vulnerability management scenarios, built with `React`, `TypeScript`, and `Vite`.

Live site: [https://rtrtgpowes5rj.github.io/vm_poc/](https://rtrtgpowes5rj.github.io/vm_poc/)

## Local start

```powershell
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Public access through ngrok

Set your ngrok token once:

```powershell
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
```

Then start a public tunnel together with the dev server:

```powershell
npm run dev:public
```

The script will:

- start Vite on port `5173`
- start `ngrok` for that port
- print the local URL
- print the public `https` URL

To stop both the local dev server and the ngrok tunnel:

```powershell
npm run dev:public:stop
```

## Recommended public sharing

For a stable public link, use the built preview version instead of the live HMR dev server:

```powershell
npm run share
```

This command will:

- build the app
- start a preview server on `4173`
- create a public tunnel through `localhost.run`
- keep the tunnel alive with background health checks and automatic reconnects
- print both the local and public URL

To stop the public share session:

```powershell
npm run share:stop
```

To print the current public URL again later:

```powershell
npm run share:url
```

If you want to run them separately:

```powershell
npm run dev:web
npm run tunnel
```

To print the currently active ngrok URL:

```powershell
npm run tunnel:url
```

If ngrok is blocked for your current IP or account policy, use a fallback public tunnel:

```powershell
npm run dev:web
npm run tunnel:lt
```

If you want a more stable fallback, use Cloudflare Quick Tunnel:

```powershell
npm run dev:web
npm run tunnel:cf
```

You can also run the preview server and localhost.run separately:

```powershell
npm run share:web
npm run share:tunnel
```

## Checks

```powershell
npm test
npm run build
```
