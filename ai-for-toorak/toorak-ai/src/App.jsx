import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [initialQuery, setInitialQuery] = useState('');

  const handleQuerySubmit = (query) => {
    setInitialQuery(query);
    setCurrentView('chat');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setInitialQuery('');
  };

  return (
    <div className="App">
      {currentView === 'landing' ? (
        <LandingPage onSubmit={handleQuerySubmit} />
      ) : (
        <Chat 
          initialQuery={initialQuery} 
          onBackToLanding={handleBackToLanding} 
        />
      )}
    </div>
  );
}

export default App;
