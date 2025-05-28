import React from 'react';
import './Button.css';

// קומפוננטת כפתור שמציגה מספר מטופל ומנווטת לדף הניטור שלו
function Button({ id }) {
  // פונקציה שמנווטת לדף של המטופל כשלוחצים על הכפתור
  const handleClick = () => {
    window.location.href = `${window.location.origin}/${id}`;
  };

  return (
    // כפתור עם אפקט זוהר שמציג את מספר המטופל
    <button className="glow-button" onClick={handleClick}>
      Patient {id}
    </button>
  );
}

export default Button;
