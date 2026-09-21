import { ModulePermission, ModulePermissionMeta, ModuleSurface } from "./types";
export declare const HOUSE_PERMISSIONS: Record<ModulePermission, ModulePermissionMeta>;
/** Human labels for module surfaces (family page tabs). */
export declare const MODULE_SURFACE_LABELS: Record<ModuleSurface, string>;
export declare function permissionRiskScore(permissions: ModulePermission[]): number;
export declare function describePermissionList(permissions: ModulePermission[]): string;
