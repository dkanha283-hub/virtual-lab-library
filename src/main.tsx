import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { LabStoreProvider } from './context/LabStoreContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LabStoreProvider>
        <App />
      </LabStoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
