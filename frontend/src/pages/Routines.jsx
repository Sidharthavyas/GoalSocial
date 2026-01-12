import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import confetti from 'canvas-confetti';

const Routines = () => {
    const [routines, setRoutines] = useState([]);
    const [myGoals, setMyGoals] = useState([]);
    const [showCreate, setShowCreate] = useState(false);

    // Create State
    const [title, setTitle] = useState('');
    const [selectedGoals, setSelectedGoals] = useState([]);

    useEffect(() => {
        loadRoutines();
        loadGoals();
    }, []);

    const loadRoutines = async () => {
        const res = await api.get('/routines');
        setRoutines(res.data);
    };

    const loadGoals = async () => {
        const res = await api.get('/goals');
        setMyGoals(res.data.goals || []);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        await api.post('/routines', {
            title,
            goals: selectedGoals
        });
        setShowCreate(false);
        loadRoutines();
    };

    const executeRoutine = async (routine) => {
        // In a real app, this would open a "Focus Mode" overlay to do items one by one.
        // For now, we'll just simulate checking them all off (Bulk Action).
        if (!window.confirm(`Start and complete all items in "${routine.title}"?`)) return;

        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            await api.post('/tasks/bulk-complete', {
                date: dateString,
                goalIds: routine.goals.map(g => g._id)
            });

            confetti();
            alert('Routine Completed! Linked goals updated.');
        } catch (error) {
            alert('Error executing routine');
        }
    };

    return (
        <div className="container mt-lg">
            <div className="flex justify-between items-center mb-lg">
                <h1>Habit Stacks (Routines) 🔗</h1>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ New Routine</button>
            </div>

            <div className="grid grid-3">
                {routines.map(routine => (
                    <motion.div
                        key={routine._id}
                        className="card"
                        whileHover={{ y: -5 }}
                    >
                        <h3>{routine.title}</h3>
                        <p className="text-secondary">{routine.goals.length} items linked</p>
                        <div className="mt-md">
                            <button
                                onClick={() => executeRoutine(routine)}
                                className="btn btn-success"
                                style={{ width: '100%' }}
                            >
                                ▶ Start Routine
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showCreate && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create Routine</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Select Habits to Stack</label>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {myGoals.map(goal => (
                                        <label key={goal._id} className="flex items-center gap-sm p-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedGoals.includes(goal._id)}
                                                onChange={e => {
                                                    if (e.target.checked) setSelectedGoals([...selectedGoals, goal._id]);
                                                    else setSelectedGoals(selectedGoals.filter(id => id !== goal._id));
                                                }}
                                            />
                                            {goal.title}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Stack</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Routines;
