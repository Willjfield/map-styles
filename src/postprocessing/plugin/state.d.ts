import type { PassRecord } from "../types/internal";
import type { PluginStats, PostPassId } from "../types/public";
export interface PluginState {
    enabled: boolean;
    lastFrameMs: number;
    passRecords: PassRecord[];
}
export declare function createPluginState(enabled: boolean): PluginState;
export declare function getPassRecord(state: PluginState, id: PostPassId): PassRecord;
export declare function toPluginStats(state: PluginState): PluginStats;
