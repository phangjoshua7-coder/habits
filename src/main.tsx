import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent Firebase iframe authentication/popup rejections from crashing the app overlay in development
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const isFirebaseAuthError = reason && (
    reason.message?.includes("Pending promise was never set") ||
    reason.message?.includes("auth/cancelled-popup-request") ||
    reason.message?.includes("auth/popup-blocked") ||
    (typeof reason === "object" && reason.code?.includes("auth/"))
  );
  if (isFirebaseAuthError) {
    console.warn("Handled Firebase iframe Auth exception gracefully:", reason.message || reason);
    event.preventDefault(); // Suppresses unhandled promise rejection error overlay
  }
});

window.addEventListener("error", (event) => {
  const error = event.error;
  const isFirebaseAuthError = (
    (error && (
      error.message?.includes("Pending promise was never set") ||
      error.message?.includes("auth/cancelled-popup-request") ||
      error.message?.includes("auth/popup-blocked")
    )) ||
    event.message?.includes("Pending promise was never set") ||
    event.message?.includes("auth/cancelled-popup-request") ||
    event.message?.includes("auth/popup-blocked")
  );
  if (isFirebaseAuthError) {
    console.warn("Handled Firebase SDK error gracefully:", error?.message || event.message);
    event.preventDefault(); // Suppresses global uncaught exception error overlay
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
