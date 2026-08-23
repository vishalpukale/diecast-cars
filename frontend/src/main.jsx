import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import '@fontsource/bebas-neue';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import 'react-toastify/dist/ReactToastify.css';
import './style/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
    <App />
  </StrictMode>
);
