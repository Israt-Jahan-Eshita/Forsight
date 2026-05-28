import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 
import { ThemeProvider } from './context/ThemeContext' 
import { AuthProvider } from './context/AuthContext' // <-- 1. Import AuthProvider
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* <-- 2. Wrap the app so auth is global */}
      <ThemeProvider> 
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)