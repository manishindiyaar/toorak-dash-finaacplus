import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onSubmit }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="welcome-section">
          <h1 className="welcome-heading">Toorak AI</h1>
          <p className="welcome-subtext">
            Ask me anything about your loan portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="query-form">
          <div className="query-input-container">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about loans... (e.g., 'Show me the last 10 loans')"
              className="query-input"
              autoFocus
            />
            <button 
              type="submit" 
              className="submit-button"
              disabled={!query.trim()}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </form>

        <div className="example-queries">
          <p className="example-label">you can try these</p>
          <div className="example-buttons">
            <button 
              className="example-button"
              onClick={() => setQuery('Show me the last 10 loans')}
            >
              Last 10 loans
            </button>
            <button 
              className="example-button"
              onClick={() => setQuery('Find all funded loans')}
            >
              Funded loans
            </button>
            <button 
              className="example-button"
              onClick={() => setQuery('Show me residential properties')}
            >
              Residential loans
            </button>
            <button 
              className="example-button"
              onClick={() => setQuery('Find loans in California')}
            >
              California loans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 