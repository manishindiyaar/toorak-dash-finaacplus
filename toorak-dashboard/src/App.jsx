import React, { Suspense, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ChartAreaInteractive } from './components/chart-area-interactive';
import { SectionCards } from './components/section-cards';
import { AddLoanPage } from './components/AddLoanPage';
import TotalLoan from './components/TotalLoan';
import InterestCalculator from './components/InterestCalculator';
import { AppSidebar } from './components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';

// Lazy load the Toorak AI component from the remote
const ToorakAI = React.lazy(() => import("toorakAi/App"));

// Error Boundary for Remote Component
class RemoteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Remote component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#1C1C1E] text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">AI Chat Unavailable</h2>
            <p className="mb-4">There was an error loading the AI chat component.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Dashboard Page Component
function DashboardPage() {
  return (
    <div className='w-full max-w-[1400px] mx-auto px-4 pb-8 mt-10'>
      {/* Updated Cards Grid using SectionCards component */}
      <div className="mb-6">
        <SectionCards />
      </div>
      
      {/* Chart Section */}
      <div className='mb-6'>
        <ChartAreaInteractive />
      </div>
      
      {/* Loan Data Section */}
      <div className='bg-white rounded-lg shadow p-6 mb-6'>
        <h2 className="text-2xl font-bold mb-4">Detailed Loan Information</h2>
        <TotalLoan />
      </div>
    </div>
  );
}

// AI Chat Page Component - Full Screen with Error Handling
function AIChatPage() {
  const remoteRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Force garbage collection when component mounts
    if (window.gc) {
      window.gc();
    }

    return () => {
      // Cleanup when component unmounts
      if (remoteRef.current) {
        remoteRef.current = null;
      }
      // Force garbage collection if available
      if (window.gc) {
        setTimeout(() => window.gc(), 100);
      }
    };
  }, []);

  return (
    <div className='w-full h-screen' ref={remoteRef}>
      <RemoteErrorBoundary>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-[#1C1C1E]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-white text-lg">Loading Toorak AI...</div>
            </div>
          </div>
        }>
          <ToorakAI key={location.pathname} />
        </Suspense>
      </RemoteErrorBoundary>
    </div>
  );
}

// Loan Portfolio Page Component
function LoanPortfolioPage() {
  return (
    <div className='w-full max-w-[1400px] mx-auto px-4 pb-8 mt-10'>
      <TotalLoan />
    </div>
  );
}

// Interest Calculator Page Component
function InterestCalculatorPage() {
  return (
    <div className='w-full max-w-[1400px] mx-auto px-4 pb-8 mt-10'>
      <InterestCalculator />
    </div>
  );
}

// Add Loan Page Component
function AddLoanPageWrapper() {
  return (
    <AddLoanPage 
      onBack={() => window.history.back()}
      onLoanAdded={() => {
      
      }}
    />
  );
}

// App Content Component to handle layout based on route
function AppContent() {
  const location = useLocation();
  const isAIChatRoute = location.pathname === '/ai-chat';

  if (isAIChatRoute) {
    // Full screen AI Chat without sidebar
    return (
      <>
        <Routes>
          <Route path="/ai-chat" element={<AIChatPage />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Regular layout with sidebar for other routes
  return (
    <SidebarProvider defaultOpen={true}>
      <div className='flex h-screen w-full'>
        {/* Sidebar Navigation */}
        <AppSidebar 
          className="hidden lg:flex"
        />
        
        {/* Main Content */}
        <div className='flex-1 overflow-auto'>
          <Routes>
            {/* Default route redirects to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard Route */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Loan Portfolio Route */}
            <Route path="/loan-portfolio" element={<LoanPortfolioPage />} />
            
            {/* Add New Loan Route */}
            <Route path="/add-loan" element={<AddLoanPageWrapper />} />
            
            {/* Interest Calculator Route */}
            <Route path="/interest-calculator" element={<InterestCalculatorPage />} />
            
            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;