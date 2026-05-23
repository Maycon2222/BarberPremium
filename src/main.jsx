import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initializeStorage } from './utils/seed-init'
import { ThemeProvider } from './design-system'
import './styles.css'

initializeStorage().finally(async () => {
  const { default: App } = await import('./App')
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>,
  )
})
