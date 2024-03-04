// MobileBottomSection.tsx
import React from 'react';
import styles from './mobileBottomSection.module.css';
import Footer from "@/components/footer/footer";

interface MobileBottomSectionProps {
    handleMobileNavigation: () => void;
    handleMapPreview: () => void;
    handleMobileInstruction: () => void;
}

const MobileBottomSection: React.FC<MobileBottomSectionProps> = ({ handleMobileNavigation, handleMapPreview, handleMobileInstruction }) => {
    return (
        <div className={`${styles.displayNone} ${styles.mobileBottomSection}`}>
            <div className={`${styles.navigationMobileButton} ${styles.bottomSectionButton}`} onClick={() => handleMobileNavigation()}>
                <img src="/icons/list.svg" alt="" />
            </div>

            <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={handleMapPreview}>
                <img src="/icons/Webcam.svg" alt="" />
            </div>

            <div className={`${styles.webcamButton} ${styles.webcamIcon} ${styles.bottomSectionButton}`} onClick={() => handleMobileInstruction()}>
                <img src="/icons/information-circle-svgrepo-com.svg" alt="" />
            </div>

            <Footer status={false /* or false */} />
        </div>
    );
}

export default MobileBottomSection;
