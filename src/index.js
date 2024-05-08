import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope: ', registration.scope);

      // If the service worker is ready and there is no controller, force reload the page.
      if (registration.installing || registration.waiting) {
        registration.installing.addEventListener('statechange', function(e) {
          if (e.target.state === 'activated') {
            window.location.reload();
          }
        });
      }
          
      // Check if the page is being controlled by a service worker.
      if (navigator.serviceWorker.controller) {
        console.log("This page is currently controlled by:", navigator.serviceWorker.controller);
        navigator.serviceWorker.controller.postMessage({
          type: 'CHECK_SW',
          msg: 'Are you there, service worker?'
        });
      } else {
        console.log("Service Worker is registered but does not yet control this page.");
        // Comment out the reload. Instead, we instruct the user or developer what to do.
        // window.location.reload(); // Be cautious with this to avoid reload loops
      }
    })
    .catch(function(err) {
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
