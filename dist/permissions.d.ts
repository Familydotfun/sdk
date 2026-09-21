import { ModulePermission } from "./types";
export declare function hasPermission(granted: ModulePermission[], required: ModulePermission): boolean;
export declare function assertPermission(granted: ModulePermission[], required: ModulePermission, method: string): void;
export declare function validatePermissions(requested: string[]): {
    valid: ModulePermission[];
    invalid: string[];
};
