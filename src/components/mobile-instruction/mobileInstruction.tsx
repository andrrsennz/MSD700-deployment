import React, { useState } from 'react';
import styles from './mobileInstruction.module.css';
import { usePathname } from 'next/navigation';

interface mobileInstruction {
    onClick: () => void;
    imgUrl: String;
}

const MobileInstruction: React.FC<mobileInstruction> = ({ onClick, imgUrl }) => {
    const [showMobileInstruction, setShowMobileInstruction] = useState<boolean>(false);
    const pathname = usePathname() || '/unit/control';

    function isActive(href: string) {
        return pathname === href;
    }

    return (

        <div
            className={`${styles.displayNone} ${styles.mobileInstructionBackground} ${styles.mobileDisplayFlex}`}
            onClick={onClick}
        >
            <div className={styles.mobileInstruction}>
                <img src={`${imgUrl}`} alt="" />
            </div>
        </div>
    );
};

export default MobileInstruction;
