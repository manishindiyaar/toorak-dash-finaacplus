import React, { useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import LoanCard from './LoanCard';
import './Chat.css';

const Chat = ({ initialQuery, onBackToLanding }) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append
  } = useChat({
    api: 'http://localhost:3000/api/chat',
    maxSteps: 5,
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery) {
      append({
        role: 'user',
        content: initialQuery,
      });
    }
  }, [initialQuery, append]);

  const handleExampleQuery = (query) => {
    append({
      role: 'user',
      content: query,
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderMessage = (message, isLast) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
      <div key={message.id} className={`message ${message.role}`}>
        <div className="message-avatar">
          {isUser ? 'U' : '✨'}
        </div>
                  <div className="message-content">
            {!message.toolInvocations?.length && (
              <div className="message-bubble">
                {message.content}
              </div>
            )}
          
          {/* Tool Results */}
          {message.toolInvocations?.map((toolInvocation) => {
            const { toolName, toolCallId, state, result } = toolInvocation;
            
            if (state === 'result' && toolName === 'getLoanDetails') {
              return (
                <div key={toolCallId} className="tool-result">
                  <div className="loan-results-header">
                    <h3>Loan Results</h3>
                    <p>Found {result.loans.length} matching loans</p>
                  </div>
                  <div className="loans-grid">
                    {result.loans.map((loan) => (
                      <LoanCard key={loan.id} loan={loan} />
                    ))}
                  </div>
                </div>
              );
            } else if (state === 'call' && toolName === 'getLoanDetails') {
              return (
                <div key={toolCallId} className="tool-loading">
                  <div className="loading-spinner"></div>
                  <span>Searching for loans...</span>
                </div>
              );
            }
            
            return null;
          })}
          
          {/* Action Buttons for Assistant Messages */}
          {isAssistant && (
            <div className="message-actions">
              <button 
                className="action-button" 
                onClick={() => copyToClipboard(message.content)}
                title="Copy message"
              >
                📋
              </button>
              <button 
                className="action-button"
                title="Like message"
              >
                👍
              </button>
              <button 
                className="action-button"
                title="Dislike message"
              >
                👎
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <button className="back-to-landing" onClick={onBackToLanding}>
        ← Back to Search
      </button>
      
      <div className="chat-header">
        <h1>Toorak AI Assistant</h1>
        <p>Ask me anything about your loan portfolio</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => renderMessage(message, index === messages.length - 1))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">✨</div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <div className="input-container">
          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <textarea
                className="message-input"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me anything about your loans..."
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </form>
          
          {messages.length === 0 && (
            <div className="example-queries">
              <p>Try asking about:</p>
              <div className="example-buttons">
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Show me all loans in Los Angeles')}
                >
                  Loans in Los Angeles
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Find commercial loans over $1M')}
                >
                  Commercial loans over $1M
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Show loans with LTV below 70%')}
                >
                  Low LTV loans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 