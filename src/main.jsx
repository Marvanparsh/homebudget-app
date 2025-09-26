import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './social-login.css'
import './modern-auth.css'
import './enhanced-sync-indicator.css'
import './sync-demo.css'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
