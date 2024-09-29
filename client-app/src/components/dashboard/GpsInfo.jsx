import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './GpsInfo.css';

import { UseSettingsGlobalState } from '../../context/SettingsContext.jsx';

function GpsInfo() {
    const { state } = UseSettingsGlobalState();
    const [ubloxmeta, setUbloxMeta] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [client, setClient] = useState(null);

    useEffect(() => {
        const mqttClient = mqtt.connect(`${process.env.MQTT_SERVER_URL}`);
        
        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            mqttClient.subscribe('gnssublox', { qos: state.telemetry_qos }, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                } else {
                    console.log('Subscribed to topic: gnssublox');
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                setUbloxMeta(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });

        setClient(mqttClient);

        return () => {
            if (mqttClient) {
                mqttClient.unsubscribe('gnssublox');
                mqttClient.end();
            }
        };
    }, [state.telemetry_qos]);

    return (
        <div className="gps-data-container">
            <div className="gps-data-header">
                <img src="/devices/ublox-gnss-antenna.png" alt="ublox-gnss" className="gps-image" />
                <h6>u-blox GNSS antenna</h6>
            </div>
            <hr className="styled-line" />
            <div className="gps-data-entry"><strong>Latitude: {ubloxmeta?.latitude ?? "N/A"}</strong></div>
            <div className="gps-data-entry"><strong>Longitude: {ubloxmeta?.longitude ?? "N/A"}</strong></div>
            <div className="gps-data-entry"><strong>North/South: {ubloxmeta?.north_south ?? "N/A"}</strong></div>
            <div className="gps-data-entry"><strong>East/West: {ubloxmeta?.east_west ?? "N/A"}</strong></div>
            <div className="gps-data-entry"><strong>Speed: {ubloxmeta?.speed ?? "N/A"} m/s</strong></div>
            <div className="gps-data-entry"><strong>Time: {ubloxmeta?.time ?? "N/A"}</strong></div>
            <div className="gps-data-entry"><strong>Date: {ubloxmeta?.date ?? "N/A"}</strong></div>
        </div>
    );
}

export default GpsInfo;
