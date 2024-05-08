import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      // Registration was successful
      console.log('Service Worker registered with scope: ', registration.scope);

      // Listen for updates to the service worker.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          // Has network.state changed?
          switch (newWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log("New content is available; please refresh.");
                // Optionally, inform the user about the update
              }
              break;
          }
        });
      });

      // Check if the page is being controlled by a service worker.
      if (navigator.serviceWorker.controller) {
        console.log("This page is currently controlled by:", navigator.serviceWorker.controller);
        navigator.serviceWorker.controller.postMessage({
          type: 'PAGE_LOADED',
          msg: 'Page is loaded and controlled by service worker.'
        });
      } else {
        console.log("Service Worker is registered but does not yet control this page.");
      }
    })
    .catch(function(err) {
      // Registration failed
      console.log('Service Worker registration failed: ', err);
    });

    // Setup a listener to receive messages from the service worker
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('Message from Service Worker: ', event.data.msg);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
