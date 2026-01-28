// src/App.jsx
import { useAuth } from './hooks/useAuth';
import Auth from './Components/Auth';
import ChatWidget from './Components/ChatWidget';
import FloatingChatButton from './Components/FloatingChatButton';
import { useState } from 'react';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // If no user is logged in, show the Auth (Login/Register) screen
  if (!user) {
    return <Auth />;
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">Sneha's Homeopathic Clinic</div>
        <div className="nav-user">
          <span>Welcome, <strong>{user.name}</strong></span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Natural Healing for a Better Life</h1>
          <p>
            Experience personalized homeopathic care tailored to your needs. 
            Our AI assistant is ready to help you schedule your next visit.
          </p>
          <button className="hero-cta-button" onClick={toggleChat}>
            Book Appointment
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="container">
        <section className="info-card">
          <h2>Why Homeopathy?</h2>
          <p>
            Homeopathy is a safe, gentle, and natural system of healing that works with 
            your body to relieve symptoms, restore itself, and improve your overall health.
          </p>
        </section>

        <section className="info-card">
          <h2>How to Book</h2>
          <p>
            Click the chat icon at the bottom right to talk to our assistant. 
            Just mention the date and time you prefer, and we'll handle the rest!
          </p>
        </section>
      </main>

      {/* Chat Logic */}
      <FloatingChatButton isOpen={isChatOpen} toggleChat={toggleChat} />
      
      {isChatOpen && (
        <ChatWidget onClose={toggleChat} />
      )}
    </div>
  );
}

// Default export of the App component
export default AppContent;