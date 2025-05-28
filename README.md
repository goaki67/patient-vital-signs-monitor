# Patient Vital Signs Monitoring System

This project is developed as part of a school assignment/project. It implements a comprehensive patient vital signs monitoring system consisting of three main components:

## Project Structure

### 🔌 Arduino
The `arduino/` directory contains the embedded system code that interfaces with various sensors to collect vital sign data from patients. This component is responsible for:
- Reading sensor data for vital signs
- Processing raw sensor data
- Transmitting data to the backend system

### 🖥️ Backend
The `backend/` directory houses the server-side application that:
- Receives data from Arduino devices
- Processes and stores vital signs data
- Provides API endpoints for the frontend
- Handles real-time data streaming

### 🌐 Frontend
The `frontend/` directory contains the web application that:
- Displays real-time vital signs data
- Provides a user interface for medical staff
- Visualizes patient data through charts and graphs

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 