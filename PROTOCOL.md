# Family SDK bridge protocol

This is the complete wire spec spoken between an app/module iframe and the
Family host. The TypeScript reference implementation is
[`src/index.ts`](./src/index.ts); the Family CLI ships a mock host that
implements the host side for local development.

## Envelope

Every message is a `postMessage` whose data is a JSON object:

```ts
interface HouseAppMessage {
  type: "FAMILY:CALL" | "FAMILY:CALL:RESPONSE" | "FAMILY:EVENT";
  id: string;                 // opaque call id, chosen by the caller
  namespace: "family-sdk";    // constant — ignore anything else
  payload?: unknown;
  error?: string;             // RESPONSE only: rejects the caller's promise
}
```

`FAMILY:INIT` / `FAMILY:INIT:RESPONSE` are reserved for a future handshake
variant; today the handshake is a regular `FAMILY:CALL` with
`method: "init"` (see below).

## Request / response

The app sends:

```json
{
  "type": "FAMILY:CALL",
  "id": "9b2f…",
  "namespace": "family-sdk",
  "payload": { "method": "store.get", "args": ["settings"] }
}
```

The host replies on the same `id`:

```json
{
  "type": "FAMILY:CALL:RESPONSE",
  "id": "9b2f…",
  "namespace": "family-sdk",
  "payload": { "key": "settings", "value": { "theme": "dark" } }
}
```

or, on failure:

```json
{
  "type": "FAMILY:CALL:RESPONSE",
  "id": "9b2f…",
  "namespace": "family-sdk",
  "error": "unknown method: store.bork"
}
```

- `payload` present → the app's promise **resolves** with `payload`.
- `error` present → the app's promise **rejects** with `new Error(error)`.
- Method names are dot-namespaced (`store.get`, `payments.charge`, …).

## Origin pinning

- The app posts calls with `targetOrigin` set to the resolved **parent
  origin**: `document.referrer`'s origin, falling back to
  `window.location.ancestorOrigins[0]`. If neither is available the SDK throws
  `"cannot resolve parent origin"` — there is no `"*"` fallback.
- The host must only accept `FAMILY:CALL` messages whose `event.source` is the
  app iframe it created, and only reply to that frame.
- The app must only accept `FAMILY:CALL:RESPONSE` messages whose
  `event.source` is its direct parent (`targetWindow ?? window.parent`) — a
  nested iframe must not be able to inject fake responses.

## Timeouts

The app rejects a call with `Family SDK call timed out: <method>` if no
response arrives within **30 seconds**. The timer is cleared the moment the
response arrives. A host that cannot answer promptly should still respond with
an `error` string.

## init — version negotiation

`init(sdkVersion?)` is a normal call (`method: "init"`,
`args: [sdkVersion ?? SDK_VERSION]`) that must be the first call the app makes.
The host responds with:

```ts
interface InitResult {
  ok: boolean;
  hostVersion?: string;   // host-side protocol version
  supported?: boolean;    // false when sdkVersion is outside the supported range
  launchToken?: string;   // short-lived JWT, user-mode apps only
  error?: string;
}
```

`ok: false` or `supported: false` means the app should show a "host outdated"
message and stop.

## Launch JWT

`launchToken` (present in user mode) is a short-lived JWT the app sends to its
own backend to prove it is running as a given user inside Family. Claims:

| Claim | Value |
|---|---|
| `iss` | `familydotfun` |
| `aud` | `family-app` |
| `appId` | the installed app's id |
| `wallet` | the current user's wallet |
| `scopes` | permissions granted at install |
| `exp` | ~15 minutes from minting |

Validate the signature against the platform's published key on **every** call
to your backend; never trust the token's claims without it.
