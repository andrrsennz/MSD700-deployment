// mobiletopsection.tsx
import { FC, useEffect, useState } from 'react';
import styles from './mobileTopSection.module.css';
import CloseButton from "@/components/close-button/closeButton";
import { usePathname } from 'next/navigation'

interface MobileTopSectionProps {
    onConfirmButtonClick: () => void;
}

const MobileTopSection: FC<MobileTopSectionProps> = ({ onConfirmButtonClick }) => {
    const [username, setUsername] = useState<string>('');
    const [full_name, setFull_name] = useState<string>('');
    const [unit_name, setUnit_name] = useState<string>('');

    useEffect(() => {
        setUsername(sessionStorage.getItem('username') || '');
        setFull_name(sessionStorage.getItem('full_name') || '');
        setUnit_name(sessionStorage.getItem('unit_name') || '');
    })

    const pathname = usePathname()

    return (
        <>
            <div className={`${styles.topSection} ${styles.displayFlex} ${styles.displayNone}`}>
                <img src="/images/Backhoe.png" alt="" />
                <p className={pathname != "/" ? styles.mobileDisplayNone : ''}>Loc Map</p>
                <div className={`${styles.displayNone} ${pathname != "/" ? styles.greetings : ""}`}>
                    <img src="/icons/Icon-person-white.svg" alt="" />
                    <p>{`Welcome, ${full_name} - (${unit_name})!`}</p>
                </div>
                <CloseButton onClick={onConfirmButtonClick} />
            </div>
        </>
    );
};

export default MobileTopSection;
