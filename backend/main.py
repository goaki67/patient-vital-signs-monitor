import os
import json
import time
import threading
from datetime import datetime
from flask import Flask, jsonify
import serial
import serial.tools.list_ports

# Configuration
DATA_DIR = "./data"
DEVICE_MAP_FILE = "device_map.json"
ARDUINO_HANDSHAKE = "ARDUINO_READY"
ARDUINO_ERROR = "ARDUINO_ERROR"

app = Flask(__name__)

data_lock = threading.Lock()
data_store = {}            # arduino_id -> list of {timestamp, hr, spo2, temp}
port_threads = {}          # port_path -> thread
arduino_ids = {}           # port.serial_number -> arduino_id

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Load device map
if os.path.exists(DEVICE_MAP_FILE):
    with open(DEVICE_MAP_FILE, 'r') as f:
        arduino_ids = json.load(f)

# Load stored data
for filename in os.listdir(DATA_DIR):
    arduino_id = filename.replace(".json", "")
    with open(os.path.join(DATA_DIR, filename), 'r') as f:
        data_store[arduino_id] = json.load(f)


def save_device_map():
    with open(DEVICE_MAP_FILE, 'w') as f:
        json.dump(arduino_ids, f)


def save_data(arduino_id):
    with open(os.path.join(DATA_DIR, f"{arduino_id}.json"), 'w') as f:
        json.dump(data_store.get(arduino_id, []), f)


def process_line(arduino_id, line):
    if line in [ARDUINO_HANDSHAKE, ARDUINO_ERROR]:
        return  # Ignore handshake lines

    try:
        parts = dict(part.split("=") for part in line.split(";") if "=" in part)
        record = {
            "timestamp": time.time(),
            "hr": float(parts.get("hr", 0)),
            "spo2": float(parts.get("spo2", 0)),
            "temp": float(parts.get("temp", 0))
        }
        with data_lock:
            if arduino_id not in data_store:
                data_store[arduino_id] = []
            data_store[arduino_id].append(record)
            save_data(arduino_id)
    except Exception as e:
        print(f"[ERROR] Failed to process line '{line}': {e}")


def read_serial(port_path, arduino_id):
    try:
        ser = serial.Serial(port_path, baudrate=115200, timeout=1)
        while True:
            line = ser.readline().decode(errors='ignore').strip()
            if line:
                process_line(arduino_id, line)
    except Exception as e:
        print(f"[ERROR] Serial read failed for {port_path}: {e}")


def is_arduino_device(port_path):
    try:
        ser = serial.Serial(port_path, baudrate=115200, timeout=2)
        time.sleep(5)  # Give time for device to send handshake after reset
        line = ser.readline().decode(errors='ignore').strip()
        ser.close()
        if line == ARDUINO_ERROR:
            print(f"[ERROR] Port {port_path} failed to initialize sensors")
            return False
        return line == ARDUINO_HANDSHAKE
    except Exception as e:
        print(f"[INFO] Port {port_path} did not respond as Arduino: {e}")
        return False


def detect_arduinos():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if port.serial_number and port.device not in port_threads:
            if is_arduino_device(port.device):
                serial_number = port.serial_number
                arduino_id = arduino_ids.get(serial_number)
                if not arduino_id:
                    arduino_id = f"arduino_{len(arduino_ids)+1}"
                    arduino_ids[serial_number] = arduino_id
                    save_device_map()
                thread = threading.Thread(target=read_serial, args=(port.device, arduino_id), daemon=True)
                thread.start()
                port_threads[port.device] = thread


def periodic_detection():
    while True:
        detect_arduinos()
        time.sleep(5)


@app.route('/')
def list_arduinos():
    with data_lock:
        return jsonify(list(data_store.keys()))


@app.route('/<arduino_id>')
def get_data(arduino_id):
    with data_lock:
        return jsonify(data_store.get(arduino_id, []))


if __name__ == '__main__':
    threading.Thread(target=periodic_detection, daemon=True).start()
    app.run(host='0.0.0.0', port=8080, threaded=True)

