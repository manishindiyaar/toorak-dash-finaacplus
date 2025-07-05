import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App.jsx";

const mount = (element) => {
  const root = createRoot(element || document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// If we are in development or standalone mode, render immediately
if (process.env.NODE_ENV === 'development' || !window.containerContext) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    mount(rootElement);
  }
}

// Export mount function for the host
export { mount }; 