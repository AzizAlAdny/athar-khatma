# Call Configuration — TURN Relay Setup Guide

Voice calls in Athar Khatma use **WebRTC**: the audio streams flow **directly between the two
browsers** — they never pass through Vercel or Render. The backend API only exchanges
*signaling* (offer / answer / ICE candidates) via Pusher WebSocket + HTTP polling fallback.

When both users sit behind restrictive networks (mobile data, carrier NAT, corporate
firewalls — very common in the region), a direct path cannot be built with STUN alone and
**calls connect but stay silent**. A **TURN server** relays the audio in that case and is
required for reliable production voice.

This project is TURN-ready: the client already reads the TURN settings from `NEXT_PUBLIC_TURN_*`
build-time environment variables (`client/src/services/webrtcService.ts → buildIceServers()`).
No code or backend changes are needed — only the variables below.

---

## How to add the TURN variables to hosting (Backend and frontend)

### Overview — who needs what

| Hosting side | Needs TURN variables? | Why |
| --- | --- | --- |
| **Backend** (Laravel on Render) | ❌ No | The API never touches audio media; it only stores/forwards SDP + candidates. TURN runs as an **independent relay service** (Metered / XirSys / Cloudflare) used directly by the browsers. |
| **Frontend** (Next.js on Vercel) | ✅ **Yes** | WebRTC lives in the browser; the TURN URL/username/password must be baked into the JS bundle at **build time** via `NEXT_PUBLIC_*` env vars. |
| **TURN relay service** | ✅ New service | Create a free account on a TURN provider and copy its 3 values (URL, username, password). |

> ⚠️ The single most common mistake: adding the variables but **not redeploying** Vercel.
> `NEXT_PUBLIC_*` values are compiled into the bundle during the build step — saving them in
> the dashboard does nothing until a new build runs.

---

### Step 1 — Backend (Render): nothing to add, just verify existing env

TURN requires **no new backend variables**. Confirm these already exist on Render
(Environment tab of your `athar-api-kdae` service) and match production:

| Variable | Expected value | Purpose |
| --- | --- | --- |
| `APP_URL` | `https://athar-api-kdae.onrender.com` | Signed URLs / payload URLs |
| `CORS_ALLOWED_ORIGINS` | `https://athar-khatma.vercel.app` | Allows browser requests (incl. WebSocket auth) from the frontend |
| `FRONTEND_URL` | `https://athar-khatma.vercel.app` | Link building in emails |
| `SANCTUM_STATEFUL_DOMAINS` | `athar-khatma.vercel.app` | Sanctum stateful config |
| `BROADCAST_CONNECTION` | `pusher` | Real-time events (with the free polling fallback as backup) |
| `PUSHER_APP_KEY` / `PUSHER_APP_SECRET` / `PUSHER_APP_ID` / `PUSHER_APP_CLUSTER=eu` | from Pusher dashboard | Instant incoming-call + ICE delivery |

Two housekeeping items while you are there:

1. 🔐 **Rotate `PUSHER_APP_SECRET`** (Pusher dashboard → your app → Keys → reset → paste the new
   secret into Render). Anyone holding the old secret could broadcast fake incoming calls.
   Then rotate `APP_KEY` on a quiet schedule (`php artisan key:generate` updates it via the
   Render env; Sanctum bearer tokens are unaffected).
2. ⏰ **Prevent spin-down** (free tier): add a free uptime monitor (cron-job.org / UptimeRobot)
   hitting `GET https://athar-api-kdae.onrender.com/api/health` every 5–10 minutes, or upgrade
   Render to Starter so the API never cold-starts mid-call.

If any variable had to be changed, Render redeploys automatically — wait for **Deploy live**
before testing.

### Step 2 — Create a TURN service and copy the 3 values

Recommended free starting point: **Metered "Open Relay"** — **20 GB of free TURN usage every
month** (≈ 600+ hours of voice), runs on ports **80 and 443** (UDP + TCP + TURNS/SSL), so it
passes through the mobile-carrier and corporate firewalls common in the region.

> ℹ️ Metered does **not** show you a fixed "URL + username + password" in the dashboard.
> Instead it gives you an **API key**, and your browser calls a small REST endpoint that
> returns a ready-made `iceServers` list (STUN + TURN entries with credentials, geo-routed
> to the nearest server). We only need to read that list **once** and copy its values into
> our env vars.

1. Go to **https://www.metered.ca** (the official site — it's a **`.ca`** domain, not `.dev`)
   → click **Sign up** (no credit card required).
2. After verifying your email, log in to the dashboard. Metered creates a default app for you;
   its subdomain looks like `yourappname.metered.live`.
3. Find your **API key**: in the dashboard open your app → **Settings / API Keys** section
   (also linked from the "Open Relay / TURN" pages as *"To obtain your API_KEY sign-up for a
   free account"*). Copy the key.
4. **Fetch your TURN credentials once.** Open this URL in a new browser tab, replacing the two
   placeholders with your app subdomain and API key:

   ```
   https://<yourappname>.metered.live/api/v1/turn/credentials?apiKey=<API_KEY>
   ```

   The response is a JSON array like:

   ```json
   [
     { "urls": "stun:stun.relay.metered.ca:80" },
     {
       "urls": "turn:global.relay.metered.ca:80",
       "username": "b8d4f...e91",
       "credential": "kR3x...9Q=="
     },
     {
       "urls": "turn:global.relay.metered.ca:80?transport=tcp",
       "username": "b8d4f...e91",
       "credential": "kR3x...9Q=="
     },
     {
       "urls": "turns:global.relay.metered.ca:443?transport=tcp",
       "username": "b8d4f...e91",
       "credential": "kR3x...9Q=="
     }
   ]
   ```

   *(hostnames shown here are illustrative — use exactly what your endpoint returns.)*

5. From that JSON, copy into our three env vars (mapping below — also used in Step 3):

   | JSON field | Env var | What to paste |
   | --- | --- | --- |
   | every `urls` value that starts with `turn:` or `turns:` | `NEXT_PUBLIC_TURN_URL` | All of them, **comma-separated**, e.g. `turn:global.relay.metered.ca:80,turn:global.relay.metered.ca:80?transport=tcp,turns:global.relay.metered.ca:443?transport=tcp` |
   | `username` (same on all entries) | `NEXT_PUBLIC_TURN_USERNAME` | e.g. `b8d4f...e91` |
   | `credential` (same on all entries) | `NEXT_PUBLIC_TURN_CREDENTIAL` | e.g. `kR3x...9Q==` |

   Including the `turns:...:443` entry is important — TLS on port 443 is the variant that
   survives the strictest firewalls.

6. Keep the tab open — you will paste these into Vercel in Step 3.

Alternative providers (same 3 values, same steps afterwards):

| Provider | Free tier | Notes |
| --- | --- | --- |
| **XirSys** | 500 MB / month | Approval can be slow; fine for light testing |
| **Cloudflare Calls TURN** | Pay-as-you-go ($0.05/GB) | Cheapest long-run, very reliable |
| **Twilio NTS** | Pay-as-you-go ($0.40/GB) | Battle-tested, easy console |

> Cost perspective: 1 hour of voice ≈ 30 MB of relay traffic for the pair. Metered's 50 GB
> covers roughly 1,600 call-hours.

---

### Step 3 — Frontend (Vercel): add the 3 `NEXT_PUBLIC_*` variables

1. Open **https://vercel.com** → Dashboard → your project **`athar-khatma`**.
2. Go to tab **`Settings`** → left menu **`Environment Variables`**.
3. Add the following **three** variables. For each one, check ☑ **Production**, ☑ **Preview**,
   ☑ **Development** in the “Environments” selector before saving:

   | Name | Value (example — use your provider's values) |
   | --- | --- |
   | `NEXT_PUBLIC_TURN_URL` | `turn:global.metered.ca:443,turn:global.metered.ca:3478` |
   | `NEXT_PUBLIC_TURN_USERNAME` | `<username from provider dashboard>` |
   | `NEXT_PUBLIC_TURN_CREDENTIAL` | `<password/credential from provider dashboard>` |

   - Click **Add** for each row → **Save**.
   - `NEXT_PUBLIC_TURN_URL` supports a **comma-separated list** of URLs (the client splits it);
     including both `:443` (TLS/TCP, firewall-friendly) and `:3478` (UDP, lower latency)
     gives browsers more fallback options.
4. **Trigger a new build (mandatory):**
   - Option A (fast): tab **`Deployments`** → latest deployment → click the **`…`** menu on the
     right → **`Redeploy`** → **`Deploy`**. This rebuilds the current commit with the new vars.
   - Option B (if you also have new commits to push): just `git push`; Vercel auto-builds
     pushes, and the new build includes the variables.
5. Wait ~2 minutes until the deployment shows **Ready**.
6. **Hard-refresh** the site (Ctrl+Shift+R) so browsers load the new bundle, then continue to
   Step 5.

### Step 4 — Local development (optional but recommended)

Add the same values to `client/.env.local` (documented in `client/.env.example`):

```bash
# client/.env.local
NEXT_PUBLIC_TURN_URL=turn:global.metered.ca:443,turn:global.metered.ca:3478
NEXT_PUBLIC_TURN_USERNAME=<username>
NEXT_PUBLIC_TURN_CREDENTIAL=<credential>
```

Then **restart** the dev server (`npm run dev`) — env vars are only read at startup.
Verify locally first: make a call between two browser windows / devices; audio should connect
in both directions before you rely on deployment.

---

### Step 5 — Verify end-to-end in production

Test the realistic scenario: **two different accounts on two different networks**
(e.g. home Wi-Fi on a laptop vs mobile 4G on a phone).

1. Start/accept a call on both sides.
2. Watch the browser console (DevTools → **Console**) on both sides — you should see:
   ```
   [WebRTC] ICE connection state: checking
   [WebRTC] ICE connection state: connected      ← media path is live, audio must flow
   ```
3. Expected outcomes and what to do next:

   | Observation | Meaning | Action |
   | --- | --- | --- |
   | ✅ Audio flows in both directions | STUN or TURN succeeded | Done — nothing left to do |
   | 🟡 Amber banner *“الصوت لم يبدأ تلقائيًا — اضغط هنا للتشغيل 🔊”* | Browser autoplay policy blocked playback | Tap the banner once; audio starts |
   | 🔴 Red banner *“تعذّر تأسيس اتصال صوتي… فعّل خادم TURN”* + console shows `ICE connection state: failed` | No usable TURN relay (wrong/missing creds, blocked ports) | Re-check the 3 variables + redeploy; confirm the provider dashboard shows traffic |
   | 🔴 Console stays on `checking` for tens of seconds → `failed`, even with TURN set | Relay ports blocked by firewall | Prefer the TLS entry of `NEXT_PUBLIC_TURN_URL` (port 443), or switch provider |

4. Re-confirm Pusher signaling is live: DevTools → **Network → WS** → a live
   `wss://ws-eu.pusher.com` socket with subscriptions to `call.<userId>`.

---

### Environment variable reference (all call-related vars)

| Variable | Where | Example | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | `https://athar-api-kdae.onrender.com/api` | API root used by fetch + echo auth |
| `NEXT_PUBLIC_PUSHER_APP_KEY` | Vercel | `4563802f6e17da2d4c5c` | Same key as backend `PUSHER_APP_KEY` |
| `NEXT_PUBLIC_PUSHER_APP_CLUSTER` | Vercel | `eu` | Must match backend cluster, else **no** WS events |
| `NEXT_PUBLIC_PUSHER_SCHEME` | Vercel | `https` | Enforces TLS |
| `NEXT_PUBLIC_TURN_URL` | Vercel | `turn:global.metered.ca:443,turn:global.metered.ca:3478` | Comma-separated OK |
| `NEXT_PUBLIC_TURN_USERNAME` | Vercel | provider username | |
| `NEXT_PUBLIC_TURN_CREDENTIAL` | Vercel | provider password | |
| `PUSHER_APP_SECRET` | Render | (rotated) | Keep out of chat/logs — rotate regularly |
| `BROADCAST_CONNECTION` | Render | `pusher` | `log` disables WebSockets (polling fallback still works) |

---

## Troubleshooting quick table

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Call rings but the receiver never sees it | API cold start (Render free tier asleep) or `/calls/active` poll not yet due | Add the keep-alive ping (Step 1); second call attempt always lands |
| “Connected” but silent on both sides | NAT without TURN | Complete Steps 2–3 and redeploy; the new banners now explain the state |
| “Connected” but silent on one side only | Autoplay policy on that device | Tap the amber 🔊 banner (Step 5, 🟡) |
| Receiver gets *missed / call expired* before ringing | 35 s ringing timeout + slow `/calls/initiate` cold start | Warm the API (keep-alive) or upgrade Render; don't retry >10×/min (throttled) |
| WS disconnected frequently | Pusher free limit (100 concurrent) or Render redeploy | Check Pusher dashboard stats; polling covers the gap meanwhile |
| Old bundle after env change | Browser cache | Hard refresh (Ctrl+Shift+R) / clear site data |

---

## Change log

- **2026-08-21** — Added TURN env support (`webrtcService.ts`), ICE/autoplay failure banners,
  tap-to-start audio in `ActiveCallModal.tsx`, and this configuration guide.


