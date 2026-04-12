import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import WebApp from '@twa-dev/sdk';
import App from './App';
import { setAuthHeader } from './api/client';
import './index.css';

function Root() {
  useEffect(() => {
    // Initialize Telegram SDK
    WebApp.ready();
    WebApp.expand();

    // Pass auth header to API client
    if (WebApp.initData) {
      setAuthHeader(WebApp.initData);
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
