// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFamilySDK, type HouseAppMessage } from "../src/index";

/**
 * Bridge round-trip tests: the SDK client talks to a mock parent window that
 * captures outgoing FAMILY:CALL envelopes and replies with
 * FAMILY:CALL:RESPONSE / FAMILY:EVENT, like the host runtime does.
 */

const PARENT_ORIGIN = "https://family.example";

function setup() {
  // document.referrer is what the SDK uses to resolve the parent origin.
  Object.defineProperty(document, "referrer", {
    value: `${PARENT_ORIGIN}/a/123`,
    configurable: true,
  });
  const posted: { msg: HouseAppMessage; targetOrigin: string }[] = [];
  const parent = {
    postMessage: vi.fn((msg: HouseAppMessage, targetOrigin: string) => {
      posted.push({ msg, targetOrigin });
    }),
  } as unknown as Window;
  const sdk = createFamilySDK(parent);
  return { sdk, posted, parent };
}

/** Simulate the host replying to the last captured call. */
function replyFromHost(parent: Window, posted: { msg: HouseAppMessage }[], payload: unknown) {
  const last = posted[posted.length - 1];
  window.dispatchEvent(
    new MessageEvent("message", {
      source: parent,
      data: {
        namespace: "family-sdk",
        type: "FAMILY:CALL:RESPONSE",
        id: last.msg.id,
        payload,
      } satisfies HouseAppMessage,
    })
  );
}

function hostEvent(parent: Window, event: string, data?: unknown) {
  window.dispatchEvent(
    new MessageEvent("message", {
      source: parent,
      data: {
        namespace: "family-sdk",
        type: "FAMILY:EVENT",
        id: `evt-${event}`,
        payload: { event, data },
      },
    })
  );
}

describe("createFamilySDK bridge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts FAMILY:CALL envelopes pinned to the parent origin", async () => {
    const { sdk, posted, parent } = setup();
    const p = sdk.init();
    expect(posted).toHaveLength(1);
    expect(posted[0].targetOrigin).toBe(PARENT_ORIGIN);
    expect(posted[0].msg).toMatchObject({
      namespace: "family-sdk",
      type: "FAMILY:CALL",
      payload: { method: "init", args: ["0.1.0"] },
    });
    replyFromHost(parent, posted, { ok: true, supported: true });
    await expect(p).resolves.toMatchObject({ ok: true });
  });

  it("resolves on payload, rejects on error", async () => {
    const { sdk, posted, parent } = setup();

    const okCall = sdk.getPermissions();
    replyFromHost(parent, posted, ["user:identity"]);
    await expect(okCall).resolves.toEqual(["user:identity"]);

    const failCall = sdk.identity.getMe();
    const last = posted[posted.length - 1];
    window.dispatchEvent(
      new MessageEvent("message", {
        source: parent,
        data: {
          namespace: "family-sdk",
          type: "FAMILY:CALL:RESPONSE",
          id: last.msg.id,
          error: "Wallet not connected",
        },
      })
    );
    await expect(failCall).rejects.toThrow("Wallet not connected");
  });

  it("rejects when the host never answers", async () => {
    vi.useFakeTimers();
    try {
      const { sdk } = setup();
      const p = sdk.getContext();
      // Attach a no-op handler first so the rejection is not "unhandled"
      // when the timer fires before the assertion below attaches.
      p.catch(() => undefined);
      await vi.advanceTimersByTimeAsync(31_000);
      await expect(p).rejects.toThrow("timed out");
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores responses from a source that is not the parent", async () => {
    const { sdk, posted } = setup();
    const p = sdk.getContext();
    const last = posted[posted.length - 1];
    const impostor = {} as Window;
    window.dispatchEvent(
      new MessageEvent("message", {
        source: impostor,
        data: {
          namespace: "family-sdk",
          type: "FAMILY:CALL:RESPONSE",
          id: last.msg.id,
          payload: { mode: "user" },
        },
      })
    );
    // Still pending — only the real parent's response resolves it.
    const result = Promise.race([
      p.then(() => "resolved"),
      new Promise((r) => setTimeout(() => r("pending"), 20)),
    ]);
    await expect(result).resolves.toBe("pending");
  });

  it("routes chrome button state calls to the matching host methods", async () => {
    const { sdk, posted, parent } = setup();
    const p = sdk.chrome.mainButton.setParams({ text: "Buy", isVisible: true });
    expect(posted[0].msg.payload).toEqual({
      method: "chrome.mainButton.setParams",
      args: [{ text: "Buy", isVisible: true }],
    });
    replyFromHost(parent, posted, undefined);
    await p;

    const p2 = sdk.chrome.backButton.show();
    expect(posted[1].msg.payload).toMatchObject({ method: "chrome.backButton.show" });
    replyFromHost(parent, posted, undefined);
    await p2;
  });

  it("dispatches FAMILY:EVENT chrome clicks to onClick handlers", () => {
    const { sdk, parent } = setup();
    const onMain = vi.fn();
    const onSecondary = vi.fn();
    const onBack = vi.fn();
    sdk.chrome.mainButton.onClick(onMain);
    sdk.chrome.secondaryButton.onClick(onSecondary);
    sdk.chrome.backButton.onClick(onBack);

    hostEvent(parent, "mainButtonClicked");
    hostEvent(parent, "secondaryButtonClicked");
    hostEvent(parent, "backButtonClicked");
    expect(onMain).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(onBack).toHaveBeenCalledTimes(1);

    sdk.chrome.mainButton.offClick(onMain);
    hostEvent(parent, "mainButtonClicked");
    expect(onMain).toHaveBeenCalledTimes(1);
  });

  it("supports generic chrome.onEvent subscriptions with data", () => {
    const { sdk, parent } = setup();
    const onTheme = vi.fn();
    sdk.chrome.onEvent("themeChanged", onTheme);
    hostEvent(parent, "themeChanged", { colorScheme: "dark" });
    expect(onTheme).toHaveBeenCalledWith({ colorScheme: "dark" });

    sdk.chrome.offEvent("themeChanged", onTheme);
    hostEvent(parent, "themeChanged", { colorScheme: "light" });
    expect(onTheme).toHaveBeenCalledTimes(1);
  });

  it("dispose rejects pending calls", async () => {
    const { sdk } = setup();
    const p = sdk.getContext();
    sdk.dispose();
    await expect(p).rejects.toThrow("disposed");
  });
});
