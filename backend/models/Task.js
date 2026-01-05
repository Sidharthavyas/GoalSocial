import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    goalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: String, // Store as YYYY-MM-DD string to avoid timezone issues
        required: true,
        index: true,
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: 'Date must be in YYYY-MM-DD format'
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    value: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
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

// Compound index for faster date-based queries
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ goalId: 1, date: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
