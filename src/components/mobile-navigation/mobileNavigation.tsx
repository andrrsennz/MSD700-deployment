import React, { useState } from 'react';
import styles from './mobileNavigation.module.css';
import { usePathname } from 'next/navigation';

interface mobileNavigation {
    onClick: () => void;
}

const MobileNavigation: React.FC<mobileNavigation> = ({ onClick }) => {
    const [showMobileNavigation, setShowMobileNavigation] = useState<boolean>(false);
    const pathname = usePathname() || '/unit/control';

    function isActive(href: string) {
        return pathname === href;
    }

    return (

        <div
            className={`${styles.displayNone} ${styles.mobileNavigation} ${styles.mobileDisplayFlex}`}
            onClick={onClick}
        >
            <div className={styles.navigationSection}>
                <div className={`${styles.divNavigation} ${isActive('/unit/control') && styles.active}`}>
                    <img src="/icons/Marker.svg" alt="" />
                    <p>Control Mode</p>
                </div>
                <div className={`${styles.divNavigation} ${isActive('/unit/mapping') && styles.active}`}>
                    <img src="/icons/mapping.svg" alt="" />
                    <p>Mapping</p>
                </div>
                <div className={`${styles.divNavigation} ${isActive('/unit/database') && styles.active}`}>
                    <img src="/icons/Database.svg" alt="" />
                    <p>Database</p>
                </div>
                <div className={`${styles.divNavigation} ${styles.emergencyButton}`}>
                    <img src="/icons/emergency.svg" alt="" />
                    <p>Emergency Stop</p>
                </div>
            </div>
        </div>
    );
};

export default MobileNavigation;
