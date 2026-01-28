// src/components/FloatingChatButton.jsx
import './FloatingChatButton.css';
const FloatingChatButton = ({ isOpen, toggleChat }) => {
  return (
    <button 
      className={`floating-chat-button ${isOpen ? 'is-open' : ''}`} 
      onClick={toggleChat}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        // You could use an X icon here or simple text
        <span className="close-icon">&times;</span> 
      ) : (
        // Use an image for the chat icon
        <img src="https://icons.veryicon.com/png/o/miscellaneous/jinfeng-information-technology/chat-118.png" alt="Chat" className="chat-icon-img" />
      )}
    </button>
  );
};

export default FloatingChatButton;