import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './contexts/UserContext'; // Import the UserProvider
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider> {/* Wrap App with UserProvider */}
      <App />
    </UserProvider>
  </React.StrictMode>,
);
