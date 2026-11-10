import React from 'react';
import { createRoot } from 'react-dom/client';

/* Fonts are bundled (no Google Fonts request at runtime) so the site works
   offline, on any host, and never flashes unstyled text. */
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-500-italic.css';
import '@fontsource/poppins/latin-300.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/caveat/latin-600.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/buttons.css';
import App from './App';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
