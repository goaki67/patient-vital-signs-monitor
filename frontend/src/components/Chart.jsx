import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';

// רישום הרכיבים הנדרשים של Chart.js
ChartJS.register(
  CategoryScale,   // ציר קטגוריות (זמן)
  LinearScale,     // ציר לינארי (ערכים)
  PointElement,    // נקודות על הגרף
  LineElement,     // קווים בגרף
  Title,          // כותרת
  Tooltip,        // חלון צף עם מידע
  Legend          // מקרא
);

// קומפוננטת גרף שמציגה נתונים בזמן אמת עם קווי גבול להתראות
// מקבלת כפרמטרים:
// title - כותרת הגרף
// data - מערך של נקודות מדידה
// unit - יחידות המדידה
// boundaries - גבולות עליון ותחתון להתראות
function Chart({ title, data, unit, boundaries }) {
  // עיבוד הנתונים - המרת תאריכים ומיון לפי זמן
  // משתמש ב-useMemo כדי לחסוך בחישובים מיותרים
  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return { values: [], timestamps: [] };
    
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    return {
      values: sortedData.map(point => point.value),
      timestamps: sortedData.map(point => new Date(point.timestamp).toLocaleTimeString())
    };
  }, [data]);

  // בדיקה אם יש חריגה מהגבולות
  // משנה את צבע הגרף לאדום אם יש חריגה
  const hasBoundaryCrossing = useMemo(() => {
    return processedData.values.some(
      value => value >= boundaries.max || value <= boundaries.min
    );
  }, [processedData.values, boundaries]);

  // הגדרת נתוני הגרף - שימוש ב-useMemo למניעת חישובים מיותרים
  const chartData = useMemo(() => ({
    labels: processedData.timestamps,
    datasets: [
      // קו נתונים ראשי - מציג את המדידות עצמן
      {
        label: `${title} (${unit})`,
        data: processedData.values,
        borderColor: hasBoundaryCrossing ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)',
        backgroundColor: hasBoundaryCrossing ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.1,
        fill: false,
        pointRadius: 3
      },
      // קו גבול עליון - מציג את הערך המקסימלי המותר
      {
        label: `Upper: ${boundaries.max}`,
        data: Array(processedData.timestamps.length).fill(boundaries.max),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      },
      // קו גבול תחתון - מציג את הערך המינימלי המותר
      {
        label: `Lower: ${boundaries.min}`,
        data: Array(processedData.timestamps.length).fill(boundaries.min),
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ]
  }), [processedData, title, unit, boundaries, hasBoundaryCrossing]);

  // הגדרות הגרף - שימוש ב-useMemo למניעת חישובים מיותרים
  const options = useMemo(() => ({
    responsive: true,                // גרף רספונסיבי
    maintainAspectRatio: false,     // לא שומר על יחס רוחב-גובה קבוע
    animation: false,               // ביטול אנימציות לשיפור ביצועים
    plugins: {
      // הגדרות מקרא
      legend: {
        display: true,
        position: 'top'
      },
      // הגדרות חלון צף עם מידע
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            if (context.dataset.label.includes('Upper') || context.dataset.label.includes('Lower')) {
              return context.dataset.label;
            }
            return `${title}: ${context.parsed.y} ${unit}`;
          }
        }
      }
    },
    // הגדרות צירים
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: `${title} (${unit})`
        },
        ticks: {
          callback: function(value) {
            if (value === boundaries.max) return `↑ ${value}`;
            if (value === boundaries.min) return `↓ ${value}`;
            return value;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    // הגדרות אינטראקציה
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }), [title, unit, boundaries]);

  // הרכיב מחזיר את הגרף עם שוליים של 20 פיקסלים
  return (
    <div style={{ width: '100%', height: '400px', padding: '20px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// הגדרת סוגי הפרופס שהקומפוננטה מקבלת
Chart.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      timestamp: PropTypes.number.isRequired
    })
  ).isRequired,
  unit: PropTypes.string.isRequired,
  boundaries: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired
  }).isRequired
};

export default Chart;
