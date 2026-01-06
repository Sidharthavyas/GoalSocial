const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheData = (key, data) => {
    const cacheItem = {
        data,
        timestamp: Date.now()
    };
    try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
        console.error('Error caching data:', error);
    }
};

export const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;

        const cacheItem = JSON.parse(cached);
        const age = Date.now() - cacheItem.timestamp;

        if (age > CACHE_DURATION) {
            localStorage.removeItem(`cache_${key}`);
            return null;
        }

        return cacheItem.data;
    } catch (error) {
        console.error('Error getting cached data:', error);
        return null;
    }
};

export const clearCache = (key) => {
    try {
        if (key) {
            localStorage.removeItem(`cache_${key}`);
        } else {
            // Clear all cache items
            const keys = Object.keys(localStorage);
            keys.forEach(k => {
                if (k.startsWith('cache_')) {
                    localStorage.removeItem(k);
                }
            });
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

export const clearAllCache = () => clearCache();
