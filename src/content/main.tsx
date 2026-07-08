import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './content.css';

function mount() {
  if (document.getElementById('goatified-root')) return;

  const container = document.createElement('div');
  container.id = 'goatified-root';
  document.documentElement.appendChild(container);

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mount();
} else {
  document.addEventListener('DOMContentLoaded', mount);
}
