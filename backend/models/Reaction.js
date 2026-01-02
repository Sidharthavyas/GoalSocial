import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    targetType: {
        type: String,
        enum: ['goal', 'task', 'comment'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    emoji: {
        type: String,
        required: true,
        maxlength: 10
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Unique index: one user can only have one reaction per target
reactionSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
