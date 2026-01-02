import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const { events } = useSocket();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const latestEvent = events[events.length - 1];
        if (latestEvent && ['friend.accepted', 'friend.requested'].includes(latestEvent.type)) {
            loadData();
        }
    }, [events]);

    const loadData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                api.get('/friends'),
                api.get('/friends/pending')
            ]);

            setFriends(friendsRes.data.friends || []);
            setPendingRequests(requestsRes.data.requests || []);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.length < 2) return;

        try {
            const response = await api.get(`/users/search?q=${searchQuery}`);
            setSearchResults(response.data.users || []);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const sendFriendRequest = async (userId) => {
        try {
            await api.post('/friends/request', { recipientId: userId });
            alert('Friend request sent!');
            setSearchResults([]);
            setSearchQuery('');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to send request');
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await api.post(`/friends/accept/${requestId}`);
            loadData();
        } catch (error) {
            alert('Failed to accept request');
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await api.post(`/friends/reject/${requestId}`);
            loadData();
        } catch (error) {
            alert('Failed to reject request');
        }
    };

    const removeFriend = async (friendshipId) => {
        if (!confirm('Remove this friend?')) return;

        try {
            await api.delete(`/friends/${friendshipId}`);
            loadData();
        } catch (error) {
            alert('Failed to remove friend');
        }
    };

    if (loading) {
        return (
            <div className="container mt-lg">
                <div className="loading text-center">Loading friends...</div>
            </div>
        );
    }

    return (
        <div className="container mt-lg mb-lg">
            <h1 className="mb-lg">Friends</h1>

            {/* Search */}
            <div className="card mb-lg">
                <h3>Find Friends</h3>
                <div className="flex gap-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search by username or UUID"
                    />
                    <button onClick={handleSearch} className="btn btn-primary">
                        Search
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-md">
                        {searchResults.map(user => (
                            <div key={user._id} className="flex items-center justify-between p-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <div>
                                    <div className="text-primary">{user.username}</div>
                                    <div className="text-tertiary text-sm">{user.uuid}</div>
                                </div>
                                <button onClick={() => sendFriendRequest(user._id)} className="btn btn-primary btn-sm">
                                    Add Friend
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="card mb-lg">
                    <h3>Pending Requests ({pendingRequests.length})</h3>
                    {pendingRequests.map(request => (
                        <div key={request._id} className="flex items-center justify-between p-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div>
                                <div className="text-primary">{request.requester.username}</div>
                                <div className="text-tertiary text-sm">{request.requester.uuid}</div>
                            </div>
                            <div className="flex gap-sm">
                                <button onClick={() => acceptRequest(request._id)} className="btn btn-success btn-sm">
                                    Accept
                                </button>
                                <button onClick={() => rejectRequest(request._id)} className="btn btn-secondary btn-sm">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Friends List */}
            <div className="card">
                <h3>My Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                    <p className="text-secondary">No friends yet. Search and add friends above!</p>
                ) : (
                    friends.map(({ friendshipId, friend }) => (
                        <div key={friendshipId} className="flex items-center justify-between p-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div>
                                <div className="text-primary">{friend.username}</div>
                                <div className="text-tertiary text-sm">{friend.uuid}</div>
                            </div>
                            <div className="flex gap-sm">
                                <a href={`/friends/${friend.id}`} className="btn btn-secondary btn-sm">
                                    View Goals
                                </a>
                                <button onClick={() => removeFriend(friendshipId)} className="btn btn-danger btn-sm">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Friends;
