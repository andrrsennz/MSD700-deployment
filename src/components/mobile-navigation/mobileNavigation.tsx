import React, { useState } from 'react';
import styles from './mobileNavigation.module.css';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface mobileNavigation {
    onClick: () => void;
}

interface NavLink {
    href: string;
    text: string;
}

const MobileNavigation: React.FC<mobileNavigation> = ({ onClick }) => {
    const pathname = usePathname() || '/unit/control';
    const router = useRouter();

    function isActive(href: string) {
        return pathname === href;
    }

    const goToControlPage = () => {
        router.push('/unit/control');
    };

    const goToMappingPage = () => {
        router.push('/unit/mapping');
    };

    const goToDatabasePage = () => {
        router.push('/unit/database');
    };

    const navLinks: NavLink[] = [
        { href: '/unit/control', text: 'Control Mode' },
        { href: '/unit/mapping', text: 'Mapping' },
        { href: '/unit/database', text: 'Database' },
    ];

    return (

        <div
            className={`${styles.displayNone} ${styles.mobileNavigation} ${styles.mobileDisplayFlex}`}
            onClick={onClick}
        >
            <div className={styles.navigationSection}>
                <div onClick={goToControlPage} className={`${styles.divNavigation} ${isActive(navLinks[0].href) && styles.active}`}>
                    <img src="/icons/Marker.svg" alt="" />
                    <p>{navLinks[0].text}</p>
                </div>

                <div onClick={goToMappingPage} className={`${styles.divNavigation} ${isActive(navLinks[1].href) && styles.active}`}>
                    <img src="/icons/mapping.svg" alt="" />
                    <p>{navLinks[1].text}</p>
                </div>

                <div onClick={goToDatabasePage} className={`${styles.divNavigation} ${isActive(navLinks[2].href) && styles.active}`}>
                    <img src="/icons/Database.svg" alt="" />
                    <p>{navLinks[2].text}</p>
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
