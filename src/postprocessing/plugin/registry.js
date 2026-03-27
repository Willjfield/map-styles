export function registerPassRecord(passRecords, pass, options) {
    if (passRecords.some((record) => record.id === pass.id)) {
        throw new Error(`Pass "${pass.id}" is already registered.`);
    }
    const maxOrder = passRecords.reduce((acc, entry) => Math.max(acc, entry.order), -1);
    const record = {
        id: pass.id,
        pass,
        enabled: options?.enabled ?? true,
        order: options?.order ?? maxOrder + 1,
    };
    passRecords.push(record);
    return record;
}
export function unregisterPassRecord(passRecords, id) {
    const index = passRecords.findIndex((record) => record.id === id);
    if (index < 0) {
        throw new Error(`Pass "${id}" is not registered.`);
    }
    const [removed] = passRecords.splice(index, 1);
    return removed;
}
export function setPassOrder(passRecords, idsInExecutionOrder) {
    const existingIds = new Set(passRecords.map((record) => record.id));
    if (idsInExecutionOrder.length !== existingIds.size) {
        throw new Error("Pass order must include every registered pass exactly once.");
    }
    idsInExecutionOrder.forEach((id) => {
        if (!existingIds.has(id)) {
            throw new Error(`Pass "${id}" is not registered.`);
        }
    });
    const seen = new Set();
    idsInExecutionOrder.forEach((id) => {
        if (seen.has(id)) {
            throw new Error(`Pass "${id}" is duplicated in execution order.`);
        }
        seen.add(id);
    });
    const orderById = new Map(idsInExecutionOrder.map((id, index) => [id, index]));
    passRecords.forEach((record) => {
        const order = orderById.get(record.id);
        if (order === undefined) {
            throw new Error(`Missing order for pass "${record.id}".`);
        }
        record.order = order;
    });
}
export function getEnabledPasses(passRecords) {
    return passRecords
        .filter((record) => record.enabled)
        .sort((a, b) => a.order - b.order);
}
