import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import styles from './lidarSwitch.module.css'; // Adjust the path as needed

interface LidarSwitchProps {
    backendUrl: string;
}

const LidarSwitch: React.FC<LidarSwitchProps> = ({ backendUrl }) => {
    const [isChecked, setIsChecked] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('isChecked');
            if (saved) {
                setIsChecked(JSON.parse(saved));
            }
        }
    }, []);

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const checked = event.target.checked;
        setIsChecked(checked);

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('isChecked', JSON.stringify(checked));
        }

        setLidar(checked, false);
    };

    const setLidar = (enable: boolean, use_own_map: boolean): void => {
        axios.post(`${backendUrl}/api/lidar`, {
            enable: enable,
            use_own_map: use_own_map,
            unit_name: sessionStorage.getItem('unit_name')
        }, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });

        // Assuming showImage is a global variable or state
        // showImage = enable;
    };

    return (
        <label className={styles.toggleSwitch}>
            <input
                type="checkbox"
                className={styles.toggleInput}
                checked={isChecked}
                onChange={handleCheckboxChange}
            />
            <span className={styles.slider}></span>
        </label>
    );
};

export default LidarSwitch;
