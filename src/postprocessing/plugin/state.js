export function createPluginState(enabled) {
    return {
        enabled,
        lastFrameMs: 0,
        passRecords: [],
    };
}
export function getPassRecord(state, id) {
    const record = state.passRecords.find((entry) => entry.id === id);
    if (!record) {
        throw new Error(`Pass "${id}" is not registered.`);
    }
    return record;
}
export function toPluginStats(state) {
    return {
        enabled: state.enabled,
        frameMs: state.lastFrameMs,
        passes: state.passRecords
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((record) => ({
            id: record.id,
            enabled: record.enabled,
            order: record.order,
        })),
    };
}
