// components/MobileNavigation.tsx
import React from 'react';
import styles from './mobileNavigation.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { changeStatus } from "@/store/stateEmeregencyButton"; // Adjust import path as needed
import { RootState } from '@/store/types';
// import { RootState } from "@/store/store"; // Adjust import path as needed

interface NavLink {
    href: string;
    text: string;
}

const MobileNavigation: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const [buttonActive, setButtonActive] = React.useState(false);
    const pathname = usePathname() || '/unit/control';
    const router = useRouter();

    const { value } = useSelector((state: RootState) => state.emergencyState);
    const dispatch = useDispatch();


    const isActive = (href: string) => pathname === href;

    const goToControlPage = () => router.push('/unit/control');
    const goToMappingPage = () => router.push('/unit/mapping');
    const goToDatabasePage = () => router.push('/unit/database');

    const navLinks: NavLink[] = [
        { href: '/unit/control', text: 'Control Mode' },
        { href: '/unit/mapping', text: 'Mapping' },
        { href: '/unit/database', text: 'Database' },
    ];

    const handleEmergencyButton = () => setButtonActive(!buttonActive);
    const pseudoHandle = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className={`${styles.displayNone} ${styles.mobileNavigation} ${styles.mobileDisplayFlex}`} onClick={onClick}>
            <div className={styles.navigationSection} onClick={pseudoHandle}>
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

                <div className={`${styles.divNavigation} ${styles.emergencyButton} ${value ? styles.emergencyActive : ''}`} onClick={() => dispatch(changeStatus())}>
                    <img src="/icons/emergency.svg" alt="" />
                    <p>Emergency Stop</p>
                </div>
            </div>
        </div>
    );
};

export default MobileNavigation;
