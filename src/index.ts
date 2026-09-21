import {
  CampaignDetailResult,
  CampaignInput,
  CampaignListResult,
  ChargeInput,
  ChargeResult,
  ChargeSplit,
  ChromeBackButton,
  ChromeButtonHandle,
  ChromeButtonParams,
  ChromeEventMessage,
  ChromeEventType,
  ChromeHapticImpact,
  ChromeHapticNotification,
  ChromeHeaderParams,
  ContractInvokeResult,
  EscrowInput,
  EscrowResult,
  FamilyContext,
  FamilyOhlcvResult,
  FamilyPrices,
  FamilyProfile,
  FamilyProfileStats,
  FamilyProposalResult,
  FamilyProposalsResult,
  FamilySDK,
  FamilyTradesResult,
  FamilyVaultActivity,
  FamilyVaultHoldings,
  HouseAppMessage,
  HouseCallPayload,
  HouseIdentity,
  HouseMember,
  HouseTreasury,
  InitResult,
  ModulePermission,
  ModuleStoreKeyRef,
  ModuleStoreRecord,
  PollInput,
  PollResult,
  ProductInput,
  ProductListResult,
  ProductResult,
  SDKContext,
  SocialPostInput,
  SocialPostResult,
  SpendProposalInput,
  SpendProposalResult,
  StorageUploadResult,
  ThesisInput,
  ThesisListResult,
  ThesisResult,
  TipInput,
  TipResult,
  WikiListResult,
  WikiPageInput,
  WikiPageResult,
} from "./types";

export * from "./types";
export * from "./constants";
export * from "./permissions";

/** SDK protocol version — sent in init() for host negotiation. */
export const SDK_VERSION = "0.1.0";

function getParentOrigin(): string {
  if (typeof document !== "undefined" && document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
      /* fall through */
    }
  }
  const ancestorOrigins = (
    window.location as Location & { ancestorOrigins?: DOMStringList }
  ).ancestorOrigins;
  if (ancestorOrigins && ancestorOrigins.length > 0) {
    return ancestorOrigins[0];
  }
  throw new Error(
    "Family SDK: cannot resolve parent origin — no document.referrer and no window.location.ancestorOrigins"
  );
}

/** Uniquely identify one bridge call. */
function makeCallId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `call-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create the Family SDK instance for an app running inside an iframe.
 * The SDK communicates with the parent window over postMessage.
 */
export function createFamilySDK(targetWindow?: Window): FamilySDK {
  const parent = targetWindow ?? window.parent;
  const pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  function call<T>(method: string, args: unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = makeCallId();
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Family SDK call timed out: ${method}`));
        }
      }, 30_000);
      pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });

      const payload: HouseCallPayload = { method, args };
      const msg: HouseAppMessage = {
        type: "FAMILY:CALL",
        id,
        namespace: "family-sdk",
        payload,
      };

      parent.postMessage(msg, getParentOrigin());
    });
  }

  function onMessage(event: MessageEvent) {
    // Only trust messages from our direct parent — nested iframes or injected
    // scripts must not be able to fake a FAMILY:CALL:RESPONSE.
    if (event.source !== parent) return;
    const data = event.data as HouseAppMessage | undefined;
    if (!data || data.namespace !== "family-sdk") return;

    // Host-pushed chrome events (button clicks, theme changes, ...).
    if (data.type === "FAMILY:EVENT") {
      const evt = data.payload as ChromeEventMessage | undefined;
      if (!evt?.event) return;
      const handlers = eventHandlers.get(evt.event);
      if (!handlers) return;
      for (const handler of [...handlers]) {
        try {
          handler(evt.data);
        } catch {
          /* a misbehaving listener must not break the bridge */
        }
      }
      return;
    }

    if (data.type !== "FAMILY:CALL:RESPONSE") return;

    const handler = pending.get(data.id);
    if (!handler) return;
    pending.delete(data.id);
    clearTimeout(handler.timer);

    if (data.error) {
      handler.reject(new Error(data.error));
    } else {
      handler.resolve(data.payload);
    }
  }

  // Local subscriptions for host-pushed chrome events.
  const eventHandlers = new Map<string, Set<(data?: unknown) => void>>();

  function subscribe(event: ChromeEventType, handler: (data?: unknown) => void) {
    let set = eventHandlers.get(event);
    if (!set) {
      set = new Set();
      eventHandlers.set(event, set);
    }
    set.add(handler);
  }

  function unsubscribe(event: ChromeEventType, handler: (data?: unknown) => void) {
    const set = eventHandlers.get(event);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) eventHandlers.delete(event);
  }

  function makeButton(
    methodPrefix: string,
    clickEvent: ChromeEventType
  ): ChromeButtonHandle {
    return {
      setParams: (params: ChromeButtonParams) =>
        call(`${methodPrefix}.setParams`, [params]),
      show: () => call(`${methodPrefix}.show`, []),
      hide: () => call(`${methodPrefix}.hide`, []),
      enable: () => call(`${methodPrefix}.enable`, []),
      disable: () => call(`${methodPrefix}.disable`, []),
      showProgress: () => call(`${methodPrefix}.showProgress`, []),
      hideProgress: () => call(`${methodPrefix}.hideProgress`, []),
      onClick: (handler: () => void) => subscribe(clickEvent, handler),
      offClick: (handler: () => void) => unsubscribe(clickEvent, handler),
    };
  }

  function makeBackButton(): ChromeBackButton {
    return {
      show: () => call("chrome.backButton.show", []),
      hide: () => call("chrome.backButton.hide", []),
      onClick: (handler: () => void) => subscribe("backButtonClicked", handler),
      offClick: (handler: () => void) => unsubscribe("backButtonClicked", handler),
    };
  }

  let listening = false;
  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener("message", onMessage);
  }

  function dispose() {
    window.removeEventListener("message", onMessage);
    for (const handler of pending.values()) {
      clearTimeout(handler.timer);
      handler.reject(new Error("Family SDK disposed"));
    }
    pending.clear();
  }

  listen();

  return {
    dispose,
    init: (sdkVersion?: string) =>
      call<InitResult>("init", [sdkVersion ?? SDK_VERSION]),
    getContext: () => call<SDKContext>("getContext", []),
    getPermissions: () => call<ModulePermission[]>("getPermissions", []),
    requestPermission: (scope: ModulePermission) =>
      call<boolean>("requestPermission", [scope]),
    identity: {
      getMe: () => call<HouseIdentity>("identity.getMe", []),
      getMembers: () => call<HouseMember[]>("identity.getMembers", []),
    },
    house: {
      getContext: () => call<FamilyContext>("house.getContext", []),
    },
    profile: {
      getProfile: () => call<FamilyProfile>("profile.getProfile", []),
      getStats: () => call<FamilyProfileStats>("profile.getStats", []),
    },
    chart: {
      getPrices: () => call<FamilyPrices>("chart.getPrices", []),
      getOhlcv: (intervalSeconds?: number) =>
        call<FamilyOhlcvResult>("chart.getOhlcv", [intervalSeconds]),
      getTrades: (opts?: { page?: number; all?: boolean }) =>
        call<FamilyTradesResult>("chart.getTrades", [opts]),
    },
    vault: {
      getHoldings: () => call<FamilyVaultHoldings>("vault.getHoldings", []),
      getActivity: () => call<FamilyVaultActivity>("vault.getActivity", []),
    },
    governance: {
      getProposals: () => call<FamilyProposalsResult>("governance.getProposals", []),
      getProposal: (id: string) =>
        call<FamilyProposalResult>("governance.getProposal", [id]),
    },
    social: {
      post: (input: SocialPostInput) =>
        call<SocialPostResult>("social.post", [input]),
      comment: (postId: string, body: string) =>
        call<SocialPostResult>("social.comment", [postId, body]),
      createPoll: (input: PollInput) =>
        call<PollResult>("social.createPoll", [input]),
      votePoll: (postId: string, optionId: string) =>
        call<{ ok: boolean; error?: string }>("social.votePoll", [postId, optionId]),
    },
    wiki: {
      listPages: () => call<WikiListResult>("wiki.listPages", []),
      getPage: (slug: string) => call<WikiPageResult>("wiki.getPage", [slug]),
      savePage: (input: WikiPageInput) =>
        call<WikiPageResult>("wiki.savePage", [input]),
      deletePage: (slug: string) =>
        call<{ ok: boolean; error?: string }>("wiki.deletePage", [slug]),
    },
    campaigns: {
      list: () => call<CampaignListResult>("campaigns.list", []),
      get: (slug: string) =>
        call<CampaignDetailResult>("campaigns.get", [slug]),
      create: (input: CampaignInput) =>
        call<CampaignDetailResult>("campaigns.create", [input]),
      approve: (slug: string, vote: "yes" | "no") =>
        call<{ ok: boolean; error?: string }>("campaigns.approve", [slug, vote]),
      submit: (slug: string, contentUrl: string, caption?: string, platform?: string) =>
        call<{ ok: boolean; submission?: unknown; error?: string }>("campaigns.submit", [
          slug,
          contentUrl,
          caption,
          platform,
        ]),
      voteSubmission: (slug: string, submissionId: string, score: number) =>
        call<{ ok: boolean; error?: string }>("campaigns.voteSubmission", [
          slug,
          submissionId,
          score,
        ]),
      finalizeApproval: (slug: string) =>
        call<{ ok: boolean; approved?: boolean; error?: string }>(
          "campaigns.finalizeApproval",
          [slug]
        ),
      close: (slug: string) =>
        call<{ ok: boolean; error?: string }>("campaigns.close", [slug]),
    },
    thesis: {
      list: () => call<ThesisListResult>("thesis.list", []),
      create: (input: ThesisInput) => call<ThesisResult>("thesis.create", [input]),
      react: (postId: string, stickerId: string) =>
        call<{ ok: boolean; removed?: boolean; error?: string }>("thesis.react", [
          postId,
          stickerId,
        ]),
    },
    products: {
      list: (includeDrafts?: boolean) =>
        call<ProductListResult>("products.list", [includeDrafts]),
      get: (slug: string) => call<ProductResult>("products.get", [slug]),
      create: (input: ProductInput) => call<ProductResult>("products.create", [input]),
      update: (slug: string, input: ProductInput) =>
        call<ProductResult>("products.update", [slug, input]),
      publish: (slug: string) => call<ProductResult>("products.publish", [slug]),
      unpublish: (slug: string) => call<ProductResult>("products.unpublish", [slug]),
      remove: (slug: string) =>
        call<{ ok: boolean; error?: string }>("products.remove", [slug]),
    },
    treasury: {
      getTreasury: () => call<HouseTreasury>("treasury.getTreasury", []),
      proposeSpend: (input: SpendProposalInput) =>
        call<SpendProposalResult>("treasury.proposeSpend", [input]),
    },
    payments: {
      tip: (input: TipInput) => call<TipResult>("payments.tip", [input]),
      escrow: (input: EscrowInput) => call<EscrowResult>("payments.escrow", [input]),
      charge: (input: ChargeInput) =>
        call<ChargeResult>("payments.charge", [input]),
    },
    contract: {
      invoke: (address: string, method: string, args: unknown[], options?: { value?: string; abi?: unknown }) =>
        call<ContractInvokeResult>("contract.invoke", [address, method, args, options]),
    },
    store: {
      get: (key: string) => call<ModuleStoreRecord>("store.get", [key]),
      set: (key: string, value: unknown) =>
        call<{ ok: boolean; key: string }>("store.set", [key, value]),
      delete: (key: string) => call<{ ok: boolean; deleted: number }>("store.delete", [key]),
      list: (prefix?: string) => call<ModuleStoreKeyRef[]>("store.list", [prefix]),
    },
    storage: {
      upload: (file: File) => call<StorageUploadResult>("storage.upload", [file]),
    },
    ui: {
      toast: (message: string, type: "info" | "success" | "error" = "info") => {
        void call("ui.toast", [message, type]);
      },
      modal: (options: {
        title: string;
        body: string;
        confirmLabel?: string;
        cancelLabel?: string;
      }) => call<boolean>("ui.modal", [options]),
    },
    chrome: {
      ready: () => call<{ ok: boolean }>("chrome.ready", []),
      close: () => call<{ ok: boolean }>("chrome.close", []),
      header: {
        setParams: (params: ChromeHeaderParams) =>
          call("chrome.header.setParams", [params]),
      },
      mainButton: makeButton("chrome.mainButton", "mainButtonClicked"),
      secondaryButton: makeButton("chrome.secondaryButton", "secondaryButtonClicked"),
      backButton: makeBackButton(),
      haptic: {
        impact: (style: ChromeHapticImpact) => call("chrome.haptic.impact", [style]),
        notification: (type: ChromeHapticNotification) =>
          call("chrome.haptic.notification", [type]),
        selection: () => call("chrome.haptic.selection", []),
      },
      theme: {
        get: () => call("chrome.theme.get", []),
      },
      onEvent: (event: ChromeEventType, handler: (data?: unknown) => void) =>
        subscribe(event, handler),
      offEvent: (event: ChromeEventType, handler: (data?: unknown) => void) =>
        unsubscribe(event, handler),
    },
  };
}
