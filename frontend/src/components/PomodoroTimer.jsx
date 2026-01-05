import React, { useState, useEffect, useRef } from 'react';

const PomodoroTimer = ({ onClose }) => {
    const [mode, setMode] = useState('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [timers, setTimers] = useState({
        pomodoro: 25,
        short: 5,
        long: 15
    });

    const timerRef = useRef(null);

    const modes = {
        pomodoro: {
            label: 'Focus',
            color: 'var(--accent-primary)',
            bgColor: 'var(--bg-tertiary)',
            icon: '🧠',
            message: "Time to focus!"
        },
        short: {
            label: 'Short Break',
            color: 'var(--success)',
            bgColor: 'var(--bg-tertiary)',
            icon: '☕',
            message: "Time for a break!"
        },
        long: {
            label: 'Long Break',
            color: 'var(--info)',
            bgColor: 'var(--bg-tertiary)',
            icon: '⚡',
            message: "Time for a long break!"
        }
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timerRef.current);
            setIsActive(false);
            if (soundEnabled) {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch(e => console.log("Audio play failed", e));
            }
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, soundEnabled]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(timers[mode] * 60);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(timers[newMode] * 60);
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        const newTask = {
            id: Date.now(),
            title: newTaskTitle,
            completed: false,
            estPomodoros: 1,
            actPomodoros: 0
        };
        setTasks([...tasks, newTask]);
        if (!activeTaskId) setActiveTaskId(newTask.id);
        setNewTaskTitle('');
        setIsAddingTask(false);
    };

    const toggleTaskComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (activeTaskId === id) setActiveTaskId(null);
    };

    const selectTask = (id) => setActiveTaskId(id);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const calculateProgress = () => {
        const totalSeconds = timers[mode] * 60;
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    };

    const currentTheme = modes[mode];
    const activeTaskObj = tasks.find(t => t.id === activeTaskId);

    return (
        <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
            <div
                className="modal fade-in"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: focusMode ? '800px' : '600px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)'
                }}
            >
                {/* Progress Bar */}
                <div style={{
                    height: '4px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div
                        style={{
                            height: '100%',
                            background: currentTheme.color,
                            width: `${calculateProgress()}%`,
                            transition: 'width 1s linear'
                        }}
                    />
                </div>

                {/* Header */}
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>⏱️</span>
                        <h2 style={{ margin: 0 }}>Pomodoro Timer</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setFocusMode(!focusMode)}
                            className="btn btn-secondary btn-sm"
                            title={focusMode ? 'Exit Focus' : 'Focus Mode'}
                        >
                            {focusMode ? '🔻' : '🔺'}
                        </button>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="btn btn-secondary btn-sm"
                            title="Toggle Sound"
                        >
                            {soundEnabled ? '🔊' : '🔇'}
                        </button>
                        <button
                            onClick={() => setSettingsOpen(!settingsOpen)}
                            className="btn btn-secondary btn-sm"
                        >
                            ⚙️
                        </button>
                        <button onClick={onClose} className="btn-close">×</button>
                    </div>
                </div>

                <div className="modal-body">
                    {/* Timer Card */}
                    <div className="card" style={{
                        padding: focusMode ? '48px' : '32px',
                        background: currentTheme.bgColor,
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                    }}>

                        {/* Mode Toggles */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
                            {Object.keys(modes).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`btn ${mode === m ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                    style={{ minWidth: '100px' }}
                                >
                                    {modes[m].icon} {modes[m].label}
                                </button>
                            ))}
                        </div>

                        {/* Timer Display */}
                        <div style={{
                            fontSize: focusMode ? '96px' : '72px',
                            fontWeight: 'bold',
                            lineHeight: '1',
                            marginBottom: '32px',
                            fontFamily: 'monospace',
                            color: currentTheme.color,
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}>
                            {formatTime(timeLeft)}
                        </div>

                        {/* Main Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button
                                onClick={toggleTimer}
                                className="btn btn-primary ripple"
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    padding: '16px 48px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {isActive ? '⏸️ Pause' : '▶️ Start'}
                            </button>

                            {isActive && (
                                <button
                                    onClick={resetTimer}
                                    className="btn btn-secondary"
                                    style={{ padding: '16px 24px' }}
                                    title="Reset Timer"
                                >
                                    🔄 Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tasks Section (Hidden in Focus Mode) */}
                    {!focusMode && (
                        <div style={{ marginTop: '24px' }}>
                            {/* Current Task Status */}
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div className="text-tertiary text-sm" style={{ textTransform: 'uppercase', marginBottom: '8px' }}>
                                    #{tasks.findIndex(t => t.id === activeTaskId) + 1 || '0'}
                                </div>
                                <div className="text-lg">
                                    {activeTaskId ? activeTaskObj?.title : 'Select a task to focus on'}
                                </div>
                            </div>

                            {/* Task List Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📋 Tasks
                                    <span className="badge" style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                        {tasks.length}
                                    </span>
                                </h3>
                            </div>

                            {/* Active Task Highlight */}
                            {activeTaskId && activeTaskObj && !activeTaskObj.completed && (
                                <div className="card" style={{
                                    padding: '16px',
                                    marginBottom: '16px',
                                    borderLeft: `4px solid ${currentTheme.color}`,
                                    background: 'var(--bg-tertiary)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div className="text-xs text-tertiary" style={{ textTransform: 'uppercase', marginBottom: '4px' }}>
                                                ⭐ Current Focus
                                            </div>
                                            <div className="font-bold">{activeTaskObj.title}</div>
                                        </div>
                                        <button
                                            onClick={() => toggleTaskComplete(activeTaskId)}
                                            className="btn btn-success btn-sm"
                                        >
                                            ✓
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tasks List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => selectTask(task.id)}
                                        className="card ripple"
                                        style={{
                                            padding: '12px',
                                            cursor: 'pointer',
                                            borderLeft: activeTaskId === task.id ? `4px solid ${currentTheme.color}` : '4px solid transparent',
                                            opacity: task.completed ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id); }}
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        border: '2px solid var(--border-color)',
                                                        background: task.completed ? 'var(--success)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {task.completed && '✓'}
                                                </button>
                                                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span className="text-sm text-tertiary">
                                                    {task.actPomodoros}/{task.estPomodoros} 🍅
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                                    className="btn btn-sm"
                                                    style={{ padding: '4px 8px' }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Task */}
                            {!isAddingTask ? (
                                <button
                                    onClick={() => setIsAddingTask(true)}
                                    className="btn btn-secondary"
                                    style={{
                                        width: '100%',
                                        marginTop: '16px',
                                        border: '2px dashed var(--border-color)'
                                    }}
                                >
                                    ➕ Add Task
                                </button>
                            ) : (
                                <div className="card" style={{ marginTop: '16px', padding: '16px' }}>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="What are you working on?"
                                        className="input"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(e)}
                                        style={{ marginBottom: '16px' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button
                                            onClick={() => setIsAddingTask(false)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddTask}
                                            className="btn btn-primary btn-sm"
                                        >
                                            💾 Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Settings Modal */}
                {settingsOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--bg-card)',
                        padding: '24px',
                        borderRadius: 'var(--border-radius-lg)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-xl)',
                        minWidth: '300px',
                        zIndex: 10
                    }}>
                        <h3 style={{ marginBottom: '16px' }}>⚙️ Settings</h3>
                        <div style={{ marginBottom: '24px' }}>
                            <div className="text-sm text-tertiary" style={{ marginBottom: '12px', textTransform: 'uppercase' }}>
                                Timer Duration (minutes)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                {Object.keys(timers).map(t => (
                                    <div key={t}>
                                        <label className="text-sm" style={{ display: 'block', marginBottom: '4px', textTransform: 'capitalize' }}>
                                            {modes[t].icon} {t}
                                        </label>
                                        <input
                                            type="number"
                                            value={timers[t]}
                                            onChange={(e) => setTimers({ ...timers, [t]: parseInt(e.target.value) || 0 })}
                                            className="input"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setSettingsOpen(false)}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            ✓ OK
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PomodoroTimer;
