import type { PassRecord } from "../types/internal";
import type { PostPass, PostPassId, RegisteredPassOptions } from "../types/public";
export declare function registerPassRecord(passRecords: PassRecord[], pass: PostPass, options?: RegisteredPassOptions): PassRecord;
export declare function unregisterPassRecord(passRecords: PassRecord[], id: PostPassId): PassRecord;
export declare function setPassOrder(passRecords: PassRecord[], idsInExecutionOrder: PostPassId[]): void;
export declare function getEnabledPasses(passRecords: PassRecord[]): PassRecord[];
