import { ModulePermission } from "./types";

export function hasPermission(
  granted: ModulePermission[],
  required: ModulePermission
): boolean {
  return granted.includes(required);
}

export function assertPermission(
  granted: ModulePermission[],
  required: ModulePermission,
  method: string
): void {
  if (!hasPermission(granted, required)) {
    throw new Error(
      `Family SDK: ${method} requires ${required}. Request it in your manifest.`
    );
  }
}

export function validatePermissions(
  requested: string[]
): { valid: ModulePermission[]; invalid: string[] } {
  const validSet = new Set<string>([
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
  ]);

  const valid: ModulePermission[] = [];
  const invalid: string[] = [];
  for (const p of requested) {
    if (validSet.has(p)) {
      valid.push(p as ModulePermission);
    } else {
      invalid.push(p);
    }
  }
  return { valid, invalid };
}
