import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import { AuthProvider } from './hooks/use-auth'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster position="top-right" />
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
