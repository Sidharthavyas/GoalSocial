import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/auth.js';
import { ServerEvents, ClientEvents } from './eventContracts.js';
import Friend from '../models/Friend.js';
import Goal from '../models/Goal.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Reaction from '../models/Reaction.js';
import User from '../models/User.js';

// Store online users: userId -> socketId
const onlineUsers = new Map();

export const setupSocketHandlers = (io) => {
    io.on('connection', async (socket) => {
        console.log('Client connected:', socket.id);

        let authenticatedUser = null;

        // Authentication
        socket.on(ClientEvents.AUTHENTICATE, async ({ token }) => {
            try {
                const user = await authenticateSocket(token);

                if (!user) {
                    socket.emit('error', { message: 'Authentication failed' });
                    socket.disconnect();
                    return;
                }

                authenticatedUser = user;
                onlineUsers.set(user._id.toString(), socket.id);

                socket.emit('authenticated', {
                    user: {
                        id: user._id,
                        uuid: user.uuid,
                        username: user.username
                    }
                });

                // Notify friends that user is online
                await notifyFriends(io, user._id, ServerEvents.USER_ONLINE, {
                    userId: user._id.toString(),
                    username: user.username
                });

                console.log(`User authenticated: ${user.username} (${socket.id})`);
            } catch (error) {
                console.error('Socket auth error:', error);
                socket.emit('error', { message: 'Authentication failed' });
                socket.disconnect();
            }
        });

        // Goal created
        socket.on(ClientEvents.GOAL_CREATE, async (data) => {
            if (!authenticatedUser) {
                socket.emit('error', { message: 'Not authenticated' });
                return;
            }

            try {
                const goal = new Goal({
                    userId: authenticatedUser._id,
                    ...data.goalData
                });

                await goal.save();

                // Notify friends
                await notifyFriends(io, authenticatedUser._id, ServerEvents.GOAL_CREATED, {
                    goal: goal.toObject(),
                    user: {
                        id: authenticatedUser._id,
                        username: authenticatedUser.username
                    }
                });

                socket.emit('goal.created.success', { goal });
            } catch (error) {
                console.error('Goal create error:', error);
                socket.emit('error', { message: 'Failed to create goal' });
            }
        });

        // Goal updated
        socket.on(ClientEvents.GOAL_UPDATE, async (data) => {
            if (!authenticatedUser) return;

            try {
                const goal = await Goal.findById(data.goalId);

                if (!goal || goal.userId.toString() !== authenticatedUser._id.toString()) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                Object.assign(goal, data.updates);
                await goal.save();

                // Notify friends
                await notifyFriends(io, authenticatedUser._id, ServerEvents.GOAL_UPDATED, {
                    goalId: data.goalId,
                    updates: data.updates,
                    user: {
                        id: authenticatedUser._id,
                        username: authenticatedUser.username
                    }
                });

                socket.emit('goal.updated.success', { goal });
            } catch (error) {
                console.error('Goal update error:', error);
                socket.emit('error', { message: 'Failed to update goal' });
            }
        });

        // Goal deleted
        socket.on(ClientEvents.GOAL_DELETE, async (data) => {
            if (!authenticatedUser) return;

            try {
                const goal = await Goal.findById(data.goalId);

                if (!goal || goal.userId.toString() !== authenticatedUser._id.toString()) {
                    socket.emit('error', { message: 'Not authorized' });
                    return;
                }

                goal.isActive = false;
                await goal.save();

                // Notify friends
                await notifyFriends(io, authenticatedUser._id, ServerEvents.GOAL_DELETED, {
                    goalId: data.goalId,
                    user: {
                        id: authenticatedUser._id,
                        username: authenticatedUser.username
                    }
                });

                socket.emit('goal.deleted.success', { goalId: data.goalId });
            } catch (error) {
                console.error('Goal delete error:', error);
                socket.emit('error', { message: 'Failed to delete goal' });
            }
        });

        // Progress updated
        socket.on(ClientEvents.PROGRESS_UPDATE, async (data) => {
            if (!authenticatedUser) return;

            try {
                const { goalId, date, completed, value, percentage, notes } = data.taskData;

                const taskDate = new Date(date);
                taskDate.setHours(0, 0, 0, 0);

                let task = await Task.findOne({
                    goalId,
                    userId: authenticatedUser._id,
                    date: taskDate
                });

                if (task) {
                    if (completed !== undefined) task.completed = completed;
                    if (value !== undefined) task.value = value;
                    if (percentage !== undefined) task.percentage = percentage;
                    if (notes !== undefined) task.notes = notes;
                } else {
                    task = new Task({
                        goalId,
                        userId: authenticatedUser._id,
                        date: taskDate,
                        completed: completed || false,
                        value: value || 0,
                        percentage: percentage || 0,
                        notes: notes || ''
                    });
                }

                await task.save();

                // Notify friends
                await notifyFriends(io, authenticatedUser._id, ServerEvents.PROGRESS_UPDATED, {
                    taskId: task._id,
                    date: task.date,
                    goalId: task.goalId,
                    percentage: task.percentage,
                    value: task.value,
                    completed: task.completed,
                    user: {
                        id: authenticatedUser._id,
                        username: authenticatedUser.username
                    }
                });

                socket.emit('progress.updated.success', { task });
            } catch (error) {
                console.error('Progress update error:', error);
                socket.emit('error', { message: 'Failed to update progress' });
            }
        });

        // Comment added
        socket.on(ClientEvents.COMMENT_ADD, async (data) => {
            if (!authenticatedUser) return;

            try {
                const comment = new Comment({
                    userId: authenticatedUser._id,
                    targetType: data.targetType,
                    targetId: data.targetId,
                    content: data.content
                });

                await comment.save();
                await comment.populate('userId', 'uuid username');

                // Find target owner to notify
                let targetUserId;
                if (data.targetType === 'goal') {
                    const goal = await Goal.findById(data.targetId);
                    targetUserId = goal?.userId;
                } else if (data.targetType === 'task') {
                    const task = await Task.findById(data.targetId);
                    targetUserId = task?.userId;
                }

                if (targetUserId) {
                    const targetSocketId = onlineUsers.get(targetUserId.toString());
                    if (targetSocketId) {
                        io.to(targetSocketId).emit(ServerEvents.COMMENT_CREATED, {
                            comment: comment.toObject(),
                            targetType: data.targetType,
                            targetId: data.targetId
                        });
                    }
                }

                socket.emit('comment.added.success', { comment });
            } catch (error) {
                console.error('Comment add error:', error);
                socket.emit('error', { message: 'Failed to add comment' });
            }
        });

        // Reaction added
        socket.on(ClientEvents.REACTION_ADD, async (data) => {
            if (!authenticatedUser) return;

            try {
                const reaction = await Reaction.findOneAndUpdate(
                    {
                        userId: authenticatedUser._id,
                        targetType: data.targetType,
                        targetId: data.targetId
                    },
                    { emoji: data.emoji },
                    { upsert: true, new: true }
                );

                await reaction.populate('userId', 'uuid username');

                // Find target owner to notify
                let targetUserId;
                if (data.targetType === 'goal') {
                    const goal = await Goal.findById(data.targetId);
                    targetUserId = goal?.userId;
                } else if (data.targetType === 'task') {
                    const task = await Task.findById(data.targetId);
                    targetUserId = task?.userId;
                }

                if (targetUserId) {
                    const targetSocketId = onlineUsers.get(targetUserId.toString());
                    if (targetSocketId) {
                        io.to(targetSocketId).emit(ServerEvents.REACTION_CREATED, {
                            reaction: reaction.toObject(),
                            targetType: data.targetType,
                            targetId: data.targetId
                        });
                    }
                }

                socket.emit('reaction.added.success', { reaction });
            } catch (error) {
                console.error('Reaction add error:', error);
                socket.emit('error', { message: 'Failed to add reaction' });
            }
        });

        // Disconnect
        socket.on('disconnect', async () => {
            if (authenticatedUser) {
                onlineUsers.delete(authenticatedUser._id.toString());

                // Notify friends that user is offline
                await notifyFriends(io, authenticatedUser._id, ServerEvents.USER_OFFLINE, {
                    userId: authenticatedUser._id.toString()
                });

                console.log(`User disconnected: ${authenticatedUser.username}`);
            } else {
                console.log('Client disconnected:', socket.id);
            }
        });
    });
};

// Helper function to notify all friends of a user
async function notifyFriends(io, userId, event, data) {
    try {
        const friendships = await Friend.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' }
            ]
        });

        friendships.forEach(friendship => {
            const friendId = friendship.requester.toString() === userId.toString()
                ? friendship.recipient.toString()
                : friendship.requester.toString();

            const friendSocketId = onlineUsers.get(friendId);
            if (friendSocketId) {
                io.to(friendSocketId).emit(event, data);
            }
        });
    } catch (error) {
        console.error('Notify friends error:', error);
    }
}
