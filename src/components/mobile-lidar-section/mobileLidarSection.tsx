// MobileLidarSection.tsx
import React from 'react';
import styles from './mobileLidarSection.module.css';

interface MobileLidarSectionProps {
  isChecked: boolean;
  handleCheckboxChange: () => void;
}

const MobileLidarSection: React.FC<MobileLidarSectionProps> = ({ isChecked, handleCheckboxChange }) => {
  return (
    <div className={`${styles.displayNone} ${styles.mobileLidarSection}`}>
      <div className={styles.routeSection}>
        <img src="/icons/Marker.svg" alt="" />
        <p>Control Mode</p>
      </div>
      <div className={styles.lidarSection}>
        <p>LIDAR</p>
      </div>

      <div className={styles.lidarButton}>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            className={styles.toggleInput}
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
}

export default MobileLidarSection;
