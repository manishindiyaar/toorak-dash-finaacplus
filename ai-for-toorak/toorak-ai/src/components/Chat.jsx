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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render interest calculation results
  const renderInterestCalculation = (result) => {
    if (result.error) {
      return (
        <div className="interest-calculation error">
          <h3>❌ Error</h3>
          <p>{result.error}</p>
        </div>
      );
    }

    return (
      <div className="interest-calculation">
        <h3>💰 Interest Calculation</h3>
        <div className="calculation-details">
          {result.loanId && (
            <div className="loan-info">
              <h4>Loan: {result.loanId} - {result.borrower}</h4>
            </div>
          )}
          <div className="calculation-grid">
            <div className="calc-item">
              <label>Principal Amount:</label>
              <span>{formatCurrency(result.loanAmount)}</span>
            </div>
            <div className="calc-item">
              <label>Interest Rate:</label>
              <span>{formatPercentage(result.interestRate)}</span>
            </div>
            <div className="calc-item">
              <label>Period:</label>
              <span>{result.daysElapsed} days ({result.years} years)</span>
            </div>
            <div className="calc-item">
              <label>Start Date:</label>
              <span>{formatDate(result.loanDate || result.startDate)}</span>
            </div>
            <div className="calc-item">
              <label>End Date:</label>
              <span>{formatDate(result.endDate)}</span>
            </div>
            <div className="calc-item">
              <label>Calculation Type:</label>
              <span>{result.calculationType === 'compound' ? 'Compound' : 'Simple'} Interest</span>
            </div>
            <div className="calc-item highlight">
              <label>Accrued Interest:</label>
              <span>{formatCurrency(result.accruedInterest)}</span>
            </div>
            <div className="calc-item total">
              <label>Total Amount:</label>
              <span>{formatCurrency(result.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render portfolio analytics results
  const renderPortfolioAnalytics = (result) => {
    return (
      <div className="portfolio-analytics">
        <h3>📊 Portfolio Analytics</h3>
        
        {/* Summary Stats */}
        <div className="summary-stats">
          <div className="stat-card">
            <h4>Total Loans</h4>
            <span className="stat-value">{result.totalLoans}</span>
          </div>
          <div className="stat-card">
            <h4>Total Amount</h4>
            <span className="stat-value">{formatCurrency(result.totalLoanAmount)}</span>
          </div>
          <div className="stat-card">
            <h4>Average Loan</h4>
            <span className="stat-value">{formatCurrency(result.averageLoanAmount)}</span>
          </div>
          <div className="stat-card">
            <h4>Average LTV</h4>
            <span className="stat-value">{formatPercentage(result.averageLTV)}</span>
          </div>
          <div className="stat-card">
            <h4>Average Rate</h4>
            <span className="stat-value">{formatPercentage(result.averageInterestRate)}</span>
          </div>
          {result.totalAccruedInterest && (
            <div className="stat-card">
              <h4>Accrued Interest</h4>
              <span className="stat-value">{formatCurrency(result.totalAccruedInterest)}</span>
            </div>
          )}
        </div>

        {/* Breakdowns */}
        <div className="breakdowns">
          <div className="breakdown-section">
            <h4>📋 Status Breakdown</h4>
            <div className="breakdown-grid">
              {Object.entries(result.statusBreakdown).map(([status, data]) => (
                <div key={status} className="breakdown-item">
                  <span className="breakdown-label">{status}</span>
                  <span className="breakdown-count">{data.count} loans</span>
                  <span className="breakdown-amount">{formatCurrency(data.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-section">
            <h4>🏢 Property Type Breakdown</h4>
            <div className="breakdown-grid">
              {Object.entries(result.propertyTypeBreakdown).map(([type, data]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-label">{type}</span>
                  <span className="breakdown-count">{data.count} loans</span>
                  <span className="breakdown-amount">{formatCurrency(data.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-section">
            <h4>📍 Location Breakdown</h4>
            <div className="breakdown-grid">
              {Object.entries(result.locationBreakdown).slice(0, 8).map(([location, data]) => (
                <div key={location} className="breakdown-item">
                  <span className="breakdown-label">{location}</span>
                  <span className="breakdown-count">{data.count} loans</span>
                  <span className="breakdown-amount">{formatCurrency(data.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-section">
            <h4>⚠️ Risk Profile (LTV)</h4>
            <div className="breakdown-grid">
              {Object.entries(result.ltvRanges).map(([range, count]) => (
                <div key={range} className="breakdown-item">
                  <span className="breakdown-label">{range}</span>
                  <span className="breakdown-count">{count} loans</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="insights">
          <h4>💡 Key Insights</h4>
          <div className="insights-grid">
            <div className="insight-item">
              <label>Most Common Status:</label>
              <span>{result.insights.mostCommonStatus}</span>
            </div>
            <div className="insight-item">
              <label>Most Common Property Type:</label>
              <span>{result.insights.mostCommonPropertyType}</span>
            </div>
            <div className="insight-item">
              <label>Top Location by Volume:</label>
              <span>{result.insights.topLocationByVolume}</span>
            </div>
            <div className="insight-item">
              <label>Risk Profile:</label>
              <span className={result.insights.riskProfile.includes('High') ? 'high-risk' : 'balanced-risk'}>
                {result.insights.riskProfile}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
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
            
            if (state === 'result') {
              switch (toolName) {
                case 'getLoanDetails':
                  return (
                    <div key={toolCallId} className="tool-result">
                      <div className="loan-results-header">
                        <h3>🔍 Loan Search Results</h3>
                        <div className="result-summary">
                          <span>Found {result.loans.length} of {result.total} matching loans</span>
                          {result.filtered && (
                            <span className="filtered-indicator">
                              (Filtered from {result.totalInDatabase} total loans)
                            </span>
                          )}
                        </div>
                        {result.filters && Object.values(result.filters).some(f => f) && (
                          <div className="active-filters">
                            <h4>Active Filters:</h4>
                            {Object.entries(result.filters).map(([key, value]) => 
                              value && (
                                <span key={key} className="filter-tag">
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                      <div className="loans-grid">
                        {result.loans.map((loan) => (
                          <LoanCard key={loan.id} loan={loan} />
                        ))}
                      </div>
                    </div>
                  );
                
                case 'calculateInterest':
                  return (
                    <div key={toolCallId} className="tool-result">
                      {renderInterestCalculation(result)}
                    </div>
                  );
                
                case 'analyzePortfolio':
                  return (
                    <div key={toolCallId} className="tool-result">
                      {renderPortfolioAnalytics(result)}
                    </div>
                  );
                
                default:
                  return null;
              }
            } else if (state === 'call') {
              const loadingMessages = {
                'getLoanDetails': 'Searching for loans...',
                'calculateInterest': 'Calculating interest...',
                'analyzePortfolio': 'Analyzing portfolio...'
              };
              
              return (
                <div key={toolCallId} className="tool-loading">
                  <div className="loading-spinner"></div>
                  <span>{loadingMessages[toolName] || 'Processing...'}</span>
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
        <p>Advanced loan portfolio analysis and management</p>
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
                  onClick={() => handleExampleQuery('Show me all commercial loans with LTV below 70%')}
                >
                  📊 Commercial loans (LTV &lt; 70%)
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Calculate interest for loan L001')}
                >
                  💰 Calculate interest for L001
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Show me portfolio analytics with interest calculations')}
                >
                  📈 Portfolio analytics
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Find loans over $1M funded this year')}
                >
                  🔍 High-value loans (2024)
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('Show me residential loans in California sorted by amount')}
                >
                  🏠 CA residential loans
                </button>
                <button
                  className="example-button"
                  onClick={() => handleExampleQuery('What is the total accrued interest for all funded loans?')}
                >
                  📊 Total accrued interest
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