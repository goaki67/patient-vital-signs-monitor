import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Charts from './components/Charts'

// קומפוננטת עטיפה שמעבירה את מזהה המטופל לקומפוננטת הגרפים
function ChartsWrapper() {
  const { id } = useParams();
  return <Charts id={id} />;
}

// נקודת הכניסה הראשית של האפליקציה
// מגדירה את ניתוב הדפים:
// / - דף הבית עם רשימת המטופלים
// /:id - דף ניטור של מטופל ספציפי
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:id" element={<ChartsWrapper />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
