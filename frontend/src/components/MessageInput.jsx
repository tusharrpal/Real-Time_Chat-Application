import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, FileText } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const MessageInput = ({ onSendMessage, receiverId }) => {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewName, setMediaPreviewName] = useState('');
  const fileInputRef = useRef(null);
  const { socket } = useSocket();
  const { authUser } = useAuth();
  const typingTimeoutRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Handle typing event triggers
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!socket || !receiverId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { senderId: authUser._id, receiverId });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: authUser._id, receiverId });
      setIsTyping(false);
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setMediaFile(file);
    setMediaPreviewName(file.name);
  };

  const removeAttachedFile = () => {
    setMediaFile(null);
    setMediaPreviewName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaFile) return;

    // Stop typing immediately when sending
    if (socket && receiverId) {
      socket.emit('stopTyping', { senderId: authUser._id, receiverId });
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    const messagePayload = {
      text: text.trim(),
      mediaFile,
    };

    onSendMessage(messagePayload);
    setText('');
    removeAttachedFile();
  };

  // Stop typing on unmount or recipient change
  useEffect(() => {
    return () => {
      if (socket && receiverId && isTyping) {
        socket.emit('stopTyping', { senderId: authUser._id, receiverId });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [receiverId, socket]);

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      {/* Media Attachment Preview Banner */}
      {mediaFile && (
        <div className="preview-container">
          <FileText size={16} className="preview-icon" />
          <span className="preview-text">{mediaPreviewName}</span>
          <button type="button" className="preview-remove-btn" onClick={removeAttachedFile}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input controls wrapper */}
      <div className="input-controls-wrapper">
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="media-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Image/Document"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          className="text-input-field"
          placeholder="Type a message..."
          value={text}
          onChange={handleInputChange}
        />

        <button
          type="submit"
          className="message-send-btn"
          disabled={!text.trim() && !mediaFile}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
