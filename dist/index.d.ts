import { FamilySDK } from "./types";
export * from "./types";
export * from "./constants";
export * from "./permissions";
/** SDK protocol version — sent in init() for host negotiation. */
export declare const SDK_VERSION = "0.1.0";
/**
 * Create the Family SDK instance for an app running inside an iframe.
 * The SDK communicates with the parent window over postMessage.
 */
export declare function createFamilySDK(targetWindow?: Window): FamilySDK;
