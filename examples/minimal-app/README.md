# minimal-app

Tiny Family app: `createFamilySDK` → `init` → `getContext` (renders mode +
wallet) and a `store.set`/`store.get` roundtrip.

```sh
cd packages/sdk/examples/minimal-app && npm install   # once, resolves the SDK (file:../..)
family dev --app ./examples/minimal-app               # from packages/sdk; open http://localhost:4729
```

Tweak the wallet/scopes in the control bar and reload to see the app react.
