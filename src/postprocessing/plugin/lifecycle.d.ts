import type { MapLike } from "../types/public";
export interface MapLifecycleHandlers {
    onRender: () => void;
    onResize: () => void;
    onRemove: () => void;
}
export declare function bindMapLifecycle(map: MapLike, handlers: MapLifecycleHandlers): () => void;
