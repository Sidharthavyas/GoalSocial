const messages = [
    "One step at a time builds mountains.",
    "Your future self is cheering for you.",
    "Progress, not perfection.",
    "Small wins lead to big victories.",
    "You're building something great.",
    "Consistency beats intensity.",
    "Today's effort is tomorrow's success.",
    "Every goal starts with a single action.",
    "You've got this.",
    "Momentum is building.",
    "Your dedication is inspiring.",
    "Keep showing up.",
    "Growth happens in small steps.",
    "You're closer than you think.",
    "Trust the process.",
    "Action creates clarity.",
    "Your goals are waiting.",
    "Make today count.",
    "Progress is progress.",
    "You're on the right path.",
    "Believe in your journey.",
    "One day at a time.",
    "Your effort matters.",
    "Stay focused, stay strong."
];

export const getRandomMessage = () => {
    return messages[Math.floor(Math.random() * messages.length)];
};

export default messages;
