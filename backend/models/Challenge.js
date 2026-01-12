import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['streak', 'count', 'completion'], // 'streak': maintain streak, 'count': reach X value, 'completion': complete X tasks
        required: true
    },
    targetValue: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dailyCompletions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true
        },
        completed: {
            type: Boolean,
            default: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    linkedGoalKeyword: {
        type: String,
        required: false,
        help: "Tag or keyword to automatically link user goals to this challenge"
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Challenge', challengeSchema);
