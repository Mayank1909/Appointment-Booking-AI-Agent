// src/components/Auth.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth(); // Grab the login function from our custom hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Determine which backend route to hit
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { email, password } 
      : { email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // data contains { id, name, email } from the Python backend
        login(data); 
      } else {
        setError(data.detail || "Authentication failed. Please try again.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError("Cannot connect to the server. Is the backend running?");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p>{isLogin ? "Login to Sneha's Clinic" : "Join our community for natural healing"}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "New to the clinic?" : "Already have an account?"}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Create an account" : " Sign in instead"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;