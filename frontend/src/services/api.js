// כתובת ה-API מוגדרת כיחסית כדי לעבור דרך ה-proxy של Vite
const API_BASE_URL = '/api';

// פונקציה לקבלת רשימת המכשירים המחוברים
// מחזירה מערך של מזהי מכשירים
export async function getConnectedDevices() {
  try {
    console.log('Fetching devices from:', `${API_BASE_URL}/`);
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received devices:', data);
    return data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

// פונקציה לקבלת נתוני מטופל לפי מזהה מכשיר
// מחזירה מערך של מדידות מהעשר דקות האחרונות
// כל מדידה מכילה:
// - hr: דופק
// - spo2: רמת חמצן בדם
// - temp: טמפרטורה
// - timestamp: זמן המדידה בשניות מאז 1970
export async function getPatientData(arduinoId) {
  try {
    console.log('Fetching data for patient:', arduinoId);
    const response = await fetch(`${API_BASE_URL}/${arduinoId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // סינון הנתונים לעשר הדקות האחרונות בלבד
    const tenMinutesAgo = Date.now() / 1000 - 600; // 600 seconds = 10 minutes
    const filteredData = data.filter(reading => reading.timestamp >= tenMinutesAgo);
    console.log('Received and filtered data for patient:', arduinoId, filteredData);
    return filteredData;
  } catch (error) {
    console.error('Error fetching patient data:', error);
    return [];
  }
} 