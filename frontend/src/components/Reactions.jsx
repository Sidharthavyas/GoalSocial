import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const EMOJIS = ['👍', '❤️', '🔥', '🎉', '💪', '⭐'];

const Reactions = ({ targetType, targetId }) => {
    const [reactions, setReactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReactions();
    }, [targetId]);

    const loadReactions = async () => {
        try {
            const response = await api.get(`/reactions?targetType=${targetType}&targetId=${targetId}`);
            setReactions(response.data.reactions || []);
        } catch (error) {
            console.error('Failed to load reactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (emoji) => {
        try {
            await api.post('/reactions', {
                targetType,
                targetId,
                emoji
            });
            loadReactions();
        } catch (error) {
            console.error('Failed to add reaction:', error);
        }
    };

    const getReactionCounts = () => {
        const counts = {};
        reactions.forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        return counts;
    };

    if (loading) return null;

    const counts = getReactionCounts();

    return (
        <div className="mt-md">
            <div className="flex gap-sm flex-wrap">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px' }}
                    >
                        {emoji} {counts[emoji] ? counts[emoji] : ''}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Reactions;
