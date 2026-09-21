import { ModulePermission, ModulePermissionMeta, ModuleSurface } from "./types";

export const HOUSE_PERMISSIONS: Record<ModulePermission, ModulePermissionMeta> = {
  "identity:read": {
    label: "Read your identity",
    description: "Access your ANS name, avatar, and role in this House.",
    risk: "low",
    category: "identity",
  },
  "identity:wallet": {
    label: "Read wallet address",
    description: "Access your connected wallet address.",
    risk: "low",
    category: "identity",
  },
  "identity:balance": {
    label: "Read token balance",
    description: "Access your token balance in this House.",
    risk: "low",
    category: "identity",
  },
  "house:read": {
    label: "Read House info",
    description: "Access public House metadata like name, symbol, and member count.",
    risk: "low",
    category: "house",
  },
  "members:read": {
    label: "Read member list",
    description: "Access the list of House members and their roles.",
    risk: "low",
    category: "house",
  },
  "social:post": {
    label: "Post to Town Hall",
    description: "Publish posts to the House Town Hall feed as the app.",
    risk: "medium",
    category: "social",
  },
  "social:comment": {
    label: "Comment on posts",
    description: "Add comments to House posts as the app.",
    risk: "medium",
    category: "social",
  },
  "social:react": {
    label: "React to posts",
    description: "Add reactions and votes to House posts.",
    risk: "low",
    category: "social",
  },
  "events:read": {
    label: "Read events",
    description: "Read House campaigns and events.",
    risk: "low",
    category: "social",
  },
  "events:write": {
    label: "Create events",
    description: "Create campaigns and events in the House.",
    risk: "medium",
    category: "social",
  },
  "treasury:read": {
    label: "Read treasury",
    description: "View House treasury balances.",
    risk: "low",
    category: "money",
  },
  "treasury:deposit": {
    label: "Deposit to treasury",
    description: "Receive funds into the House treasury.",
    risk: "low",
    category: "money",
  },
  "treasury:spend:limited": {
    label: "Spend with limits",
    description: "Spend House funds up to an approved daily/monthly cap.",
    risk: "high",
    category: "money",
  },
  "treasury:spend:propose": {
    label: "Propose spends",
    description: "Create treasury spend proposals. Does not move funds directly.",
    risk: "medium",
    category: "money",
  },
  "payments:tip": {
    label: "Send tips",
    description: "Initiate tips from your balance to other members.",
    risk: "medium",
    category: "money",
  },
  "payments:escrow": {
    label: "Use app escrow",
    description: "Deposit or withdraw your funds from app-controlled contracts (e.g., prediction markets). Each transaction requires your wallet signature.",
    risk: "high",
    category: "money",
  },
  "contract:invoke": {
    label: "Call app contracts",
    description: "Call declared methods on app-controlled contracts. Each call requires your wallet signature.",
    risk: "high",
    category: "money",
  },
  "content:read": {
    label: "Read content",
    description: "Read wiki pages and long-form content.",
    risk: "low",
    category: "social",
  },
  "content:write": {
    label: "Write content",
    description: "Create and edit wiki pages and long-form content.",
    risk: "medium",
    category: "social",
  },
  "wiki:read": {
    label: "Read wiki",
    description: "Read family wiki pages.",
    risk: "low",
    category: "social",
  },
  "wiki:write": {
    label: "Write wiki",
    description: "Create and edit family wiki pages.",
    risk: "medium",
    category: "social",
  },
  "polls:read": {
    label: "Read polls",
    description: "View polls and proposals.",
    risk: "low",
    category: "social",
  },
  "polls:write": {
    label: "Create polls",
    description: "Create polls and cast votes.",
    risk: "medium",
    category: "social",
  },
  "campaigns:read": {
    label: "Read campaigns",
    description: "View campaigns and quests.",
    risk: "low",
    category: "social",
  },
  "campaigns:write": {
    label: "Manage campaigns",
    description: "Create campaigns, approve them, and close payouts.",
    risk: "high",
    category: "social",
  },
  "thesis:read": {
    label: "Read theses",
    description: "View why members joined or bought into this family.",
    risk: "low",
    category: "social",
  },
  "thesis:write": {
    label: "Write theses",
    description: "Post your own thesis and react to others' theses.",
    risk: "medium",
    category: "social",
  },
  "store:read": {
    label: "Read module storage",
    description: "Read data this module has stored for this House.",
    risk: "low",
    category: "house",
  },
  "store:write": {
    label: "Write module storage",
    description: "Create, update, and delete this module's stored data for this House.",
    risk: "medium",
    category: "house",
  },
  // Read-only surface scopes: public data, no user grant required.
  "profile:read": {
    label: "Read profile",
    description: "Read public family profile info and stats.",
    risk: "low",
    category: "house",
    readOnly: true,
  },
  "chart:read": {
    label: "Read chart data",
    description: "Read public prices, OHLCV bars, and trade history.",
    risk: "low",
    category: "house",
    readOnly: true,
  },
  "vault:read": {
    label: "Read vault",
    description: "Read public vault holdings and activity.",
    risk: "low",
    category: "money",
    readOnly: true,
  },
  "governance:read": {
    label: "Read proposals",
    description: "Read public governance proposals.",
    risk: "low",
    category: "house",
    readOnly: true,
  },
  // User-app scopes
  "user:identity": {
    label: "Read your identity",
    description: "Access your wallet and profile in user apps.",
    risk: "low",
    category: "identity",
  },
  "user:balance": {
    label: "Read your balance",
    description: "Access your in-app balance in user apps.",
    risk: "low",
    category: "money",
  },
  "payments:charge": {
    label: "Charge you for purchases",
    description: "Take payments from your balance. Every charge shows a confirmation with the fee split before you sign.",
    risk: "high",
    category: "money",
  },
  "storage:upload": {
    label: "Upload images and files",
    description: "Send files through the platform's storage on the app's behalf.",
    risk: "medium",
    category: "house",
  },
  "trading:agent": {
    label: "Trade on your behalf",
    description: "Hold a trade-only agent key: it can place and cancel orders but can never withdraw funds. Bad trades are still possible — set exposure limits.",
    risk: "critical",
    category: "money",
  },
};

/** Human labels for module surfaces (family page tabs). */
export const MODULE_SURFACE_LABELS: Record<ModuleSurface, string> = {
  chart: "Chart",
  profile: "Profile",
  house: "House",
  vault: "Vault",
  governance: "Governance",
};

export function permissionRiskScore(permissions: ModulePermission[]): number {
  const weights: Record<ModulePermissionMeta["risk"], number> = {
    low: 0,
    medium: 15,
    high: 35,
    critical: 60,
  };
  let score = 0;
  for (const p of permissions) {
    score += weights[HOUSE_PERMISSIONS[p].risk];
  }
  return Math.min(100, score + permissions.length * 2);
}

export function describePermissionList(permissions: ModulePermission[]): string {
  if (permissions.length === 0) return "No permissions requested.";
  const labels = permissions.map((p) => HOUSE_PERMISSIONS[p].label);
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}
