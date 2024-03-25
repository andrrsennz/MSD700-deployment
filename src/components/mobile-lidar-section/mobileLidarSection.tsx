// MobileLidarSection.tsx
import React from 'react';
import styles from './mobileLidarSection.module.css';
import { usePathname } from 'next/navigation';

interface MobileLidarSectionProps {
  isChecked: boolean;
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Accepts the event parameter
}

const MobileLidarSection: React.FC<MobileLidarSectionProps> = ({ isChecked, handleCheckboxChange }) => {
  let pathname = usePathname()
  let iconPage;

  if (pathname == "/unit/control") {
    pathname = "Unit Control"
    iconPage = "/icons/Marker.svg"
  }

  if (pathname == "/unit/mapping") {
    pathname = "Mapping"
    iconPage = "/icons/mapping.svg"
  }

  if (pathname == "/unit/database") {
    pathname = "Database"
    iconPage = "/icons/database.svg"
  }


  return (
    <div className={`${styles.displayNone} ${styles.mobileLidarSection}`}>
      <div className={styles.routeSection}>
        <img src={iconPage} alt="" />
        <p>{pathname}</p>
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
