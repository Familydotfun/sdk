import { createFamilySDK } from "@familydotfun/sdk";

const sdk = createFamilySDK();
const out = document.getElementById("out")!;

async function main() {
  // Handshake — returns a short-lived launchToken for your own backend calls.
  const init = await sdk.init();
  if (!init.ok) throw new Error(init.error ?? "init failed");

  // Where am I running?
  const ctx = await sdk.getContext();
  if (ctx.mode === "user") {
    out.textContent = `Hello from ${ctx.mode} mode — wallet ${ctx.wallet}`;
  } else {
    out.textContent = `Hello from ${ctx.mode} mode — family ${ctx.familySlug}`;
  }

  // Scoped KV roundtrip (survives reloads in production; in-memory in dev).
  await sdk.store.set("greeting", { hello: "family" });
  const rec = await sdk.store.get("greeting");
  console.log("store roundtrip:", rec);
}

main().catch((err) => {
  out.textContent = `Error: ${String(err)}`;
});
