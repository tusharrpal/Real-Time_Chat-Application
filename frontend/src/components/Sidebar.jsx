import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Search, LogOut, MessageSquare } from 'lucide-react';
import '../App.css';

const Sidebar = ({ users, selectedUser, setSelectedUser, unreadCounts, clearUnread }) => {
  const { authUser, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar-container">
      {/* Sidebar Header: Logged-in User and Logout */}
      <div className="sidebar-header">
        <div className="current-user-info">
          <img src={authUser?.profilePic} alt={authUser?.username} />
          <div className="current-user-name" title={authUser?.username}>
            {authUser?.username.length > 14
              ? `${authUser.username.substring(0, 12)}...`
              : authUser?.username}
          </div>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="user-list">
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;
            const unread = unreadCounts[user._id] || 0;

            return (
              <div
                key={user._id}
                className={`user-item ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedUser(user);
                  clearUnread(user._id);
                }}
              >
                <div className="user-item-left">
                  <div className="avatar-wrapper">
                    <img src={user.profilePic} alt={user.username} />
                    <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
                  </div>
                  <div className="user-item-info">
                    <span className="user-item-name">{user.username}</span>
                    <span className="user-item-sub">
                      {isOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                </div>

                <div className="user-item-right">
                  {unread > 0 && <span className="unread-badge">{unread}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
