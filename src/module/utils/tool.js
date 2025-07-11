export function allOwnKeysAssign(target, ...sources) {
    sources.forEach(source => {
        const descriptors = Object.getOwnPropertyDescriptors(source);
        Object.defineProperties(target, descriptors);
    });
    return target;
}