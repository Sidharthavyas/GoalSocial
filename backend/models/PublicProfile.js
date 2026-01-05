import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const publicProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    shareId: {
        type: String,
        unique: true,
        default: () => uuidv4(),
        index: true
    },
    enabled: {
        type: Boolean,
        default: false
    },
    settings: {
        showStreaks: {
            type: Boolean,
            default: true
        },
        showConsistency: {
            type: Boolean,
            default: true
        },
        showGoalCount: {
            type: Boolean,
            default: true
        },
        showBadges: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const PublicProfile = mongoose.model('PublicProfile', publicProfileSchema);

export default PublicProfile;
