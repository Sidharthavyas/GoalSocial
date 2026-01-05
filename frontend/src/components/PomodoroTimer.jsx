// components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const PomodoroTimer = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    
    const [mode, setMode] = useState('pomodoro');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [showTasks, setShowTasks] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [showQuote, setShowQuote] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const [timers, setTimers] = useState({
        pomodoro: 25,
        short: 5,
        long: 15
    });

    const timerRef = useRef(null);
    const inputRef = useRef(null);

    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
        { text: "It's not about having time, it's about making time.", author: "Unknown" },
        { text: "Deep work is the ability to focus without distraction.", author: "Cal Newport" },
        { text: "Where focus goes, energy flows.", author: "Tony Robbins" }
    ];

    const [currentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

    const modes = {
        pomodoro: {
            label: 'Focus',
            color: 'var(--accent-primary)',
            icon: '🧠',
            message: "Time to focus!",
            gradient: 'linear-gradient(135deg, rgba(124, 179, 138, 0.1) 0%, rgba(154, 201, 168, 0.05) 100%)'
        },
        short: {
            label: 'Short Break',
            color: 'var(--success)',
            icon: '☕',
            message: "Take a quick breather!",
            gradient: 'linear-gradient(135deg, rgba(106, 191, 123, 0.1) 0%, rgba(106, 191, 123, 0.05) 100%)'
        },
        long: {
            label: 'Long Break',
            color: 'var(--info)',
            icon: '🌿',
            message: "You've earned a longer rest!",
            gradient: 'linear-gradient(135deg, rgba(106, 159, 181, 0.1) 0%, rgba(106, 159, 181, 0.05) 100%)'
        }
    };

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Timer logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(timerRef.current);
            setIsActive(false);
            
            if (mode === 'pomodoro') {
                setCompletedPomodoros(prev => prev + 1);
                if (activeTaskId) {
                    setTasks(tasks.map(t => 
                        t.id === activeTaskId 
                            ? { ...t, actPomodoros: t.actPomodoros + 1 }
                            : t
                    ));
                }
            }
            
            // Show notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(modes[mode].message, {
                    body: mode === 'pomodoro' ? 'Great work! Take a break.' : 'Break is over. Ready to focus?',
                    icon: '⏱️'
                });
            }
        }

        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, mode, activeTaskId, tasks]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const toggleTimer = useCallback(() => setIsActive(prev => !prev), []);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(timers[mode] * 60);
    }, [mode, timers]);

    // Keyboard shortcuts - Desktop only
    useEffect(() => {
        if (isMobile) return;
        
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    toggleTimer();
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) return;
                    resetTimer();
                    break;
                case 'Escape':
                    navigate('/dashboard');
                    break;
                case 'KeyT':
                    setShowTasks(prev => !prev);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, toggleTimer, resetTimer, navigate]);

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
        
        setTasks(prev => [...prev, newTask]);
        if (!activeTaskId) setActiveTaskId(newTask.id);
        setNewTaskTitle('');
        setIsAddingTask(false);
    };

    const toggleTaskComplete = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
        if (activeTaskId === id) {
            const remaining = tasks.filter(t => t.id !== id && !t.completed);
            setActiveTaskId(remaining[0]?.id || null);
        }
    };

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
    const remainingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    // Calculate circumference for circular progress
    const radius = 180;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (calculateProgress() / 100) * circumference;

    return (
        <div className="pomodoro-page" style={{
            minHeight: '100vh',
            background: `var(--bg-primary)`,
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            flexDirection: isMobile ? 'column' : 'row'
        }}>
            {/* Ambient background effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: currentTheme.gradient,
                opacity: isActive ? 0.8 : 0.4,
                transition: 'opacity 1s ease',
                pointerEvents: 'none'
            }} />

            {/* Top Navigation Bar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: isMobile ? '12px 16px' : '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)'
            }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        padding: isMobile ? '8px 12px' : '10px 16px',
                        fontSize: isMobile ? '12px' : '14px'
                    }}
                >
                    ← {isMobile ? 'Back' : 'Back to Dashboard'}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {!isMobile && (
                        <button
                            onClick={() => setShowTasks(!showTasks)}
                            className="btn btn-secondary btn-sm"
                            title="Toggle Tasks (T)"
                            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}
                        >
                            📋
                        </button>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-secondary btn-sm"
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)' }}
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            {/* Main Timer Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isMobile ? '70px 20px 20px' : '80px 40px 40px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Session Counter */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: isMobile ? '16px' : '24px'
                }}>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: isMobile ? '10px' : '12px',
                                height: isMobile ? '10px' : '12px',
                                borderRadius: '50%',
                                background: i < (completedPomodoros % 4) 
                                    ? currentTheme.color 
                                    : 'var(--bg-tertiary)',
                                border: `2px solid ${currentTheme.color}`,
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Mode Switcher */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    padding: '6px',
                    marginBottom: isMobile ? '24px' : '48px',
                    border: '1px solid var(--border-color)',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    justifyContent: 'center'
                }}>
                    {Object.keys(modes).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            style={{
                                padding: isMobile ? '10px 16px' : '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: mode === m ? currentTheme.color : 'transparent',
                                color: mode === m ? 'var(--bg-primary)' : 'var(--text-secondary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: isMobile ? '12px' : '14px'
                            }}
                        >
                            <span>{modes[m].icon}</span>
                            <span>{modes[m].label}</span>
                        </button>
                    ))}
                </div>

                {/* Circular Timer */}
                <div style={{
                    position: 'relative',
                    width: isMobile ? '280px' : '400px',
                    height: isMobile ? '280px' : '400px',
                    marginBottom: isMobile ? '24px' : '48px'
                }}>
                    {/* SVG Circle Progress */}
                    <svg
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            transform: 'rotate(-90deg)',
                            width: '100%',
                            height: '100%'
                        }}
                        viewBox="0 0 400 400"
                    >
                        {/* Background circle */}
                        <circle
                            cx="200"
                            cy="200"
                            r={radius}
                            fill="none"
                            stroke="var(--bg-tertiary)"
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="200"
                            cy="200"
                            r={radius}
                            fill="none"
                            stroke={currentTheme.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                                transition: 'stroke-dashoffset 1s linear',
                                filter: `drop-shadow(0 0 10px ${currentTheme.color}40)`
                            }}
                        />
                    </svg>

                    {/* Timer Content */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: isMobile ? '64px' : '96px',
                            fontWeight: '200',
                            fontFamily: "'SF Mono', 'Fira Code', monospace",
                            color: 'var(--text-primary)',
                            letterSpacing: '-4px',
                            lineHeight: 1,
                            marginBottom: '8px'
                        }}>
                            {formatTime(timeLeft)}
                        </div>
                        <div style={{
                            fontSize: isMobile ? '12px' : '14px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>
                            {currentTheme.message}
                        </div>
                    </div>
                </div>

                {/* Current Task Display */}
                {activeTaskObj && !activeTaskObj.completed && (
                    <div style={{
                        marginBottom: isMobile ? '20px' : '32px',
                        textAlign: 'center',
                        padding: isMobile ? '12px 20px' : '16px 32px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        maxWidth: isMobile ? '90%' : 'auto'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '4px'
                        }}>
                            Working on
                        </div>
                        <div style={{
                            fontSize: isMobile ? '14px' : '18px',
                            fontWeight: '500',
                            color: 'var(--text-primary)'
                        }}>
                            {activeTaskObj.title}
                        </div>
                    </div>
                )}

                {/* Control Buttons */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        onClick={resetTimer}
                        className="btn btn-secondary"
                        style={{
                            width: isMobile ? '48px' : '56px',
                            height: isMobile ? '48px' : '56px',
                            borderRadius: '50%',
                            padding: 0,
                            fontSize: isMobile ? '16px' : '20px'
                        }}
                        title="Reset"
                    >
                        🔄
                    </button>

                    <button
                        onClick={toggleTimer}
                        className="btn btn-primary ripple"
                        style={{
                            width: isMobile ? '70px' : '80px',
                            height: isMobile ? '70px' : '80px',
                            borderRadius: '50%',
                            padding: 0,
                            fontSize: isMobile ? '28px' : '32px',
                            background: currentTheme.color,
                            boxShadow: `0 8px 32px ${currentTheme.color}40`,
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                        }}
                        title="Start/Pause"
                    >
                        {isActive ? '⏸️' : '▶️'}
                    </button>

                    <button
                        onClick={() => {
                            if (mode === 'pomodoro') {
                                switchMode('short');
                            } else {
                                switchMode('pomodoro');
                            }
                        }}
                        className="btn btn-secondary"
                        style={{
                            width: isMobile ? '48px' : '56px',
                            height: isMobile ? '48px' : '56px',
                            borderRadius: '50%',
                            padding: 0,
                            fontSize: isMobile ? '16px' : '20px'
                        }}
                        title="Skip to next"
                    >
                        ⏭️
                    </button>
                </div>

                {/* Mobile Tasks Toggle */}
                {isMobile && (
                    <button
                        onClick={() => setShowTasks(!showTasks)}
                        className="btn btn-secondary"
                        style={{
                            marginTop: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        📋 {showTasks ? 'Hide Tasks' : 'Show Tasks'}
                    </button>
                )}

                {/* Keyboard Shortcuts Hint - Desktop only */}
                {!isMobile && (
                    <div style={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '24px',
                        color: 'var(--text-muted)',
                        fontSize: '12px'
                    }}>
                        <span><kbd style={{ 
                            padding: '2px 8px', 
                            background: 'var(--bg-tertiary)', 
                            borderRadius: '4px',
                            marginRight: '4px'
                        }}>Space</kbd> Play/Pause</span>
                        <span><kbd style={{ 
                            padding: '2px 8px', 
                            background: 'var(--bg-tertiary)', 
                            borderRadius: '4px',
                            marginRight: '4px'
                        }}>R</kbd> Reset</span>
                        <span><kbd style={{ 
                            padding: '2px 8px', 
                            background: 'var(--bg-tertiary)', 
                            borderRadius: '4px',
                            marginRight: '4px'
                        }}>T</kbd> Tasks</span>
                        <span><kbd style={{ 
                            padding: '2px 8px', 
                            background: 'var(--bg-tertiary)', 
                            borderRadius: '4px',
                            marginRight: '4px'
                        }}>Esc</kbd> Exit</span>
                    </div>
                )}
            </div>

            {/* Tasks Sidebar / Mobile Panel */}
            <div style={{
                width: isMobile ? '100%' : (showTasks ? '380px' : '0'),
                maxHeight: isMobile ? (showTasks ? '50vh' : '0') : 'none',
                background: 'var(--bg-secondary)',
                borderLeft: !isMobile && showTasks ? '1px solid var(--border-color)' : 'none',
                borderTop: isMobile && showTasks ? '1px solid var(--border-color)' : 'none',
                overflow: 'hidden',
                transition: isMobile ? 'max-height 0.3s ease' : 'width 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    padding: isMobile ? '16px' : '80px 24px 24px',
                    flex: 1,
                    overflowY: 'auto',
                    display: showTasks ? 'block' : 'none'
                }}>
                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: currentTheme.color }}>
                                {completedPomodoros}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                Pomodoros
                            </div>
                        </div>
                        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: 'var(--success)' }}>
                                {completedTasks.length}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                                Completed
                            </div>
                        </div>
                    </div>

                    {/* Quote - Desktop only */}
                    {showQuote && !isMobile && (
                        <div 
                            className="card" 
                            style={{ 
                                padding: '20px', 
                                marginBottom: '24px',
                                background: 'var(--bg-tertiary)',
                                borderLeft: `3px solid ${currentTheme.color}`,
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setShowQuote(false)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ✕
                            </button>
                            <p style={{ 
                                margin: 0, 
                                fontStyle: 'italic', 
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                "{currentQuote.text}"
                            </p>
                            <p style={{ 
                                margin: '8px 0 0', 
                                color: 'var(--text-muted)',
                                fontSize: '12px'
                            }}>
                                — {currentQuote.author}
                            </p>
                        </div>
                    )}

                    {/* Tasks Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '16px' : '18px' }}>
                            📋 Tasks
                            <span style={{
                                background: 'var(--bg-tertiary)',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: 'var(--text-tertiary)'
                            }}>
                                {remainingTasks.length}
                            </span>
                        </h3>
                    </div>

                    {/* Tasks List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {remainingTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => setActiveTaskId(task.id)}
                                className="card"
                                style={{
                                    padding: isMobile ? '12px 14px' : '14px 16px',
                                    cursor: 'pointer',
                                    borderLeft: activeTaskId === task.id 
                                        ? `4px solid ${currentTheme.color}` 
                                        : '4px solid transparent',
                                    background: activeTaskId === task.id 
                                        ? 'var(--bg-tertiary)' 
                                        : 'var(--bg-card)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                toggleTaskComplete(task.id); 
                                            }}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                border: `2px solid ${currentTheme.color}`,
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: currentTheme.color,
                                                fontSize: '12px',
                                                flexShrink: 0
                                            }}
                                        >
                                            
                                        </button>
                                        <span style={{ 
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            fontSize: '12px',
                                            color: 'var(--text-tertiary)'
                                        }}>
                                            {task.actPomodoros}/{task.estPomodoros} 🍅
                                        </span>
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                deleteTask(task.id); 
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-muted)',
                                                fontSize: '14px',
                                                padding: '4px',
                                                opacity: 0.6,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = 1}
                                            onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    marginTop: '16px',
                                    marginBottom: '8px'
                                }}>
                                    Completed ({completedTasks.length})
                                </div>
                                {completedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="card"
                                        style={{
                                            padding: '12px 16px',
                                            opacity: 0.5,
                                            background: 'var(--bg-card)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: 'var(--success)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '12px',
                                                flexShrink: 0
                                            }}>
                                                ✓
                                            </div>
                                            <span style={{ 
                                                textDecoration: 'line-through',
                                                fontSize: '14px'
                                            }}>
                                                {task.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Add Task */}
                    {!isAddingTask ? (
                        <button
                            onClick={() => {
                                setIsAddingTask(true);
                                setTimeout(() => inputRef.current?.focus(), 100);
                            }}
                            style={{
                                width: '100%',
                                marginTop: '16px',
                                padding: '14px',
                                background: 'transparent',
                                border: '2px dashed var(--border-color)',
                                borderRadius: '12px',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = currentTheme.color;
                                e.target.style.color = currentTheme.color;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = 'var(--border-color)';
                                e.target.style.color = 'var(--text-tertiary)';
                            }}
                        >
                            + Add Task
                        </button>
                    ) : (
                        <div className="card" style={{ marginTop: '16px', padding: '16px' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="What are you working on?"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddTask(e);
                                    if (e.key === 'Escape') setIsAddingTask(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    marginBottom: '12px'
                                }}
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
                                    style={{ background: currentTheme.color }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            {settingsOpen && (
                <div 
                    className="modal-overlay"
                    onClick={() => setSettingsOpen(false)}
                    style={{ zIndex: 1000 }}
                >
                    <div 
                        className="modal fade-in"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '400px',
                            width: isMobile ? '90%' : '400px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>⚙️ Timer Settings</h3>
                            <button 
                                onClick={() => setSettingsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: 'var(--text-tertiary)',
                                    textTransform: 'uppercase',
                                    marginBottom: '16px'
                                }}>
                                    Timer Duration (minutes)
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    {Object.keys(timers).map(t => (
                                        <div key={t}>
                                            <label style={{
                                                display: 'block',
                                                fontSize: '12px',
                                                marginBottom: '6px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {modes[t].icon} {modes[t].label}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="120"
                                                value={timers[t]}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    setTimers(prev => ({ ...prev, [t]: val }));
                                                    if (mode === t && !isActive) {
                                                        setTimeLeft(val * 60);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'var(--bg-tertiary)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '16px',
                                                    textAlign: 'center'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setSettingsOpen(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', background: currentTheme.color }}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PomodoroTimer;