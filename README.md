# @familydotfun/sdk

The Family Product SDK — build **modules** and **apps** that run inside [Family](https://getfamily.fun): community-owned economies with a shared treasury (the Vault), a native token, and a built-in marketplace.

- **Modules** are installed on a *family* — they extend the family's surfaces (House tabs, profile sections, vault actions).
- **Apps** are installed on a *user account* — standalone mini-apps users launch from their app section, with payments that feed the owning family's vault.

Both share one runtime: your code runs in a sandboxed iframe, talks to the host over a typed `postMessage` bridge, and every capability arrives as a permission. You never see a private key — all money moves through the platform.

---

## Install

```bash
npm install github:Familydotfun/sdk
# or
pnpm add github:Familydotfun/sdk
```

> npm registry publishing is coming; the git install tracks `main`.

## Quickstart

### Create the SDK instance

```ts
import { createFamilySDK, isFamilyContext, isUserContext } from "@familydotfun/sdk";

const sdk = createFamilySDK();

// Handshake — returns a short-lived launchToken for your own backend calls.
const init = await sdk.init();
if (!init.ok) throw new Error(init.error ?? "init failed");

// Where am I running?
const ctx = await sdk.getContext();
if (isFamilyContext(ctx)) {
  // module: ctx.familySlug, ctx.tokenAddress, ctx.isHead, ...
} else if (isUserContext(ctx)) {
  // app: ctx.wallet, ctx.appId, ctx.family?
}
```

### Read identity and members

```ts
const me = await sdk.identity.getMe();       // { wallet, name, avatarUrl, role, balance }
const members = await sdk.identity.getMembers();
```

### Persist data without running a backend

Every module/app gets a scoped key-value store, namespaced per family (and per app) by the platform:

```ts
await sdk.store.set("settings", { theme: "dark" });
const rec = await sdk.store.get("settings");
const keys = await sdk.store.list("items:");   // prefix scan, keys only
```

### Take a payment (apps)

`payments.charge` is platform-mediated: the host shows the user a confirmation sheet with the exact fee split, the user signs one transfer, and the split is enforced by the ledger — 10% platform, a share to the owning family's vault, the rest to you:

```ts
const result = await sdk.payments.charge({
  amount: "5",
  currency: "USDG",
  item: "Pro access",
  idempotencyKey: crypto.randomUUID(), // retries never double-charge
});
if (result.ok) console.log(result.chargeId, result.split);
```

### Upload a file

```ts
const up = await sdk.storage.upload(file);   // host-bridged to the platform IPFS pipeline
if (up.ok) console.log(up.url, up.cid);
```

### Use host UI (toasts, confirm sheets)

```ts
sdk.ui.toast("Saved", "success");
const ok = await sdk.ui.modal({
  title: "Delete item?",
  body: "This cannot be undone.",
  confirmLabel: "Delete",
});
```

### Drive the host chrome (action buttons, header, haptics)

The host renders a native-quality chrome around your app. Nothing shows until
you drive it — the bars appear and disappear with your state.

```ts
// Persistent bottom call-to-action with a loading state.
sdk.chrome.mainButton.setParams({ text: "Buy for 5 USDG" });
sdk.chrome.mainButton.show();
sdk.chrome.mainButton.onClick(async () => {
  sdk.chrome.mainButton.showProgress();
  const res = await sdk.payments.charge({ /* ... */ });
  sdk.chrome.mainButton.hideProgress();
  if (res.ok) sdk.chrome.mainButton.hide();
});

// Secondary action sits above the main button.
sdk.chrome.secondaryButton.setParams({ text: "Learn more" });
sdk.chrome.secondaryButton.show();
sdk.chrome.secondaryButton.onClick(() => { /* ... */ });

// In-app navigation with a host back control.
sdk.chrome.backButton.show();
sdk.chrome.backButton.onClick(() => (window.location.hash = "#"));

// Header title / subtitle / loading progress.
await sdk.chrome.header.setParams({ title: "Checkout", progress: 0.6 });

// Match the host theme (also pushed live as "themeChanged").
const theme = await sdk.chrome.theme.get();

// Physical feedback where the device supports it.
sdk.chrome.haptic.notification("success");

// Lifecycle: first paint done / ask the host to close the runtime.
await sdk.chrome.ready();
await sdk.chrome.close();
```

Host-pushed events: `mainButtonClicked` · `secondaryButtonClicked` ·
`backButtonClicked` · `themeChanged` · `closed` — subscribe with
`sdk.chrome.onEvent(event, handler)` (button handles also have `onClick`).

---

## What you can build

| Class | Examples | Needs |
|---|---|---|
| Native (platform only) | Trading dashboards, swipe/discovery, turn-based & idle games, polls, paid content, AI pay-per-use | this SDK |
| With your own backend | Real-time multiplayer, Unity/WebGL games, marketplaces with search, social at scale | this SDK + your API (validate the launch JWT) |
| On-chain apps | Lending, prediction markets, minting, in-game assets | `contract.invoke` with declared contracts |
| Trading via agent keys (e.g. Hyperliquid-style perps) | Perps/trading frontends | `trading:agent` — the scope and its metadata ship today (trade-only keys, never withdrawals); the host-signed reference integration is rolling out, so budget integration work |

The sandbox cannot touch host cookies or DOM, has no `localStorage`/`IndexedDB` of its own, and cannot move money outside `charge()` or declared contract calls. Anything a website can do, an app can do — apps may call their own servers freely (CORS permitting) and validate the launch JWT to authenticate users.

## Manifest

Every module/app ships a `family.manifest.json`:

```jsonc
{
  "kind": "app",                      // "module" | "app"
  "id": "acme.agent-market",          // reverse-dns, unique
  "name": "Agent Market",
  "version": "0.1.0",
  "description": "Hire AI agents from your family",
  "permissions": ["user:identity", "payments:charge", "storage:upload"],
  "entryUrl": "https://your-host.example/dist/index.html",

  // apps only — every app is bound to an owning family and feeds its vault
  "family": { "slug": "ai-agents", "shareBps": 1500 },

  // optional
  "pricing": { "type": "free" },      // or { "type": "one-time", "amount": "5", "currency": "USDG" }
  "custody": "non-custodial",         // or "custodial" — flagged loudly at install
  "audit": { "auditor": "…", "reportUrl": "https://…", "date": "2026-09-21" }
}
```

Modules additionally declare their mount points: `surfaces` (`house`, `profile`, `chart`, `vault`, `governance`), optional forum `commands`, and declared `contracts` (with per-call `maxValue` exposure caps).

## Permissions

Permissions are declared in the manifest and granted at install — the host enforces them on **every** call. Public read-only scopes (`profile:read`, `chart:read`, `vault:read`, `governance:read`) need no grant.

| Scope | Risk | What it allows |
|---|---|---|
| `identity:read` / `identity:wallet` / `identity:balance` | low | your identity, wallet, family token balance |
| `members:read`, `house:read` | low | family metadata and roster |
| `social:post` / `social:comment` / `social:react` | med/low | posting as the app |
| `content:*`, `wiki:*`, `polls:*`, `campaigns:*`, `thesis:*` | low–high | family content surfaces |
| `treasury:read` | low | treasury balances |
| `treasury:spend:propose` | med | create spend proposals (moves nothing) |
| `treasury:spend:limited` | high | spend within approved caps |
| `payments:tip` | med | user-initiated tips |
| `payments:charge` | high | platform-mediated charges with enforced split |
| `payments:escrow` | high | app-controlled escrow contracts (per-call signature) |
| `contract:invoke` | high | calls to declared contracts only (per-call signature + exposure caps) |
| `store:read` / `store:write` | low/med | the scoped KV store |
| `storage:upload` | med | host-bridged uploads |
| `user:identity` / `user:balance` | low | user-mode identity and balance |
| `trading:agent` | **critical** | trade-only agent keys (can never withdraw) |

Ask for the minimum. Install prompts group scopes by risk and apps are badged by a computed risk score.

## API surface

Two surfaces share one SDK:

- **App APIs** — what app developers build on: `init` · `getContext` ·
  `getPermissions` · `requestPermission` · `identity.*` · `store.*` ·
  `payments.charge` · `storage.upload` · `ui.*` · `chrome.*` (host chrome:
  header, main/secondary action buttons, back button, haptics, theme, lifecycle)
- **Family-module APIs** — used by modules installed on a family, not by
  standalone apps: `house.*` · `profile.*` · `chart.*` (prices/OHLCV/trades) ·
  `vault.*` · `governance.*` · `social.*` (posts/comments/polls) · `wiki.*` ·
  `campaigns.*` · `thesis.*` · `products.*` · `treasury.*` · `payments.*`
  (tip/escrow) · `contract.invoke`

Error model: money and social calls resolve `{ ok: false, error }` for business
failures (they never throw), while infrastructure failures — bridge timeout,
unknown method, dispose — reject the promise. Check `ok` on money/social calls.

## The bridge protocol

The SDK speaks a small `postMessage` protocol with the host:

- outbound `{ type: "FAMILY:CALL", id, namespace: "family-sdk", payload: { method, args } }`
- inbound `{ namespace: "family-sdk", type: "FAMILY:CALL:RESPONSE", id, payload | error }`

Origin-pinned both directions; 30s call timeout; `init()` carries the SDK version for negotiation. You almost never need this — but it's how the mock host and alternative clients work. Full spec: [./PROTOCOL.md](./PROTOCOL.md).

## Development loop

Use the Family CLI to develop against a mock host (fake wallet, toggleable scopes, simulated charge split, live store inspector) — no real family or money needed:

```bash
npm install -g @familydotfun/cli
family init app my-app
cd my-app && family dev      # → http://localhost:4729
family build                 # self-contained dist/index.html
```

Publishing today goes through the Family developer UI: create the app, a family head approves, it appears in the marketplace Apps tab.

## Security model (summary)

- Sandboxed iframe, opaque origin, separate app subdomain
- No keys, ever — payments via platform ledger or declared contracts
- Scoped, expiring launch JWT for your own backend (validate per call: `iss: familydotfun`, `aud: family-app`, `appId`, `scopes`, 15-min `exp`)
- Route-layer data isolation; append-only ledger for balances
- Rate limits on uploads, store writes, and charge attempts

## Links

- Platform: https://getfamily.fun
- Bridge protocol (message envelope, origin pinning, timeout, init negotiation, launch JWT): [./PROTOCOL.md](./PROTOCOL.md)
- Issues & contributions: this repo

## License

MIT
