import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('No root element found');

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('Critical initialization error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #ef4444; font-family: sans-serif;">
      <h2>Error de carga</h2>
      <p>Lo sentimos, ha ocurrido un error al iniciar la aplicación.</p>
      <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" 
              style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px;">
        Limpiar datos y reintentar
      </button>
    </div>
  `;
}

