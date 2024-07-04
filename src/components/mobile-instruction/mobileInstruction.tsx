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

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (

        <div
            className={`${styles.displayNone} ${styles.mobileInstructionBackground} ${styles.mobileDisplayFlex}`}
            onClick={onClick}
        >
            <div className={`${styles.mobileInstruction} ${pathname == "/unit/mapping" || pathname == "/unit/database" ? styles.mobileFitContent : ""}`} onClick={onClick}>
                <img src={`${imgUrl}`} alt="" onClick={handleImageClick} />
            </div>
        </div>
    );
};

export default MobileInstruction;
