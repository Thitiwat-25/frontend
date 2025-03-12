"use client";
import { useState } from 'react';

export default function Location() {
    const [location, setLocation] = useState(null);
    const [travelTime, setTravelTime] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    setLocation({ latitude, longitude });
                    calculateTravelTime(latitude, longitude);
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    const calculateTravelTime = async (latitude, longitude) => {
        const response = await fetch('http://<your-ec2-public-ip>:5000/calculate-travel-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: `${latitude},${longitude}`,
                destination: '37.7749,-122.4194', // Parking lot location
            }),
        });
        const data = await response.json();
        if (response.ok) {
            setTravelTime(data.travel_time);
            fetchPrediction(data.travel_time);
        } else {
            setError("Error calculating travel time: " + data.error);
        }
    };

    const fetchPrediction = async (arrivalTime) => {
        const response = await fetch('http://<your-ec2-public-ip>:5000/fetch-prediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arrival_time: arrivalTime }),
        });
        const data = await response.json();
        if (response.ok) {
            setPrediction(data.predicted_empty_spots);
        } else {
            setError("Error fetching prediction: " + data.error);
        }
    };

    return (
        <div>
            <h1>Parking Prediction</h1>
            <button onClick={getLocation}>Get My Location</button>
            {location && (
                <div>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                </div>
            )}
            {travelTime && <p>Travel Time: {travelTime}</p>}
            {prediction && <p>Predicted Empty Spots: {prediction}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}