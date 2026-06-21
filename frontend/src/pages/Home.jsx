import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { MessageSquare } from 'lucide-react';
import '../App.css';

const Home = () => {
  const { token, authUser } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingStatus, setTypingStatus] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch users for sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/messages/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching sidebar users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // Fetch chat history when selectedUser changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser) return;
      try {
        const res = await fetch(`/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [selectedUser, token]);

  // Handle Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    const handleNewMessage = (newMessage) => {
      // If message is from the user we are currently chatting with
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);

        // Tell backend/sender we've read it (since chat is open)
        fetch(`/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Increment unread count for background chat
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    // Listen for read receipt signals
    const handleMessagesRead = ({ senderId, receiverId }) => {
      // If we sent the messages and the other user read them while active
      if (selectedUser && senderId === selectedUser._id && receiverId === authUser._id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === authUser._id ? { ...msg, isRead: true } : msg))
        );
      }
    };

    // Listen for typing events
    const handleTyping = ({ senderId }) => {
      setTypingStatus((prev) => ({ ...prev, [senderId]: true }));
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingStatus((prev) => ({ ...prev, [senderId]: false }));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
    };
  }, [socket, selectedUser, authUser, token]);

  // Send a message (invoked by ChatArea -> MessageInput)
  const handleSendMessage = async ({ text, mediaFile }) => {
    if (!selectedUser) return;

    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (mediaFile) formData.append('media', mediaFile);

      const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const clearUnread = (userId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [userId]: 0,
    }));
  };

  return (
    <div className="main-container">
      {/* Sidebar Panel */}
      {loadingUsers ? (
        <div style={{ width: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : (
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          unreadCounts={unreadCounts}
          clearUnread={clearUnread}
        />
      )}

      {/* Main Chat Panel */}
      {selectedUser ? (
        <ChatArea
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          isReceiverTyping={!!typingStatus[selectedUser._id]}
        />
      ) : (
        <div className="chat-welcome">
          <div className="welcome-logo">
            <MessageSquare size={36} />
          </div>
          <h1>Welcome to SyncChat</h1>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
            Select a conversation from the sidebar to start messaging in real-time.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
