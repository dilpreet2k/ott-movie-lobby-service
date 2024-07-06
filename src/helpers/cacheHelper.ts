import NodeCache from 'node-cache';
const cache = new NodeCache();

const CacheHelper = {
    getValueFromKey: (key: string): any => {
        return cache.get(key);
    },

    setValueByKey: (key: string, value: any, ttl: number = 20): void => {
        cache.set(key, value, ttl);
    }
};

export {
    CacheHelper,
};
