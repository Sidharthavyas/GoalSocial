// WebSocket Event Contracts

// Server -> Client Events
export const ServerEvents = {
    USER_ONLINE: 'user.online',
    USER_OFFLINE: 'user.offline',
    FRIEND_ACCEPTED: 'friend.accepted',
    FRIEND_REQUESTED: 'friend.requested',
    GOAL_CREATED: 'goal.created',
    GOAL_UPDATED: 'goal.updated',
    GOAL_DELETED: 'goal.deleted',
    PROGRESS_UPDATED: 'progress.updated',
    COMMENT_CREATED: 'comment.created',
    REACTION_CREATED: 'reaction.created',
    ACTIVITY_NEW: 'activity.new'
};

// Client -> Server Events
export const ClientEvents = {
    AUTHENTICATE: 'authenticate',
    GOAL_CREATE: 'goal.create',
    GOAL_UPDATE: 'goal.update',
    GOAL_DELETE: 'goal.delete',
    PROGRESS_UPDATE: 'progress.update',
    COMMENT_ADD: 'comment.add',
    REACTION_ADD: 'reaction.add'
};

// Event payload schemas (for documentation)
export const EventSchemas = {
    // Server -> Client
    'user.online': {
        userId: 'string',
        username: 'string'
    },
    'user.offline': {
        userId: 'string'
    },
    'friend.accepted': {
        friendId: 'string',
        username: 'string',
        uuid: 'string'
    },
    'friend.requested': {
        requestId: 'string',
        requester: 'object'
    },
    'goal.created': {
        goal: 'object'
    },
    'goal.updated': {
        goalId: 'string',
        updates: 'object'
    },
    'goal.deleted': {
        goalId: 'string'
    },
    'progress.updated': {
        taskId: 'string',
        date: 'date',
        goalId: 'string',
        percentage: 'number',
        value: 'number',
        completed: 'boolean'
    },
    'comment.created': {
        comment: 'object',
        targetType: 'string',
        targetId: 'string'
    },
    'reaction.created': {
        reaction: 'object',
        targetType: 'string',
        targetId: 'string'
    },
    'activity.new': {
        activity: 'object'
    },

    // Client -> Server
    'authenticate': {
        token: 'string'
    },
    'goal.create': {
        goalData: 'object'
    },
    'goal.update': {
        goalId: 'string',
        updates: 'object'
    },
    'goal.delete': {
        goalId: 'string'
    },
    'progress.update': {
        taskData: 'object'
    },
    'comment.add': {
        targetType: 'string',
        targetId: 'string',
        content: 'string'
    },
    'reaction.add': {
        targetType: 'string',
        targetId: 'string',
        emoji: 'string'
    }
};
