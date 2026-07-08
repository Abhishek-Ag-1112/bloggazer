// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'nprogress/nprogress.css';
import 'react-mde/lib/styles/css/react-mde-all.css'; // <-- ADD THIS IMPORT

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);