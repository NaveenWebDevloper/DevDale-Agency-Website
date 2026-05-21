import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeClarity } from './analytics/clarity'

initializeClarity();

createRoot(document.getElementById("root")!).render(<App />);
