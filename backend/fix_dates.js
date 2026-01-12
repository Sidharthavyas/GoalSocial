import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';

dotenv.config();

const fixDates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find tasks active on "2026-01-11" (yesterday) that were likely created today
        // "Likely created today" = createdAt timestamp is from today (Jan 12)

        const todayStart = new Date('2026-01-12T00:00:00.000+05:30'); // India midnight

        const wrongTasks = await Task.find({
            date: '2026-01-11',
            createdAt: { $gte: todayStart }
        });

        console.log(`Found ${wrongTasks.length} tasks with date 2026-01-11 but created today.`);

        if (wrongTasks.length > 0) {
            const result = await Task.updateMany(
                {
                    _id: { $in: wrongTasks.map(t => t._id) }
                },
                {
                    $set: { date: '2026-01-12' }
                }
            );
            console.log(`✅ Updated ${result.modifiedCount} tasks to date '2026-01-12'`);
        } else {
            console.log('No wrong tasks found. Data might be correct already.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing dates:', error);
        process.exit(1);
    }
};

fixDates();
