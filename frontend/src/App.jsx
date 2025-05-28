import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConnectedDevices } from './services/api';
import Button from './components/Button';
import './App.css';

// קומפוננטת הדף הראשי של האפליקציה
// מציגה רשימה של כפתורים עבור כל המכשירים המחוברים
function App() {
  // מערך שמכיל את כל המכשירים המחוברים
  const [devices, setDevices] = useState([]);
  // פונקציית ניווט של React Router
  const navigate = useNavigate();

  // אפקט שמתחיל את איסוף נתוני המכשירים ומעדכן אותם כל שנייה
  useEffect(() => {
    // קריאה ראשונית לקבלת המכשירים
    fetchDevices();

    // הגדרת טיימר שיעדכן את רשימת המכשירים כל שנייה
    const interval = setInterval(fetchDevices, 1000);

    // ניקוי הטיימר כשהקומפוננטה מתפרקת
    return () => clearInterval(interval);
  }, []);

  // פונקציה לקבלת רשימת המכשירים המחוברים מהשרת
  const fetchDevices = async () => {
    try {
      // מביא את רשימת המכשירים מהשרת
      const connectedDevices = await getConnectedDevices();
      setDevices(connectedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // פונקציה שמופעלת בלחיצה על כפתור מטופל
  // מנווטת לדף הניטור של המטופל הנבחר
  const handlePatientClick = (deviceId) => {
    navigate(`/${deviceId}`);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Patient Vital Signs Monitor</h1>
      </header>
      <main>
        {/* רשימת הכפתורים - כפתור לכל מכשיר מחובר */}
        <div className="patients-grid">
          {devices.map((deviceId) => (
            <Button key={deviceId} id={deviceId} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
