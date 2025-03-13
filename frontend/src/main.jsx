import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import ErrorBoundary from "./components/error-boundry.jsx";

const container = document.getElementById('root')

const root = createRoot(container)

root.render(
    <React.StrictMode>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
            <App/>
        </ErrorBoundary>
    </React.StrictMode>
)
