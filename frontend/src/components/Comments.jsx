import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Comments = ({ targetType, targetId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadComments();
    }, [targetId]);

    const loadComments = async () => {
        try {
            const response = await api.get(`/comments?targetType=${targetType}&targetId=${targetId}`);
            setComments(response.data.comments || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await api.post('/comments', {
                targetType,
                targetId,
                content: newComment
            });
            setNewComment('');
            loadComments();
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert('Failed to add comment');
        }
    };

    if (loading) return <div className="text-sm text-secondary">Loading comments...</div>;

    return (
        <div className="mt-md">
            <h5>Comments ({comments.length})</h5>

            {comments.map(comment => (
                <div key={comment._id} className="p-sm" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="text-sm">
                        <span style={{ fontWeight: 600 }}>{comment.userId?.username}</span>
                    </div>
                    <div className="text-sm text-secondary mt-sm">{comment.content}</div>
                </div>
            ))}

            <form onSubmit={handleSubmit} className="mt-md">
                <div className="flex gap-sm">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Comments;
