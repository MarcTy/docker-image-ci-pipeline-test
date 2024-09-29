import time
import json
import paho.mqtt.client as mqtt

# Define the MQTT server details
MQTT_BROKER = 'your_mqtt_broker_address'  # e.g., 'broker.hivemq.com'
MQTT_PORT = 1883  # Standard MQTT port
MQTT_TOPIC = 'gnssublox'  # Replace with your topic

# Create an MQTT client instance
client = mqtt.Client()

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)

# Example GPS data (replace with actual values)
ubloxmeta = {
    "latitude": 34.0522,  # Example latitude
    "longitude": -118.2437,  # Example longitude
    "north_south": "N",  # North or South
    "east_west": "W",  # East or West
    "speed": 12.5,  # Speed in m/s
    "time": "12:34:56",  # Current time
    "date": "2024-09-28"  # Current date
}

# Function to publish GPS data
def publish_gps_data(ubloxmeta):

    # Convert the dictionary to a JSON string
    gps_data_json = json.dumps(ubloxmeta)

    # Publish the JSON string to the specified topic
    client.publish(MQTT_TOPIC, gps_data_json, qos=1)
    print("Published:", gps_data_json)

# Publish data periodically
try:
    while True:
        publish_gps_data(ubloxmeta)  # Replace with actual dynamic data if available
        time.sleep(5)  # Publish every 5 seconds
except KeyboardInterrupt:
    print("Publishing stopped.")
finally:
    client.disconnect()