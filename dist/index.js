// src/types.ts
function isFamilyContext(ctx) {
  return ctx.mode === "family";
}
function isUserContext(ctx) {
  return ctx.mode === "user";
}

// src/constants.ts
var HOUSE_PERMISSIONS = {
  "identity:read": {
    label: "Read your identity",
    description: "Access your ANS name, avatar, and role in this House.",
    risk: "low",
    category: "identity"
  },
  "identity:wallet": {
    label: "Read wallet address",
    description: "Access your connected wallet address.",
    risk: "low",
    category: "identity"
  },
  "identity:balance": {
    label: "Read token balance",
    description: "Access your token balance in this House.",
    risk: "low",
    category: "identity"
  },
  "house:read": {
    label: "Read House info",
    description: "Access public House metadata like name, symbol, and member count.",
    risk: "low",
    category: "house"
  },
  "members:read": {
    label: "Read member list",
    description: "Access the list of House members and their roles.",
    risk: "low",
    category: "house"
  },
  "social:post": {
    label: "Post to Town Hall",
    description: "Publish posts to the House Town Hall feed as the app.",
    risk: "medium",
    category: "social"
  },
  "social:comment": {
    label: "Comment on posts",
    description: "Add comments to House posts as the app.",
    risk: "medium",
    category: "social"
  },
  "social:react": {
    label: "React to posts",
    description: "Add reactions and votes to House posts.",
    risk: "low",
    category: "social"
  },
  "events:read": {
    label: "Read events",
    description: "Read House campaigns and events.",
    risk: "low",
    category: "social"
  },
  "events:write": {
    label: "Create events",
    description: "Create campaigns and events in the House.",
    risk: "medium",
    category: "social"
  },
  "treasury:read": {
    label: "Read treasury",
    description: "View House treasury balances.",
    risk: "low",
    category: "money"
  },
  "treasury:deposit": {
    label: "Deposit to treasury",
    description: "Receive funds into the House treasury.",
    risk: "low",
    category: "money"
  },
  "treasury:spend:limited": {
    label: "Spend with limits",
    description: "Spend House funds up to an approved daily/monthly cap.",
    risk: "high",
    category: "money"
  },
  "treasury:spend:propose": {
    label: "Propose spends",
    description: "Create treasury spend proposals. Does not move funds directly.",
    risk: "medium",
    category: "money"
  },
  "payments:tip": {
    label: "Send tips",
    description: "Initiate tips from your balance to other members.",
    risk: "medium",
    category: "money"
  },
  "payments:escrow": {
    label: "Use app escrow",
    description: "Deposit or withdraw your funds from app-controlled contracts (e.g., prediction markets). Each transaction requires your wallet signature.",
    risk: "high",
    category: "money"
  },
  "contract:invoke": {
    label: "Call app contracts",
    description: "Call declared methods on app-controlled contracts. Each call requires your wallet signature.",
    risk: "high",
    category: "money"
  },
  "content:read": {
    label: "Read content",
    description: "Read wiki pages and long-form content.",
    risk: "low",
    category: "social"
  },
  "content:write": {
    label: "Write content",
    description: "Create and edit wiki pages and long-form content.",
    risk: "medium",
    category: "social"
  },
  "wiki:read": {
    label: "Read wiki",
    description: "Read family wiki pages.",
    risk: "low",
    category: "social"
  },
  "wiki:write": {
    label: "Write wiki",
    description: "Create and edit family wiki pages.",
    risk: "medium",
    category: "social"
  },
  "polls:read": {
    label: "Read polls",
    description: "View polls and proposals.",
    risk: "low",
    category: "social"
  },
  "polls:write": {
    label: "Create polls",
    description: "Create polls and cast votes.",
    risk: "medium",
    category: "social"
  },
  "campaigns:read": {
    label: "Read campaigns",
    description: "View campaigns and quests.",
    risk: "low",
    category: "social"
  },
  "campaigns:write": {
    label: "Manage campaigns",
    description: "Create campaigns, approve them, and close payouts.",
    risk: "high",
    category: "social"
  },
  "thesis:read": {
    label: "Read theses",
    description: "View why members joined or bought into this family.",
    risk: "low",
    category: "social"
  },
  "thesis:write": {
    label: "Write theses",
    description: "Post your own thesis and react to others' theses.",
    risk: "medium",
    category: "social"
  },
  "store:read": {
    label: "Read module storage",
    description: "Read data this module has stored for this House.",
    risk: "low",
    category: "house"
  },
  "store:write": {
    label: "Write module storage",
    description: "Create, update, and delete this module's stored data for this House.",
    risk: "medium",
    category: "house"
  },
  // Read-only surface scopes: public data, no user grant required.
  "profile:read": {
    label: "Read profile",
    description: "Read public family profile info and stats.",
    risk: "low",
    category: "house",
    readOnly: true
  },
  "chart:read": {
    label: "Read chart data",
    description: "Read public prices, OHLCV bars, and trade history.",
    risk: "low",
    category: "house",
    readOnly: true
  },
  "vault:read": {
    label: "Read vault",
    description: "Read public vault holdings and activity.",
    risk: "low",
    category: "money",
    readOnly: true
  },
  "governance:read": {
    label: "Read proposals",
    description: "Read public governance proposals.",
    risk: "low",
    category: "house",
    readOnly: true
  },
  // User-app scopes
  "user:identity": {
    label: "Read your identity",
    description: "Access your wallet and profile in user apps.",
    risk: "low",
    category: "identity"
  },
  "user:balance": {
    label: "Read your balance",
    description: "Access your in-app balance in user apps.",
    risk: "low",
    category: "money"
  },
  "payments:charge": {
    label: "Charge you for purchases",
    description: "Take payments from your balance. Every charge shows a confirmation with the fee split before you sign.",
    risk: "high",
    category: "money"
  },
  "storage:upload": {
    label: "Upload images and files",
    description: "Send files through the platform's storage on the app's behalf.",
    risk: "medium",
    category: "house"
  },
  "trading:agent": {
    label: "Trade on your behalf",
    description: "Hold a trade-only agent key: it can place and cancel orders but can never withdraw funds. Bad trades are still possible \u2014 set exposure limits.",
    risk: "critical",
    category: "money"
  }
};
var MODULE_SURFACE_LABELS = {
  chart: "Chart",
  profile: "Profile",
  house: "House",
  vault: "Vault",
  governance: "Governance"
};
function permissionRiskScore(permissions) {
  const weights = {
    low: 0,
    medium: 15,
    high: 35,
    critical: 60
  };
  let score = 0;
  for (const p of permissions) {
    score += weights[HOUSE_PERMISSIONS[p].risk];
  }
  return Math.min(100, score + permissions.length * 2);
}
function describePermissionList(permissions) {
  if (permissions.length === 0) return "No permissions requested.";
  const labels = permissions.map((p) => HOUSE_PERMISSIONS[p].label);
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

// src/permissions.ts
function hasPermission(granted, required) {
  return granted.includes(required);
}
function assertPermission(granted, required, method) {
  if (!hasPermission(granted, required)) {
    throw new Error(
      `Family SDK: ${method} requires ${required}. Request it in your manifest.`
    );
  }
}
function validatePermissions(requested) {
  const validSet = /* @__PURE__ */ new Set([
    "identity:read",
    "identity:wallet",
    "identity:balance",
    "house:read",
    "members:read",
    "social:post",
    "social:comment",
    "social:react",
    "events:read",
    "events:write",
    "content:read",
    "content:write",
    "treasury:read",
    "treasury:deposit",
    "treasury:spend:limited",
    "treasury:spend:propose",
    "payments:tip",
    "payments:escrow",
    "contract:invoke",
    // Legacy domain-specific permissions (kept for backward compatibility)
    "wiki:read",
    "wiki:write",
    "polls:read",
    "polls:write",
    "campaigns:read",
    "campaigns:write",
    "thesis:read",
    "thesis:write",
    // Module-scoped key-value storage
    "store:read",
    "store:write",
    // Read-only surface scopes (no grant required, but valid in manifests)
    "profile:read",
    "chart:read",
    "vault:read",
    "governance:read",
    // User-app scopes (install-to-user-account apps)
    "user:identity",
    "user:balance",
    "payments:charge",
    "storage:upload",
    "trading:agent"
  ]);
  const valid = [];
  const invalid = [];
  for (const p of requested) {
    if (validSet.has(p)) {
      valid.push(p);
    } else {
      invalid.push(p);
    }
  }
  return { valid, invalid };
}

// src/index.ts
var SDK_VERSION = "0.1.0";
function getParentOrigin() {
  if (typeof document !== "undefined" && document.referrer) {
    try {
      return new URL(document.referrer).origin;
    } catch {
    }
  }
  const ancestorOrigins = window.location.ancestorOrigins;
  if (ancestorOrigins && ancestorOrigins.length > 0) {
    return ancestorOrigins[0];
  }
  throw new Error(
    "Family SDK: cannot resolve parent origin \u2014 no document.referrer and no window.location.ancestorOrigins"
  );
}
function makeCallId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `call-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
function createFamilySDK(targetWindow) {
  const parent = targetWindow ?? window.parent;
  const pending = /* @__PURE__ */ new Map();
  function call(method, args) {
    return new Promise((resolve, reject) => {
      const id = makeCallId();
      const timer = setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Family SDK call timed out: ${method}`));
        }
      }, 3e4);
      pending.set(id, {
        resolve: (value) => resolve(value),
        reject,
        timer
      });
      const payload = { method, args };
      const msg = {
        type: "FAMILY:CALL",
        id,
        namespace: "family-sdk",
        payload
      };
      parent.postMessage(msg, getParentOrigin());
    });
  }
  function onMessage(event) {
    if (event.source !== parent) return;
    const data = event.data;
    if (!data || data.namespace !== "family-sdk") return;
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
    init: (sdkVersion) => call("init", [sdkVersion ?? SDK_VERSION]),
    getContext: () => call("getContext", []),
    getPermissions: () => call("getPermissions", []),
    requestPermission: (scope) => call("requestPermission", [scope]),
    identity: {
      getMe: () => call("identity.getMe", []),
      getMembers: () => call("identity.getMembers", [])
    },
    house: {
      getContext: () => call("house.getContext", [])
    },
    profile: {
      getProfile: () => call("profile.getProfile", []),
      getStats: () => call("profile.getStats", [])
    },
    chart: {
      getPrices: () => call("chart.getPrices", []),
      getOhlcv: (intervalSeconds) => call("chart.getOhlcv", [intervalSeconds]),
      getTrades: (opts) => call("chart.getTrades", [opts])
    },
    vault: {
      getHoldings: () => call("vault.getHoldings", []),
      getActivity: () => call("vault.getActivity", [])
    },
    governance: {
      getProposals: () => call("governance.getProposals", []),
      getProposal: (id) => call("governance.getProposal", [id])
    },
    social: {
      post: (input) => call("social.post", [input]),
      comment: (postId, body) => call("social.comment", [postId, body]),
      createPoll: (input) => call("social.createPoll", [input]),
      votePoll: (postId, optionId) => call("social.votePoll", [postId, optionId])
    },
    wiki: {
      listPages: () => call("wiki.listPages", []),
      getPage: (slug) => call("wiki.getPage", [slug]),
      savePage: (input) => call("wiki.savePage", [input]),
      deletePage: (slug) => call("wiki.deletePage", [slug])
    },
    campaigns: {
      list: () => call("campaigns.list", []),
      get: (slug) => call("campaigns.get", [slug]),
      create: (input) => call("campaigns.create", [input]),
      approve: (slug, vote) => call("campaigns.approve", [slug, vote]),
      submit: (slug, contentUrl, caption, platform) => call("campaigns.submit", [
        slug,
        contentUrl,
        caption,
        platform
      ]),
      voteSubmission: (slug, submissionId, score) => call("campaigns.voteSubmission", [
        slug,
        submissionId,
        score
      ]),
      finalizeApproval: (slug) => call(
        "campaigns.finalizeApproval",
        [slug]
      ),
      close: (slug) => call("campaigns.close", [slug])
    },
    thesis: {
      list: () => call("thesis.list", []),
      create: (input) => call("thesis.create", [input]),
      react: (postId, stickerId) => call("thesis.react", [
        postId,
        stickerId
      ])
    },
    products: {
      list: (includeDrafts) => call("products.list", [includeDrafts]),
      get: (slug) => call("products.get", [slug]),
      create: (input) => call("products.create", [input]),
      update: (slug, input) => call("products.update", [slug, input]),
      publish: (slug) => call("products.publish", [slug]),
      unpublish: (slug) => call("products.unpublish", [slug]),
      remove: (slug) => call("products.remove", [slug])
    },
    treasury: {
      getTreasury: () => call("treasury.getTreasury", []),
      proposeSpend: (input) => call("treasury.proposeSpend", [input])
    },
    payments: {
      tip: (input) => call("payments.tip", [input]),
      escrow: (input) => call("payments.escrow", [input]),
      charge: (input) => call("payments.charge", [input])
    },
    contract: {
      invoke: (address, method, args, options) => call("contract.invoke", [address, method, args, options])
    },
    store: {
      get: (key) => call("store.get", [key]),
      set: (key, value) => call("store.set", [key, value]),
      delete: (key) => call("store.delete", [key]),
      list: (prefix) => call("store.list", [prefix])
    },
    storage: {
      upload: (file) => call("storage.upload", [file])
    },
    ui: {
      toast: (message, type = "info") => {
        void call("ui.toast", [message, type]);
      },
      modal: (options) => call("ui.modal", [options])
    }
  };
}
export {
  HOUSE_PERMISSIONS,
  MODULE_SURFACE_LABELS,
  SDK_VERSION,
  assertPermission,
  createFamilySDK,
  describePermissionList,
  hasPermission,
  isFamilyContext,
  isUserContext,
  permissionRiskScore,
  validatePermissions
};
//# sourceMappingURL=index.js.map