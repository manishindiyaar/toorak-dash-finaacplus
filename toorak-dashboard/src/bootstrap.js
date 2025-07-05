import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App.jsx";

const mount = () => {
  const root = createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Call the mount function immediately in the host's bootstrap
mount(); 