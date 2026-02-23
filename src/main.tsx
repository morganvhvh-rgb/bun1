import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * MOBILE VIEWPORT FIX
 * --------------------
 * CSS viewport units (vh, dvh) are unreliable on Android with the 3-button
 * navigation bar — they include the area behind the nav bar, causing the
 * bottom of the app to be clipped.
 *
 * window.innerHeight is the ONLY universally reliable measurement of the
 * truly visible viewport. We sync it to a CSS variable on every resize.
 */
function syncAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
syncAppHeight();
window.addEventListener('resize', syncAppHeight);
// Some Android browsers fire orientationchange separately from resize
window.addEventListener('orientationchange', () => {
  setTimeout(syncAppHeight, 150);
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
