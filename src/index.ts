import {
  CampaignDetailResult,
  CampaignInput,
  CampaignListResult,
  ChargeInput,
  ChargeResult,
  ChargeSplit,
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
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "*";
}

/**
 * Create the Family SDK instance for an app running inside an iframe.
 * The SDK communicates with the parent window over postMessage.
 */
export function createFamilySDK(targetWindow?: Window): FamilySDK {
  const parent = targetWindow ?? window.parent;
  const pending = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason?: Error) => void }
  >();

  function call<T>(method: string, args: unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
      });

      const payload: HouseCallPayload = { method, args };
      const msg: HouseAppMessage = {
        type: "FAMILY:CALL",
        id,
        namespace: "family-sdk",
        payload,
      };

      parent.postMessage(msg, getParentOrigin());

      // Timeout after 30s
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Family SDK call timed out: ${method}`));
        }
      }, 30_000);
    });
  }

  function listen() {
    window.addEventListener("message", (event) => {
      const data = event.data as HouseAppMessage | undefined;
      if (!data || data.namespace !== "family-sdk") return;
      if (data.type !== "FAMILY:CALL:RESPONSE") return;

      const handler = pending.get(data.id);
      if (!handler) return;
      pending.delete(data.id);

      if (data.error) {
        handler.reject(new Error(data.error));
      } else {
        handler.resolve(data.payload);
      }
    });
  }

  listen();

  return {
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
  };
}
