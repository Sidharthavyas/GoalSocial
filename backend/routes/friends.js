import express from 'express';
import Friend from '../models/Friend.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { recipientId } = req.body;

        if (!recipientId) {
            return res.status(400).json({ error: 'Recipient ID required' });
        }

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if request already exists
        const existingRequest = await Friend.findOne({
            $or: [
                { requester: req.user._id, recipient: recipientId },
                { requester: recipientId, recipient: req.user._id }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'Friend request already exists' });
        }

        const friendRequest = new Friend({
            requester: req.user._id,
            recipient: recipientId,
            status: 'pending'
        });

        await friendRequest.save();

        res.status(201).json({
            message: 'Friend request sent',
            request: friendRequest
        });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Accept friend request
router.post('/accept/:requestId', authenticateToken, async (req, res) => {
    try {
        const friendRequest = await Friend.findById(req.params.requestId);

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        friendRequest.status = 'accepted';
        await friendRequest.save();

        const requester = await User.findById(friendRequest.requester)
            .select('uuid username');

        res.json({
            message: 'Friend request accepted',
            request: friendRequest,
            friend: requester
        });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reject friend request
router.post('/reject/:requestId', authenticateToken, async (req, res) => {
    try {
        const friendRequest = await Friend.findById(req.params.requestId);

        if (!friendRequest) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        friendRequest.status = 'rejected';
        await friendRequest.save();

        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get friends list
router.get('/', authenticateToken, async (req, res) => {
    try {
        const friends = await Friend.find({
            $or: [
                { requester: req.user._id, status: 'accepted' },
                { recipient: req.user._id, status: 'accepted' }
            ]
        })
            .populate('requester', 'uuid username email')
            .populate('recipient', 'uuid username email');

        // Format response to show friend (not self)
        const friendsList = friends.map(f => {
            const friend = f.requester._id.toString() === req.user._id.toString()
                ? f.recipient
                : f.requester;

            return {
                friendshipId: f._id,
                friend: {
                    id: friend._id,
                    uuid: friend.uuid,
                    username: friend.username,
                    email: friend.email
                },
                since: f.updatedAt
            };
        });

        res.json({ friends: friendsList });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get pending requests (received)
router.get('/pending', authenticateToken, async (req, res) => {
    try {
        const requests = await Friend.find({
            recipient: req.user._id,
            status: 'pending'
        })
            .populate('requester', 'uuid username email')
            .sort({ createdAt: -1 });

        res.json({ requests });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove friend
router.delete('/:friendshipId', authenticateToken, async (req, res) => {
    try {
        const friendship = await Friend.findById(req.params.friendshipId);

        if (!friendship) {
            return res.status(404).json({ error: 'Friendship not found' });
        }

        // Verify user is part of this friendship
        if (
            friendship.requester.toString() !== req.user._id.toString() &&
            friendship.recipient.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Friend.findByIdAndDelete(req.params.friendshipId);

        res.json({ message: 'Friend removed' });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
