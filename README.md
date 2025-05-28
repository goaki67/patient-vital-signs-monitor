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
- Manages data persistence and security
- Handles real-time data streaming

### 🌐 Frontend
The `frontend/` directory contains the web application that:
- Displays real-time vital signs data
- Provides a user interface for medical staff
- Visualizes patient data through charts and graphs
- Manages user authentication and authorization

## Getting Started

Detailed setup instructions for each component can be found in their respective directories:
- [Arduino Setup](./arduino/README.md)
- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)

## License

[Add appropriate license information]

## Contributing

[Add contribution guidelines] 