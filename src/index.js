import React from 'react';
import ReactDOM from 'react-dom/client';
import './Style.css';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';

/* 
   HOTFIX for Google Translate + React Conflict 
   Google Translate modifies text nodes in the DOM, which causes React to crash 
   with "NotFoundError: Failed to execute 'removeChild' on 'Node'" when it tries 
   to update those nodes. We monkey-patch Node.prototype methods to handle this gracefully.
*/
if (typeof Node === 'function' && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
        if (child.parentNode !== this) {
            if (console) console.warn('Google Translate Crash avoided: removeChild called on non-child');
            return child;
        }
        return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
        if (referenceNode && referenceNode.parentNode !== this) {
            if (console) console.warn('Google Translate Crash avoided: insertBefore called on non-child');
            return this.appendChild(newNode);
        }
        return originalInsertBefore.apply(this, arguments);
    };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <LanguageProvider>
            <App />
        </LanguageProvider>
    </React.StrictMode>
);
