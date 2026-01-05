/**
 * Offline queue manager for storing and syncing actions
 */

const QUEUE_KEY = 'offline_queue';

// Get queue from localStorage
export const getQueue = () => {
    try {
        const queue = localStorage.getItem(QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Failed to get queue:', error);
        return [];
    }
};

// Save queue to localStorage
const saveQueue = (queue) => {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Failed to save queue:', error);
    }
};

// Add action to queue
export const addToQueue = (action, data) => {
    const queue = getQueue();
    const item = {
        id: `${Date.now()}_${Math.random()}`,
        action,
        data,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retries: 0
    };
    queue.push(item);
    saveQueue(queue);
    return item;
};

// Remove item from queue
export const removeFromQueue = (id) => {
    const queue = getQueue();
    const filtered = queue.filter(item => item.id !== id);
    saveQueue(filtered);
};

// Update item status
export const updateQueueItem = (id, updates) => {
    const queue = getQueue();
    const updated = queue.map(item =>
        item.id === id ? { ...item, ...updates } : item
    );
    saveQueue(updated);
};

// Clear successful items
export const clearSuccessful = () => {
    const queue = getQueue();
    const filtered = queue.filter(item => item.status !== 'success');
    saveQueue(filtered);
};

// Get pending count
export const getPendingCount = () => {
    const queue = getQueue();
    return queue.filter(item => item.status === 'pending' || item.status === 'retrying').length;
};

// Sync queue with server
export const syncQueue = async (api) => {
    const queue = getQueue();
    const pending = queue.filter(item => item.status === 'pending' || item.status === 'retrying');

    for (const item of pending) {
        try {
            // Execute the queued action
            let response;
            switch (item.action) {
                case 'CREATE_TASK':
                    response = await api.post('/tasks', item.data);
                    break;
                case 'UPDATE_TASK':
                    response = await api.put(`/tasks/${item.data.id}`, item.data);
                    break;
                case 'CREATE_GOAL':
                    response = await api.post('/goals', item.data);
                    break;
                case 'UPDATE_GOAL':
                    response = await api.put(`/goals/${item.data.id}`, item.data);
                    break;
                default:
                    console.warn('Unknown action:', item.action);
                    continue;
            }

            // Mark as successful
            updateQueueItem(item.id, { status: 'success' });
        } catch (error) {
            console.error('Failed to sync item:', item, error);

            // Increment retries
            const retries = item.retries + 1;
            if (retries >= 3) {
                updateQueueItem(item.id, { status: 'failed', retries });
            } else {
                updateQueueItem(item.id, { status: 'retrying', retries });
            }
        }
    }

    // Clean up successful items
    clearSuccessful();

    return getPendingCount();
};
