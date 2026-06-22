import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageInput from './MessageInput';
import { ArrowLeft, FileText, Check, CheckCheck } from 'lucide-react';
import '../App.css';

const ChatArea = ({ selectedUser, messages, onSendMessage, isReceiverTyping, onBack }) => {
  const { authUser } = useAuth();
  const { onlineUsers } = useSocket();
  const messageFeedRef = useRef(null);

  const isOnline = onlineUsers.includes(selectedUser._id);

  // Auto-scroll to the bottom of the feed when new messages arrive or typing status changes
  useEffect(() => {
    const feed = messageFeedRef.current;
    if (!feed) return;

    feed.scrollTo({
      top: feed.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isReceiverTyping]);

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="chat-area-container">
      {/* Active User Header */}
      <div className="chat-header">
        <div className="chat-header-user">
          <button
            type="button"
            className="mobile-back-btn"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={21} />
          </button>
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.username}
            className="chat-header-avatar"
          />
          <div className="chat-header-info">
            <span className="chat-header-name">{selectedUser.username}</span>
            <span className="chat-header-status">
              {isOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="message-feed" ref={messageFeedRef}>
        {messages.map((msg) => {
          const isSentByMe = msg.senderId === authUser._id;
          return (
            <div
              key={msg._id}
              className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}
            >
              {/* Media Sharing Render */}
              {msg.mediaType === 'image' && msg.mediaUrl && (
                <div className="message-media">
                  <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer">
                    <img src={msg.mediaUrl} alt="shared file" />
                  </a>
                </div>
              )}

              {msg.mediaType === 'file' && msg.mediaUrl && (
                <div className="message-media">
                  <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="message-media-file">
                    <FileText size={18} />
                    <span>Download File</span>
                  </a>
                </div>
              )}

              {/* Text Message Content */}
              {msg.text && (
                <div className="message-bubble">
                  {msg.text}
                </div>
              )}

              {/* Message metadata (time & read receipt) */}
              <div className="message-info">
                <span>{formatTime(msg.createdAt)}</span>
                {isSentByMe && (
                  <span style={{ marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
                    {msg.isRead ? (
                      <CheckCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
                    ) : (
                      <Check size={14} />
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Real-Time typing dots indicator */}
        {isReceiverTyping && (
          <div className="message-wrapper received">
            <div className="typing-indicator-container">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Typing</span>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}

        <div />
      </div>

      {/* Message Input Component */}
      <MessageInput onSendMessage={onSendMessage} receiverId={selectedUser._id} />
    </div>
  );
};

export default ChatArea;
