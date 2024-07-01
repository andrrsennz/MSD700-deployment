import React, { useState, useEffect } from 'react';
import styles from './emergencyButton.module.css';

const EmergencyButton = () => {
    // Initialize state with the value from localStorage or default to false
    const [emergencyStatus, setEmergencyStatus] = useState<boolean>(false);

    useEffect(() => {
        // Read value from localStorage when the component mounts
        const savedStatus = localStorage.getItem('emergencyStatus');
        if (savedStatus !== null) {
            setEmergencyStatus(JSON.parse(savedStatus));
        }
    }, []);

    // Handle the emergency status toggle
    const handleEmergencyStatus = () => {
        setEmergencyStatus((prevStatus) => {
            const newStatus = !prevStatus;
            localStorage.setItem('emergencyStatus', JSON.stringify(newStatus));
            return newStatus;
        });
    };

    return (
        <div
            className={`${styles.emergencyButton} ${emergencyStatus ? styles.emergencyButtonActive : ''}`}
            onClick={handleEmergencyStatus}
        >
            <img src="/icons/emergency.svg" alt="Emergency Icon" />
            <p>Emergency Stop</p>
        </div>
    );
};

export default EmergencyButton;
