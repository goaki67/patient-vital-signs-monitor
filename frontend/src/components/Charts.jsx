import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Chart from './Chart';
import { getPatientData } from '../services/api';
import './Charts.css';

// קומפוננטה ראשית שמציגה את כל הגרפים של המטופל
// מקבלת את מזהה המטופל מה-URL ומציגה שלושה גרפים: דופק, רמת חמצן בדם וטמפרטורה
function Charts() {
  const { id } = useParams();
  
  // מצב האודיו - משמש להשמעת התראות כשהערכים חורגים מהגבולות
  const [audioContext, setAudioContext] = useState(null);
  
  // אובייקט המכיל את כל הנתונים של המטופל
  // כל מערך מכיל אובייקטים עם שדות value (ערך המדידה) ו-timestamp (זמן המדידה)
  const [data, setData] = useState({
    heartRate: [], // מערך מדידות דופק
    spo2: [],     // מערך מדידות רמת חמצן בדם
    temperature: [] // מערך מדידות טמפרטורה
  });

  // הגדרת ערכי הסף לכל סוג מדידה
  // min - ערך מינימלי תקין, max - ערך מקסימלי תקין
  // חריגה מערכים אלו תגרום להתראה קולית ולשינוי צבע הגרף
  const [boundaries] = useState({
    heartRate: { min: 50, max: 120 },    // דופק: 50-120 פעימות לדקה
    spo2: { min: 90, max: 100 },         // רמת חמצן: 90%-100%
    temperature: { min: 35, max: 40 }     // טמפרטורה: 35-40 מעלות צלזיוס
  });

  // פונקציה להשמעת צליל התראה
  // נקראת כאשר אחד הערכים חורג מהגבולות שהוגדרו
  const playAlert = useCallback(() => {
    let ctx = audioContext;
    // יצירת הקשר אודיו חדש אם לא קיים
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    }

    // יצירת צליל התראה באמצעות אוסילטור
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // הגדרת פרמטרי הצליל: סוג גל סינוס, תדירות 440Hz, עוצמה 0.1
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

    // השמעת הצליל למשך 0.2 שניות
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  }, [audioContext]);

  // אפקט שמתחיל את איסוף הנתונים ומעדכן אותם כל שנייה
  useEffect(() => {
    // קריאה ראשונית לקבלת נתונים
    fetchData();

    // הגדרת טיימר שיעדכן את הנתונים כל שנייה
    const interval = setInterval(fetchData, 1000);

    // ניקוי הטיימר כשהקומפוננטה מתפרקת
    return () => clearInterval(interval);
  }, [id]);

  // פונקציה להמרת הנתונים הגולמיים מה-API למבנה הנדרש עבור הגרפים
  // ממירה את שדות hr, spo2, temp לאובייקטים עם value ו-timestamp
  const transformData = (rawData) => {
    return {
      heartRate: rawData.map(reading => ({
        value: reading.hr,
        timestamp: reading.timestamp * 1000 // המרה ממילישניות לשניות
      })),
      spo2: rawData.map(reading => ({
        value: reading.spo2,
        timestamp: reading.timestamp * 1000
      })),
      temperature: rawData.map(reading => ({
        value: reading.temp,
        timestamp: reading.timestamp * 1000
      }))
    };
  };

  // פונקציה לקבלת הנתונים מהשרת ועדכון המצב
  const fetchData = async () => {
    try {
      // קבלת הנתונים הגולמיים מה-API
      const rawData = await getPatientData(id);
      
      // המרת הנתונים למבנה הנדרש
      const transformedData = transformData(rawData);
      
      // עדכון הנתונים רק אם יש שינוי מהמצב הקודם
      setData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(transformedData)) {
          return transformedData;
        }
        return prevData;
      });

      // בדיקת חריגה מהגבולות והשמעת התראה במידת הצורך
      const latestReading = rawData[rawData.length - 1];
      if (latestReading) {
        if (latestReading.hr > boundaries.heartRate.max || latestReading.hr < boundaries.heartRate.min ||
            latestReading.spo2 > boundaries.spo2.max || latestReading.spo2 < boundaries.spo2.min ||
            latestReading.temp > boundaries.temperature.max || latestReading.temp < boundaries.temperature.min) {
          playAlert();
        }
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  // הרכיב מחזיר דף עם שלושה גרפים ופקדי שליטה בגבולות עבור כל גרף
  return (
    <div className="charts-container">
      <h1>Patient Monitoring - {id}</h1>
      <div className="charts-grid">
        {/* גרף דופק */}
        <div className="chart-card">
          <h2>Heart Rate</h2>
          <div className="chart-controls">
            <div className="boundary-input">
              <label>Lower:</label>
              <input
                type="number"
                value={boundaries.heartRate.min}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.heartRate.min = numValue;
                  }
                }}
              />
            </div>
            <div className="boundary-input">
              <label>Upper:</label>
              <input
                type="number"
                value={boundaries.heartRate.max}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.heartRate.max = numValue;
                  }
                }}
              />
            </div>
          </div>
          <div className="chart-wrapper">
            <Chart
              title="Heart Rate"
              data={data.heartRate}
              unit="BPM"
              boundaries={boundaries.heartRate}
            />
          </div>
        </div>

        {/* גרף רמת חמצן בדם */}
        <div className="chart-card">
          <h2>SPO2</h2>
          <div className="chart-controls">
            <div className="boundary-input">
              <label>Lower:</label>
              <input
                type="number"
                value={boundaries.spo2.min}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.spo2.min = numValue;
                  }
                }}
              />
            </div>
            <div className="boundary-input">
              <label>Upper:</label>
              <input
                type="number"
                value={boundaries.spo2.max}
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.spo2.max = numValue;
                  }
                }}
              />
            </div>
          </div>
          <div className="chart-wrapper">
            <Chart
              title="SPO2"
              data={data.spo2}
              unit="%"
              boundaries={boundaries.spo2}
            />
          </div>
        </div>

        {/* גרף טמפרטורה */}
        <div className="chart-card">
          <h2>Temperature</h2>
          <div className="chart-controls">
            <div className="boundary-input">
              <label>Lower:</label>
              <input
                type="number"
                value={boundaries.temperature.min}
                step="0.1"
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.temperature.min = numValue;
                  }
                }}
              />
            </div>
            <div className="boundary-input">
              <label>Upper:</label>
              <input
                type="number"
                value={boundaries.temperature.max}
                step="0.1"
                onChange={(e) => {
                  const numValue = parseFloat(e.target.value);
                  if (!isNaN(numValue)) {
                    boundaries.temperature.max = numValue;
                  }
                }}
              />
            </div>
          </div>
          <div className="chart-wrapper">
            <Chart
              title="Temperature"
              data={data.temperature}
              unit="°C"
              boundaries={boundaries.temperature}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts; 