import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['one-time', 'recurring', 'series', 'numeric', 'percentage'],
        required: true
    },
    targetValue: {
        type: Number,
        default: null
    },
    unit: {
        type: String,
        trim: true,
        maxlength: 20
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
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

// Index for faster queries
goalSchema.index({ userId: 1, isActive: 1 });

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
