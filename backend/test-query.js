import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Error:', err));

const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
const Goal = mongoose.model('Goal', new mongoose.Schema({}, { strict: false }));

async function test() {
    const userId = new mongoose.Types.ObjectId('695fced057b9c857ad411d29');

    console.log('\n� Searching for userId:', userId);

    // Get ALL tasks for this user
    const allTasks = await Task.find({ userId });
    console.log('\n📋 ALL Tasks:', allTasks.length);
    allTasks.forEach(t => {
        console.log(`  - Date: ${t.date}, GoalId: ${t.goalId}, Completed: ${t.completed}, Percentage: ${t.percentage}`);
    });

    // Get ALL goals for this user
    const allGoals = await Goal.find({ userId });
    console.log('\n🎯 ALL Goals:', allGoals.length);
    allGoals.forEach(g => {
        console.log(`  - ID: ${g._id}, Title: ${g.title}, Active: ${g.isActive}, StartDate: ${g.startDate}`);
    });

    await mongoose.connection.close();
}

test().catch(console.error);
