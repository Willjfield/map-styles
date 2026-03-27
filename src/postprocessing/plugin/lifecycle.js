export function bindMapLifecycle(map, handlers) {
    map.on("render", handlers.onRender);
    map.on("resize", handlers.onResize);
    map.on("remove", handlers.onRemove);
    return () => {
        map.off("render", handlers.onRender);
        map.off("resize", handlers.onResize);
        map.off("remove", handlers.onRemove);
    };
}
