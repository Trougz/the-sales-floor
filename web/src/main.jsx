import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/ui.css';
import './styles/layout.css';
import './styles/forms.css';
import './styles/sections.css';
import './styles/pages.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
