#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

// קובע את תקופת הדיווח (במילישניות)
#define REPORTING_PERIOD_MS 1000

// יוצר אובייקטים לשימוש בחיישנים
MAX30100 sensor; // נדרש למדידת הטמפרטורה
PulseOximeter pox; // נדרש לשאר המדידות
uint32_t tsLastReport = 0;

// פונקציה לקריאת טמפרטורת החיישן
float readTemperature() {
    // מתחיל מדידת טמפרטורה
    sensor.startTemperatureSampling();
    // בודק שעבר מספיק זמן כדי לקלוט את הטמפרטורה
    for (int i = 0; i < 100 && !sensor.isTemperatureReady(); i++) {
        delay(10);
    }
    // מחזיר את ערך הטמפרטורה הנמדד
    return sensor.retrieveTemperature();
}

void setup() {
    // מאתחל תקשורת Serial
    Serial.begin(115200);
    Wire.begin();
    delay(1000);
    // מעדכן את ה-Raspberry PI שהארדואינו מוכן
    Serial.println("ARDUINO_READY");

    // מאתחל את החיישנים, מפסיק את התוכנית אם יש שגיאה באתחול
    if (!sensor.begin() || !pox.begin()) {
        Serial.println("ARDUINO_ERROR");
        for (;;);
    }

    // מעדכן נתונים טכניים בשביל החיישנים
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
    sensor.setMode(MAX30100_MODE_SPO2_HR);
    sensor.setHighresModeEnabled(true);
}



void loop() {
    // מעדכן את המידע של החיישנים
    sensor.update();
    pox.update();

    // בודק אם עבר מספיק זמן מאז השליחה האחרונה
    if (millis() - tsLastReport > REPORTING_PERIOD_MS) {
        tsLastReport = millis();

        // קורא את קצב הדופק
        float heartRate = pox.getHeartRate();
        // קורא את רמת החמצן בדם (SpO2)
        float spo2 = pox.getSpO2();
        // קורא את הטמפרטורה
        float temperature = readTemperature();

        // שולח את המידע דרך הסיריאל פורט ל Raspberry PI
        Serial.print("hr=");    Serial.print(heartRate);
        Serial.print(";spo2="); Serial.print(spo2);
        Serial.print(";temp="); Serial.println(temperature);
    }
}
