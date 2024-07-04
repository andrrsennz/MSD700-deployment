import React, { useEffect } from 'react';
import axios from 'axios';
import styles from './lidarSwitch.module.css'; // Adjust the path as needed
import { useSelector, useDispatch } from 'react-redux';
import { changeStatus, setStatus } from '@/store/stateLidar'; // Adjust import path as needed
import { RootState } from '@/store/types';

interface LidarSwitchProps {
    backendUrl: string;
    onData: (data: any) => void; // Adjust the type of data as needed
}

const LidarSwitch: React.FC<LidarSwitchProps> = ({ backendUrl, onData }) => {
    const { value } = useSelector((state: RootState) => state.lidarState);
    const dispatch = useDispatch();

    useEffect(() => {
        // Initialize state from localStorage
        const savedStatus = localStorage.getItem('isChecked');
        if (savedStatus !== null) {
            dispatch(setStatus(JSON.parse(savedStatus)));
        }
    }, [dispatch]);

    const handleCheckboxChange = () => {
        dispatch(changeStatus());
        // Save state to localStorage
        localStorage.setItem('isChecked', JSON.stringify(!value));
        onData(!value);
    };

    return (
        <label className={styles.toggleSwitch}>
            <input
                type="checkbox"
                className={styles.toggleInput}
                checked={value}
                onChange={handleCheckboxChange}
            />
            <span className={styles.slider}></span>
        </label>
    );
};

export default LidarSwitch;
