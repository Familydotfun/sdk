/**
 * Family SDK public types.
 *
 * The SDK is consumed in two modes:
 * 1. Internal React apps use `useFamily()` from `FamilyKernelProvider`.
 * 2. External iframe apps use `createFamilySDK(window)` which talks over
 *    `postMessage` to the Family runtime.
 */
/** Tabs of the family page where modules can be mounted. */
export type ModuleSurface = "chart" | "profile" | "house" | "vault" | "governance";
export type ModulePermission = "identity:read" | "identity:wallet" | "identity:balance" | "house:read" | "members:read" | "social:post" | "social:comment" | "social:react" | "events:read" | "events:write" | "content:read" | "content:write" | "treasury:read" | "treasury:deposit" | "treasury:spend:limited" | "treasury:spend:propose" | "payments:tip" | "payments:escrow" | "contract:invoke" | "wiki:read" | "wiki:write" | "polls:read" | "polls:write" | "campaigns:read" | "campaigns:write" | "thesis:read" | "thesis:write" | "store:read" | "store:write" | "profile:read" | "chart:read" | "vault:read" | "governance:read" | "user:identity" | "user:balance" | "payments:charge" | "storage:upload" | "trading:agent";
export type ModuleRiskLevel = "low" | "medium" | "high" | "critical";
export type ModuleCommandArgType = "user" | "number" | "symbol" | "address" | "string";
/** Text command a module registers for inline use in the house forum. */
export interface ModuleCommandSpec {
    name: string;
    description: string;
    usage: string;
    args: {
        name: string;
        type: ModuleCommandArgType;
    }[];
    /** Capability required to invoke (e.g. "payments:tip"). */
    permission: ModulePermission;
}
export interface ModulePermissionMeta {
    label: string;
    description: string;
    risk: ModuleRiskLevel;
    category: "identity" | "house" | "social" | "money";
    /** Read-only public-data scope; never requires a user grant. */
    readOnly?: boolean;
}
export interface HouseMember {
    wallet: string;
    name: string | null;
    role: "head" | "moderator" | "holder" | "system";
    avatarUrl?: string | null;
}
export interface FamilyContext {
    mode: "family";
    familySlug: string;
    surface: ModuleSurface;
    /** null for coinless families */
    tokenAddress: string | null;
    chainId: number;
    name: string;
    symbol: string;
    imageUri?: string | null;
    memberCount: number;
    minHold: string;
    isMember: boolean;
    isModerator: boolean;
    isHead: boolean;
    forumPublic: boolean;
}
/** User-mode context — handed to apps installed on a user account. */
export interface UserContext {
    mode: "user";
    wallet: string;
    appId: string;
    /** Present only when the app was launched from a family's surface. */
    family?: {
        slug: string;
        name: string;
        role: "head" | "moderator" | "holder" | "visitor";
    };
}
/** Runtime context: family mode (modules) or user mode (apps). */
export type SDKContext = FamilyContext | UserContext;
export declare function isFamilyContext(ctx: SDKContext): ctx is FamilyContext;
export declare function isUserContext(ctx: SDKContext): ctx is UserContext;
/** Handshake result returned by init(). */
export interface InitResult {
    ok: boolean;
    /** Host-side protocol version. */
    hostVersion?: string;
    /** False when the SDK version is outside the host's supported range. */
    supported?: boolean;
    /**
     * Short-lived JWT the app uses to call its own backend (user mode).
     * Minted lazily by the host during init; validate it server-side per call.
     */
    launchToken?: string;
    error?: string;
}
export interface HouseIdentity {
    wallet: string;
    name: string | null;
    avatarUrl?: string | null;
    role: "head" | "moderator" | "holder" | "system";
    balance: string;
}
export interface HouseTreasury {
    tokenAddress: string;
    familyVault: string | null;
    treasuryBps: number;
    tokenBalance: string;
    nativeBalance: string;
}
/** Family profile summary for the `profile` namespace. */
export interface FamilyProfile {
    familySlug: string;
    name: string;
    symbol: string;
    imageUri?: string | null;
    description?: string | null;
    memberCount: number;
}
export interface FamilyProfileStats {
    memberCount: number;
    postCount: number;
}
/** Single OHLCV bar (unix seconds bucket). */
export interface OhlcvBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface FamilyPrices {
    /** Latest close from indexed trades; null when no trades exist. */
    price: number | null;
    /** Rolling 24h change percent; 0 when unavailable. */
    changePct24h: number;
}
export interface FamilyOhlcvResult {
    bars: OhlcvBar[];
    intervalUsed: number;
    tickCount: number;
    /** Rolling 24h change percent. */
    changePct: number;
}
/** Indexed trade row, matching the backend trades feed. */
export interface FamilyTrade {
    id: string;
    chainId: number;
    tokenAddress: string;
    side: "buy" | "sell";
    trader: string;
    amountToken: string;
    amountQuote: string;
    priceUsd: number | null;
    txHash: string;
    blockNumber: number;
    createdAt: string;
}
export interface FamilyTradesResult {
    page: number;
    pageSize: number;
    totalPages: number;
    total: number;
    trades: FamilyTrade[];
}
/** Vault holdings snapshot (family vault + treasury balances). */
export interface FamilyVaultHoldings {
    familyVault: string | null;
    treasuryBps: number;
    tokenBalance: string;
    nativeBalance: string;
}
/** One vault activity row. The host returns raw backend proposal records, so
 * only the common fields are named here; the rest pass through. */
export interface VaultActivityProposal {
    id: string;
    status?: string | null;
    createdAt: string;
    [k: string]: unknown;
}
export interface FamilyVaultActivity {
    proposals: VaultActivityProposal[];
}
export interface FamilyProposal {
    id: string;
    title: string;
    body: string;
    author: {
        wallet: string;
        name: string | null;
        role: "head" | "moderator" | "holder" | "system";
    };
    status?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface FamilyProposalsResult {
    ok: boolean;
    proposals: FamilyProposal[];
    error?: string;
}
export interface FamilyProposalResult {
    ok: boolean;
    proposal?: FamilyProposal;
    error?: string;
}
export interface TipInput {
    to: string;
    amount: string;
    message?: string;
}
/** Platform-mediated charge: host shows the split sheet, user signs one
 *  on-chain transfer, backend verifies and writes the ledger split. */
export interface ChargeInput {
    /** Human units, e.g. "5" */
    amount: string;
    /** Quote asset symbol, e.g. "USDG" */
    currency: string;
    /** What the user is buying — shown on the confirmation sheet. */
    item: string;
    /** App-generated idempotency key — retries never double-charge. */
    idempotencyKey: string;
}
export interface ChargeSplit {
    /** Gross amount charged (atomic units). */
    gross: string;
    /** Platform fee — 10% of gross. */
    platform: string;
    /** Owning family's vault share of the remaining 90%. */
    family: string;
    /** Developer's share of the remaining 90%. */
    developer: string;
}
export interface ChargeResult {
    ok: boolean;
    chargeId?: string;
    txHash?: string;
    split?: ChargeSplit;
    error?: string;
}
export interface TipResult {
    ok: boolean;
    txHash?: string;
    error?: string;
}
export interface SpendProposalInput {
    title: string;
    description: string;
    to: string;
    tokenAddress?: string;
    amount: string;
}
export interface SpendProposalResult {
    ok: boolean;
    proposalId?: string;
    error?: string;
}
export interface SocialPostInput {
    title?: string;
    body: string;
    kind?: "discussion" | "shoutout" | "poll" | "proposal";
    meta?: Record<string, unknown>;
}
export interface SocialPostResult {
    ok: boolean;
    postId?: string;
    error?: string;
}
export interface WikiPageInput {
    slug: string;
    title: string;
    body: string;
}
export interface WikiPage {
    slug: string;
    title: string;
    body: string;
    updatedBy: string;
    updatedAt: string;
}
export interface WikiListResult {
    ok: boolean;
    pages: WikiPage[];
    canEdit: boolean;
    error?: string;
}
export interface WikiPageResult {
    ok: boolean;
    page?: WikiPage;
    canEdit: boolean;
    error?: string;
}
export interface PollOption {
    id: string;
    label: string;
}
export interface PollInput {
    title: string;
    body: string;
    options: PollOption[];
    weight?: "equal" | "balance";
}
export interface PollResult {
    ok: boolean;
    postId?: string;
    error?: string;
}
export interface CampaignInput {
    title: string;
    description: string;
    type: "meme_war" | "video" | "spaces" | "educational" | "alpha" | "challenge" | "translation" | "developer";
    proposedPoints: number;
    approvalDurationHours?: number;
    durationHours?: number;
}
export interface CampaignListResult {
    ok: boolean;
    campaigns: unknown[];
    error?: string;
}
export interface CampaignDetailResult {
    ok: boolean;
    campaign?: unknown;
    error?: string;
}
export interface ThesisInput {
    title: string;
    body: string;
    sentiment?: "bullish" | "bearish";
}
export interface ThesisPost {
    id: string;
    title: string;
    body: string;
    sentiment?: "bullish" | "bearish" | null;
    author: {
        wallet: string;
        name: string | null;
        role: "head" | "moderator" | "holder" | "system";
    };
    reactions: Record<string, {
        count: number;
        me: boolean;
    }>;
    createdAt: string;
    updatedAt: string;
}
export interface ThesisListResult {
    ok: boolean;
    theses: ThesisPost[];
    error?: string;
}
export interface ThesisResult {
    ok: boolean;
    thesis?: ThesisPost;
    error?: string;
}
export interface ProductRecord {
    id: string;
    familySlug: string;
    slug: string;
    title: string;
    tagline: string;
    description: string;
    icon: string | null;
    images: string[];
    links: {
        website?: string;
        twitter?: string;
        github?: string;
    };
    /** Chain the product lives on; null when not chain-specific. */
    chainId: number | null;
    /** 1-5 category ids from the products categories catalog. */
    categories: string[];
    status: "draft" | "published";
    createdBy: string;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface ProductInput {
    title?: string;
    tagline?: string;
    description?: string;
    icon?: string | null;
    images?: string[];
    links?: {
        website?: string;
        twitter?: string;
        github?: string;
    };
    chainId?: number | null;
    categories?: string[];
    status?: "draft" | "published";
    slug?: string;
}
export interface ProductListResult {
    ok: boolean;
    products: ProductRecord[];
    canModerate: boolean;
    limit?: number;
    error?: string;
}
export interface ProductResult {
    ok: boolean;
    product?: ProductRecord;
    canModerate?: boolean;
    error?: string;
}
export interface ModuleStoreRecord {
    key: string;
    value: unknown;
    updatedBy?: string | null;
    updatedAt?: string;
}
/** Key-only entry returned by store.list (values omitted). */
export interface ModuleStoreKeyRef {
    key: string;
    updatedBy?: string | null;
    updatedAt?: string;
}
export interface HouseAppContract {
    chainId: number;
    address: string;
    methods: string[];
    /** ABI fragment for the declared methods. Optional for escrow deposits (ERC20 transfer). */
    abi?: unknown;
    /** Per-call native-value cap in atomic units — calls above this are rejected. */
    maxValue?: string;
}
export interface EscrowInput {
    token: string;
    amount: string;
    contract: string;
    action: "deposit" | "withdraw";
}
export interface EscrowResult {
    ok: boolean;
    txHash?: string;
    error?: string;
}
export interface ContractInvokeResult {
    ok: boolean;
    txHash?: string;
    error?: string;
}
/** Result of a host-bridged file upload (stored on the platform IPFS pipeline). */
export interface StorageUploadResult {
    ok: boolean;
    url?: string;
    cid?: string;
    error?: string;
}
export interface ModuleManifest {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    icon?: string;
    tags: string[];
    permissions: ModulePermission[];
    /** Family page tabs where this module can be mounted. */
    surfaces: ModuleSurface[];
    /** UI modules, command modules (forum text commands), or both. Defaults to "ui". */
    integration?: "ui" | "command" | "both";
    /** Forum text commands exposed when integration is "command" or "both". */
    commands?: ModuleCommandSpec[];
    /** Contracts this app may ask the user to interact with. */
    contracts?: HouseAppContract[];
    staking?: {
        amount: string;
        token: string;
    };
    entryUrl?: string;
}
export interface ModuleDefinition extends ModuleManifest {
    source: "internal" | "external";
    component?: string;
    riskScore: number;
}
/** Install record; mirrors the backend HouseAppInstall model. */
export interface HouseAppInstall {
    id: string;
    appId: string;
    familySlug: string;
    tokenAddress: string | null;
    permissions: ModulePermission[];
    installedBy: string;
    installedAt: string;
    paused: boolean;
}
export interface FamilySDK {
    init: (sdkVersion?: string) => Promise<InitResult>;
    getContext: () => Promise<SDKContext>;
    getPermissions: () => Promise<ModulePermission[]>;
    requestPermission: (scope: ModulePermission) => Promise<boolean>;
    identity: {
        getMe: () => Promise<HouseIdentity>;
        getMembers: () => Promise<HouseMember[]>;
    };
    house: {
        getContext: () => Promise<FamilyContext>;
    };
    profile: {
        getProfile: () => Promise<FamilyProfile>;
        getStats: () => Promise<FamilyProfileStats>;
    };
    chart: {
        getPrices: () => Promise<FamilyPrices>;
        getOhlcv: (intervalSeconds?: number) => Promise<FamilyOhlcvResult>;
        getTrades: (opts?: {
            page?: number;
            all?: boolean;
        }) => Promise<FamilyTradesResult>;
    };
    vault: {
        getHoldings: () => Promise<FamilyVaultHoldings>;
        getActivity: () => Promise<FamilyVaultActivity>;
    };
    governance: {
        getProposals: () => Promise<FamilyProposalsResult>;
        getProposal: (id: string) => Promise<FamilyProposalResult>;
    };
    social: {
        post: (input: SocialPostInput) => Promise<SocialPostResult>;
        comment: (postId: string, body: string) => Promise<SocialPostResult>;
        createPoll: (input: PollInput) => Promise<PollResult>;
        votePoll: (postId: string, optionId: string) => Promise<{
            ok: boolean;
            error?: string;
        }>;
    };
    wiki: {
        listPages: () => Promise<WikiListResult>;
        getPage: (slug: string) => Promise<WikiPageResult>;
        savePage: (input: WikiPageInput) => Promise<WikiPageResult>;
        deletePage: (slug: string) => Promise<{
            ok: boolean;
            error?: string;
        }>;
    };
    campaigns: {
        list: () => Promise<CampaignListResult>;
        get: (slug: string) => Promise<CampaignDetailResult>;
        create: (input: CampaignInput) => Promise<CampaignDetailResult>;
        approve: (slug: string, vote: "yes" | "no") => Promise<{
            ok: boolean;
            error?: string;
        }>;
        submit: (slug: string, contentUrl: string, caption?: string, platform?: string) => Promise<{
            ok: boolean;
            submission?: unknown;
            error?: string;
        }>;
        voteSubmission: (slug: string, submissionId: string, score: number) => Promise<{
            ok: boolean;
            error?: string;
        }>;
        finalizeApproval: (slug: string) => Promise<{
            ok: boolean;
            approved?: boolean;
            error?: string;
        }>;
        close: (slug: string) => Promise<{
            ok: boolean;
            error?: string;
        }>;
    };
    thesis: {
        list: () => Promise<ThesisListResult>;
        create: (input: ThesisInput) => Promise<ThesisResult>;
        react: (postId: string, stickerId: string) => Promise<{
            ok: boolean;
            removed?: boolean;
            error?: string;
        }>;
    };
    products: {
        list: (includeDrafts?: boolean) => Promise<ProductListResult>;
        get: (slug: string) => Promise<ProductResult>;
        create: (input: ProductInput) => Promise<ProductResult>;
        update: (slug: string, input: ProductInput) => Promise<ProductResult>;
        publish: (slug: string) => Promise<ProductResult>;
        unpublish: (slug: string) => Promise<ProductResult>;
        remove: (slug: string) => Promise<{
            ok: boolean;
            error?: string;
        }>;
    };
    treasury: {
        getTreasury: () => Promise<HouseTreasury>;
        proposeSpend: (input: SpendProposalInput) => Promise<SpendProposalResult>;
    };
    payments: {
        tip: (input: TipInput) => Promise<TipResult>;
        escrow: (input: EscrowInput) => Promise<EscrowResult>;
        charge: (input: ChargeInput) => Promise<ChargeResult>;
    };
    contract: {
        invoke: (address: string, method: string, args: unknown[], options?: {
            value?: string;
            abi?: unknown;
        }) => Promise<ContractInvokeResult>;
    };
    /** Module-scoped key-value storage, namespaced by the hosting module's appId. */
    store: {
        get: (key: string) => Promise<ModuleStoreRecord>;
        set: (key: string, value: unknown) => Promise<{
            ok: boolean;
            key: string;
        }>;
        delete: (key: string) => Promise<{
            ok: boolean;
            deleted: number;
        }>;
        list: (prefix?: string) => Promise<ModuleStoreKeyRef[]>;
    };
    /** Host-bridged uploads — the app never talks to IPFS directly. */
    storage: {
        upload: (file: File) => Promise<StorageUploadResult>;
    };
    ui: {
        toast: (message: string, type?: "info" | "success" | "error") => void;
        modal: (options: {
            title: string;
            body: string;
            confirmLabel?: string;
            cancelLabel?: string;
        }) => Promise<boolean>;
    };
    /** Tear down the SDK: remove the message listener and reject all pending calls. */
    dispose: () => void;
}
export type HouseAppMessageType = "FAMILY:INIT" | "FAMILY:INIT:RESPONSE" | "FAMILY:CALL" | "FAMILY:CALL:RESPONSE" | "FAMILY:EVENT";
export interface HouseAppMessage {
    type: HouseAppMessageType;
    id: string;
    namespace: "family-sdk";
    payload?: unknown;
    error?: string;
}
export interface HouseCallPayload {
    method: string;
    args: unknown[];
}
