import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
const Goal = mongoose.model('Goal', new mongoose.Schema({}, { strict: false }));

async function debugUserData() {
    const userId = '695fced057b9c857ad411d29';

    console.log('\n🔍 Checking user data for userId:', userId);
    console.log('='.repeat(80));

    // Get all tasks for this user
    const tasks = await Task.find({ userId }).sort({ date: -1 });
    console.log('\n📋 TASKS FOUND:', tasks.length);
    if (tasks.length > 0) {
        console.log('\nTask Details:');
        tasks.forEach((task, idx) => {
            console.log(`\n  Task ${idx + 1}:`);
            console.log(`    - Date: ${task.date}`);
            console.log(`    - GoalId: ${task.goalId}`);
            console.log(`    - Completed: ${task.completed}`);
            console.log(`    - Percentage: ${task.percentage}`);
            console.log(`    - Value: ${task.value}`);
            console.log(`    - Created: ${task.createdAt}`);
        });
    } else {
        console.log('  ⚠️ NO TASKS FOUND! This is the problem.');
    }

    // Get all goals for this user
    const goals = await Goal.find({ userId });
    console.log('\n\n🎯 GOALS FOUND:', goals.length);
    if (goals.length > 0) {
        console.log('\nGoal Details:');
        goals.forEach((goal, idx) => {
            console.log(`\n  Goal ${idx + 1}:`);
            console.log(`    - Title: ${goal.title}`);
            console.log(`    - Type: ${goal.type}`);
            console.log(`    - StartDate: ${goal.startDate}`);
            console.log(`    - EndDate: ${goal.endDate}`);
            console.log(`    - IsActive: ${goal.isActive}`);
            console.log(`    - Created: ${goal.createdAt}`);
        });
    }

    console.log('\n' + '='.repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Done!');
}

debugUserData().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
