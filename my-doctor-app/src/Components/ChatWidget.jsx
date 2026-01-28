import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './ChatWidget.css';

const ChatWidget = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: `Hello ${user?.name}! How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const historyForBackend = [...messages]; // History before adding current message
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: input, 
            user: user,
            history: historyForBackend 
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Connection error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <h3>Dr. Sneha's Assistant</h3>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="chat-body">
  {messages.map((msg, i) => (
    <div key={i} className={`message-row ${msg.sender}`}>
      <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
    </div>
  ))}

  {/* THIS IS THE MISSING PIECE */}
  {isLoading && (
    <div className="message-row bot">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )}
  
  <div ref={messagesEndRef} />
</div>
      <div className="chat-input-area">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyUp={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
};

export default ChatWidget;